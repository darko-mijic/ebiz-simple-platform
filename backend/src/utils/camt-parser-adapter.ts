/**
 * CAMT Parser Adapter
 * 
 * This utility bridges the camt-parser library with our database schema.
 * It transforms the parsed CAMT data into structures that match our 
 * database models, making it easy to store bank statement data.
 */

import { PrismaClient, CreditDebit, TransactionStatus, BalanceType } from '@prisma/client';
import { parseCamt053, BankStatementDocument, BankStatement as CamtStatement, 
         Transaction as CamtTransaction, Balance as CamtBalance } from 'camt-parser';
import { ReadStream } from 'fs';

const prisma = new PrismaClient();

// Define interfaces to match the CAMT parser structure
interface TxSummary {
  totalCreditEntries: { numberOfEntries: number; sum: number };
  totalDebitEntries: { numberOfEntries: number; sum: number };
}

interface BankTxCode {
  domain?: {
    code?: string;
    family?: {
      code?: string;
      subFamilyCode?: string;
    };
  };
}

/**
 * Processes a CAMT.053 XML file and stores the data in the database
 * @param xmlContent The CAMT.053 XML content as string
 * @param bankAccountId The database ID of the bank account
 * @returns The created bank statement
 */
export async function processCamtFile(
  xmlContent: string,
  bankAccountId: string
) {
  try {
    // Parse the CAMT XML
    const parsedDocument = await parseCamt053(xmlContent);
    
    // Process each statement in the document
    const results = await Promise.all(
      parsedDocument.statements.map(statement => 
        processCamtStatement(statement, bankAccountId, parsedDocument)
      )
    );
    
    return results;
  } catch (error) {
    console.error('Error processing CAMT file:', error);
    throw error;
  }
}

/**
 * Process a single CAMT statement and store it in the database
 */
async function processCamtStatement(
  statement: CamtStatement,
  bankAccountId: string,
  document: BankStatementDocument
) {
  // Get account info
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id: bankAccountId },
    select: { companyId: true }
  });
  
  if (!bankAccount) {
    throw new Error(`Bank account with ID ${bankAccountId} not found`);
  }
  
  // Map CAMT balance types to our balance types
  const openingBalance = findBalance(statement.balances, 'OPBD');
  const closingBalance = findBalance(statement.balances, 'CLBD');
  
  if (!openingBalance || !closingBalance) {
    throw new Error('Statement missing required balance information');
  }
  
  // Extract credit/debit totals from transaction summary
  const txSummary: TxSummary = statement.transactionSummary as TxSummary || { 
    totalCreditEntries: { numberOfEntries: 0, sum: 0 },
    totalDebitEntries: { numberOfEntries: 0, sum: 0 }
  };
  
  // Create the bank statement record
  const bankStatement = await prisma.bankStatement.create({
    data: {
      bankAccountId,
      statementId: statement.statementId,
      sequenceNumber: parseInt(statement.sequenceNumber),
      legalSequenceNumber: parseInt(statement.sequenceNumber),
      messageId: document.header.messageId,
      reportingSource: statement.reportingSource,
      creationDate: new Date(statement.creationDateTime),
      fromDate: new Date(statement.fromDateTime),
      toDate: new Date(statement.toDateTime),
      rawData: statement as any, // Store the full parsed statement
      openingBalance: parseFloat(openingBalance.amount.value.toString()),
      closingBalance: parseFloat(closingBalance.amount.value.toString()),
      currency: statement.account.currency,
      totalCreditEntries: txSummary.totalCreditEntries.numberOfEntries,
      totalCreditAmount: txSummary.totalCreditEntries.sum,
      totalDebitEntries: txSummary.totalDebitEntries.numberOfEntries,
      totalDebitAmount: txSummary.totalDebitEntries.sum,
    }
  });
  
  // Create balance history records
  await createBalanceHistory(bankAccountId, openingBalance, 'OPBD');
  await createBalanceHistory(bankAccountId, closingBalance, 'CLBD');
  
  // Process all transactions in the statement
  if (statement.transactions?.length) {
    await Promise.all(
      statement.transactions.map(tx => 
        processTransaction(tx, bankStatement.id, bankAccountId)
      )
    );
  }
  
  return bankStatement;
}

/**
 * Find a balance by type in the balances array
 */
function findBalance(balances: CamtBalance[], type: string): CamtBalance | undefined {
  return balances.find(balance => balance.type === type);
}

/**
 * Create a balance history record
 */
