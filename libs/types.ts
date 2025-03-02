// User and Auth types
export interface User {
  id: string;
  googleId?: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  localVatId: string;
  euVatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCompany {
  userId: string;
  companyId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// Bank and transaction types
export interface BankAccount {
  id: string;
  companyId: string;
  iban: string;
  currency: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankStatement {
  id: string;
  bankAccountId: string;
  statementId: string;
  sequenceNumber: number;
  creationDate: Date;
  fromDate: Date;
  toDate: Date;
  rawData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  bankStatementId: string;
  bankAccountId: string;
  amount: number;
  currency: string;
  creditDebit: 'CREDIT' | 'DEBIT';
  status: string;
  bookingDate: Date;
  valueDate: Date;
  references: Record<string, any>;
  relatedParties: Record<string, any>;
  remittanceInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Document types
export interface Document {
  id: string;
  companyId: string;
  filePath: string;
  uploadDate: Date;
  transactionId?: string;
  parsedData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 