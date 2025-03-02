// Mock data for dashboard components

// Bank account mock data
export const mockBankAccounts = [
  {
    id: 1,
    name: "Main Business Account",
    iban: "DE89370400440532013000",
    currency: "EUR",
    company_id: 1,
    totalStatements: 3,
    lastStatement: "2024-02-29",
    balance: 1500000, // in cents
    previousBalance: 1250000, // last month balance in cents
    balanceHistory: [1200000, 1250000, 1300000, 1350000, 1400000, 1450000, 1500000].map((value, i) => ({
      value,
      month: i,
      credited: Math.floor(Math.random() * 100000),
      debited: Math.floor(Math.random() * 50000),
      date: new Date(2024, i, 1).toISOString()
    }))
  },
  {
    id: 2,
    name: "Operating Expenses",
    iban: "DE91100000000123456789",
    currency: "EUR",
    company_id: 1,
    totalStatements: 1,
    lastStatement: "2024-01-31",
    balance: 50000, // in cents
    previousBalance: 75000, // last month balance in cents
    balanceHistory: [100000, 90000, 80000, 70000, 60000, 75000, 50000].map((value, i) => ({
      value,
      month: i,
      credited: Math.floor(Math.random() * 20000),
      debited: Math.floor(Math.random() * 30000),
      date: new Date(2024, i, 1).toISOString()
    }))
  }
];

// Transaction mock data
export const mockTransactions = [
  {
    id: 1,
    bank_statement_id: 1,
    bank_account_id: 1,
    amount: 1500000, // amount in cents
    currency: "EUR",
    credit_debit: "credit" as const,
    status: "completed" as const,
    booking_date: "2024-02-15T10:30:00Z",
    value_date: "2024-02-15T10:30:00Z",
    remittance_info: {
      unstructured: "Invoice payment INVOICE/2024/001"
    },
    bank_account: {
      name: "Main Business Account"
    },
    related_parties: {
      debtor: { name: "Acme Corp" }
    }
  },
  {
    id: 2,
    bank_statement_id: 1,
    bank_account_id: 1,
    amount: -50000, // amount in cents
    currency: "EUR",
    credit_debit: "debit" as const,
    status: "completed" as const,
    booking_date: "2024-02-16T14:20:00Z",
    value_date: "2024-02-16T14:20:00Z",
    remittance_info: {
      unstructured: "Monthly utility payment"
    },
    bank_account: {
      name: "Operating Expenses"
    },
    related_parties: {
      creditor: { name: "Utility Provider" }
    }
  },
  {
    id: 3,
    bank_statement_id: 1,
    bank_account_id: 1,
    amount: 250000, // amount in cents
    currency: "EUR",
    credit_debit: "credit" as const,
    status: "completed" as const,
    booking_date: "2024-02-18T09:15:00Z",
    value_date: "2024-02-18T09:15:00Z",
    remittance_info: {
      unstructured: "Service payment INVOICE/2024/003"
    },
    bank_account: {
      name: "Main Business Account"
    },
    related_parties: {
      debtor: { name: "TechCorp Ltd" }
    }
  },
  {
    id: 4,
    bank_statement_id: 1,
    bank_account_id: 2,
    amount: -35000, // amount in cents
    currency: "EUR",
    credit_debit: "debit" as const,
    status: "completed" as const,
    booking_date: "2024-02-20T11:45:00Z",
    value_date: "2024-02-20T11:45:00Z",
    remittance_info: {
      unstructured: "Office supplies"
    },
    bank_account: {
      name: "Operating Expenses"
    },
    related_parties: {
      creditor: { name: "Office Supply Co." }
    }
  }
];

// Document mock data
export const mockDocuments = [
  {
    id: 1,
    filename: "invoice-2024-001.pdf",
    parsed_data: {
      type: "invoice" as const,
      status: "parsed" as const,
      invoice_number: "INV-2024-001",
      total_amount: 1500000,
      currency: "EUR",
      vendor: {
        name: "Acme Corp"
      }
    },
    upload_date: "2024-02-15T10:30:00Z",
    status: "processed" as const
  },
  {
    id: 2,
    filename: "invoice-2024-002.pdf",
    parsed_data: {
      type: "invoice" as const,
      status: "needs_review" as const,
      issue: "Missing vendor tax ID",
      invoice_number: "INV-2024-002",
      total_amount: 50000,
      currency: "EUR",
      vendor: {
        name: "Utility Provider"
      }
    },
    upload_date: "2024-02-16T14:20:00Z",
    status: "needs_attention" as const
  },
  {
    id: 3,
    filename: "receipt-2024-001.jpg",
    parsed_data: {
      type: "receipt" as const,
      status: "needs_review" as const,
      issue: "Unclear total amount",
      receipt_number: "R-2024-001",
      total_amount: 15000,
      currency: "EUR",
      vendor: {
        name: "Office Supply Co."
      }
    },
    upload_date: "2024-02-20T11:45:00Z",
    status: "needs_attention" as const
  }
];

// Alert mock data
export const mockAlerts = [
  {
    id: 1,
    type: "gap" as const,
    account: "Main Business Account",
    message: "Missing statements between sequence numbers 2 and 4"
  },
  {
    id: 2,
    type: "review" as const,
    account: "",
    message: "2 documents need your attention"
  }
];

// Chart color configuration
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Helper functions
export const formatAmount = (amount: number, currency: string = "EUR") => {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount / 100); // Convert cents to currency units
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 