// Bank account interfaces
export interface BalanceHistoryItem {
  value: number;
  month: number;
  credited: number;
  debited: number;
  date: string;
}

export interface BankAccount {
  id: number;
  name: string;
  iban: string;
  currency: string;
  company_id: number;
  totalStatements: number;
  lastStatement: string;
  balance: number;
  previousBalance: number;
  balanceHistory: BalanceHistoryItem[];
}

// Transaction interfaces
export interface RemittanceInfo {
  unstructured: string;
}

export interface RelatedParty {
  name: string;
}

export interface RelatedParties {
  debtor?: RelatedParty;
  creditor?: RelatedParty;
}

export interface Transaction {
  id: number;
  bank_statement_id: number;
  bank_account_id: number;
  amount: number;
  currency: string;
  credit_debit: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  booking_date: string;
  value_date: string;
  remittance_info: RemittanceInfo;
  bank_account: {
    name: string;
  };
  related_parties: RelatedParties;
}

// Document interfaces
export interface Vendor {
  name: string;
}

export interface ParsedData {
  type: 'invoice' | 'receipt';
  status: 'parsed' | 'needs_review';
  issue?: string;
  invoice_number?: string;
  receipt_number?: string;
  total_amount: number;
  currency: string;
  vendor: Vendor;
}

export interface Document {
  id: number;
  filename: string;
  parsed_data: ParsedData;
  upload_date: string;
  status: 'processed' | 'needs_attention';
}

// Alert interfaces
export interface Alert {
  id: number;
  type: 'gap' | 'review';
  account: string;
  message: string;
}

// Chart interfaces for tooltip props
export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  currency?: string;
}

// Dashboard interfaces
export interface AccountSummaryProps {
  totalBalance: number;
  accounts: BankAccount[];
}

export interface RecentTransactionsProps {
  transactions: Transaction[];
}

export interface RecentDocumentsProps {
  documents: Document[];
}

export interface AlertsProps {
  alerts: Alert[];
} 