async function createBalanceHistory(
  bankAccountId: string,
  balance: CamtBalance,
  balanceType: string
) {
  const date = new Date(balance.date);
  
  await prisma.balanceHistory.create({
    data: {
      bankAccountId,
      date,
      balance: parseFloat(balance.amount.value.toString()),
      credited: 0, // These would be calculated from transactions
      debited: 0,  // These would be calculated from transactions
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      balanceType: mapBalanceType(balanceType),
      creditDebit: balance.creditDebitIndicator === 'CRDT' 
        ? CreditDebit.CREDIT 
        : CreditDebit.DEBIT
    }
  });
}

/**
 * Process a single transaction from CAMT and store it in the database
 */
async function processTransaction(
  camtTx: CamtTransaction, 
  bankStatementId: string,
  bankAccountId: string
) {
  // Extract transaction details from the CAMT transaction
  const details = camtTx.details?.[0]; // Get the first detail entry
  
  // Extract bank transaction code parts
  const bankTxCode: BankTxCode = camtTx.bankTransactionCode as BankTxCode || {};
  const domain = bankTxCode.domain?.code;
  const family = bankTxCode.domain?.family?.code;
  const subFamily = bankTxCode.domain?.family?.subFamilyCode;
  
  // Create the transaction
  return prisma.transaction.create({
    data: {
      bankStatementId,
      bankAccountId,
      amount: parseFloat(camtTx.amount.value.toString()),
      currency: camtTx.amount.currency,
      creditDebit: camtTx.creditDebitIndicator === 'CRDT' 
        ? CreditDebit.CREDIT 
        : CreditDebit.DEBIT,
      status: mapTransactionStatus(camtTx.status),
      bookingDate: new Date(camtTx.bookingDate),
      valueDate: new Date(camtTx.valueDate),
      
      // Enhanced CAMT fields
      accountServicerRef: camtTx.accountServicerReference,
      endToEndId: details?.references?.endToEndId,
      reversalIndicator: camtTx.reversalIndicator || false,
      bankTransactionCode: domain,
      bankTransactionFamily: family,
      bankTransactionSubFamily: subFamily,
      
      // Store all references, related parties, and remittance info
      references: details?.references || {},
      relatedParties: details?.relatedParties || {},
      remittanceInfo: details?.remittanceInformation || {},
      
      // Extract structured reference information
      structuredReference: details?.remittanceInformation?.structured?.creditorReferenceInformation?.reference,
      referenceType: details?.remittanceInformation?.structured?.creditorReferenceInformation?.type?.codeOrProprietary?.code,
      additionalRemittanceInfo: Array.isArray(details?.remittanceInformation?.structured?.additionalRemittanceInformation)
        ? details?.remittanceInformation?.structured?.additionalRemittanceInformation.join(', ')
        : details?.remittanceInformation?.structured?.additionalRemittanceInformation
    }
  });
}

/**
 * Map CAMT balance type to our BalanceType enum
 */
function mapBalanceType(camtBalanceType: string): BalanceType {
  const typeMap: Record<string, BalanceType> = {
    'OPBD': BalanceType.OPBD,
    'CLBD': BalanceType.CLBD,
    'ITBD': BalanceType.ITBD,
    'PRCD': BalanceType.PRCD,
    'FWAV': BalanceType.FWAV,
    'CLAV': BalanceType.CLAV,
  };
  
  return typeMap[camtBalanceType] || BalanceType.CLBD;
}

/**
 * Map CAMT transaction status to our TransactionStatus enum
 */
function mapTransactionStatus(camtStatus: string): TransactionStatus {
  const statusMap: Record<string, TransactionStatus> = {
    'BOOK': TransactionStatus.BOOKED,
    'PDNG': TransactionStatus.PENDING,
    'INFO': TransactionStatus.INFORMATION,
    'RJCT': TransactionStatus.REJECTED,
  };
  
  return statusMap[camtStatus] || TransactionStatus.COMPLETED;
}

/**
 * Example usage in an API controller:
 * 
 * async function uploadCamtStatement(req, res) {
 *   const { bankAccountId } = req.params;
 *   const xmlContent = req.file.buffer.toString();
 *   
 *   try {
 *     const result = await processCamtFile(xmlContent, bankAccountId);
 *     res.json({
 *       success: true,
 *       statementId: result[0].id,
 *       transactionCount: result[0].transactions.length
 *     });
 *   } catch (error) {
 *     res.status(400).json({ 
 *       success: false, 
 *       error: error.message 
 *     });
 *   }
 * }
 */ 