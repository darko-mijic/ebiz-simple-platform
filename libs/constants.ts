// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: '/users',
  COMPANIES: '/companies',
  BANK_ACCOUNTS: '/bank-accounts',
  BANK_STATEMENTS: {
    BASE: '/bank-statements',
    UPLOAD: '/bank-statements/upload',
  },
  TRANSACTIONS: '/transactions',
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
  },
  CHAT: {
    QUERY: '/chat/query',
  },
};

// Currency codes
export const CURRENCY_CODES = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
};

// Transaction types
export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
};

// Document statuses
export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  LINKED: 'LINKED',
  ERROR: 'ERROR',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ebiz-auth-token',
  USER: 'ebiz-user',
  SELECTED_COMPANY: 'ebiz-selected-company',
}; 