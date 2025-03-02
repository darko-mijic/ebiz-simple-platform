"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  UploadCloud, 
  FileUp, 
  PieChart, 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import { cn } from "../../lib/utils";
import { 
  Area, 
  AreaChart, 
  PieChart as RechartPieChart,
  Pie,
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { useToast } from "../../hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Reuse dummy data from other components
const dummyBankAccounts = [
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

const dummyTransactions = [
  {
    id: 1,
    bank_statement_id: 1,
    bank_account_id: 1,
    amount: 1500000, // amount in cents
    currency: "EUR",
    credit_debit: "credit",
    status: "completed",
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
    credit_debit: "debit",
    status: "completed",
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
    credit_debit: "credit",
    status: "completed",
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
    credit_debit: "debit",
    status: "completed",
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

const dummyDocuments = [
  {
    id: 1,
    filename: "invoice-2024-001.pdf",
    parsed_data: {
      type: "invoice",
      status: "parsed",
      invoice_number: "INV-2024-001",
      total_amount: 1500000,
      currency: "EUR",
      vendor: {
        name: "Acme Corp"
      }
    },
    upload_date: "2024-02-15T10:30:00Z",
    status: "processed"
  },
  {
    id: 2,
    filename: "invoice-2024-002.pdf",
    parsed_data: {
      type: "invoice",
      status: "needs_review",
      issue: "Missing vendor tax ID",
      invoice_number: "INV-2024-002",
      total_amount: 50000,
      currency: "EUR",
      vendor: {
        name: "Utility Provider"
      }
    },
    upload_date: "2024-02-16T14:20:00Z",
    status: "needs_attention"
  },
  {
    id: 3,
    filename: "receipt-2024-001.jpg",
    parsed_data: {
      type: "receipt",
      status: "needs_review",
      issue: "Unclear total amount",
      receipt_number: "R-2024-001",
      total_amount: 15000,
      currency: "EUR",
      vendor: {
        name: "Office Supply Co."
      }
    },
    upload_date: "2024-02-20T11:45:00Z",
    status: "needs_attention"
  }
];

const alerts = [
  {
    id: 1,
    type: "gap",
    account: "Main Business Account",
    message: "Missing statements between sequence numbers 2 and 4"
  },
  {
    id: 2,
    type: "review",
    account: "",
    message: "2 documents need your attention"
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatAmount = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount / 100); // Convert cents to currency units
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CustomTooltip = ({ active, payload, currency = "EUR" }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {new Date(data.date).toLocaleDateString()}
        </p>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Credited</p>
            <p className="text-sm font-medium text-green-600">
              {formatAmount(data.credited, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Debited</p>
            <p className="text-sm font-medium text-red-600">
              {formatAmount(data.debited, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PieChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <p className="text-sm font-medium">{data.name}</p>
      <p className="text-sm font-medium text-primary">
        {formatAmount(data.value, "EUR")}
      </p>
    </div>
  );
};

const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  actionHref
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  actionLabel?: string; 
  actionHref?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="bg-muted rounded-full p-3 mb-4">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
    {actionLabel && actionHref && (
      <Button asChild>
        <Link href={actionHref}>
          {actionLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    )}
  </div>
);

const SectionError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      <RefreshCw className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

// This is a redirect component to ensure users going to / within the protected layout go to /dashboard
export default function ProtectedRoot() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Named export for the Dashboard component
export function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState<{[key: string]: boolean}>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Use ref to prevent refreshData from causing a rerender loop
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total balance
  const totalBalance = dummyBankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const previousTotalBalance = dummyBankAccounts.reduce((sum, account) => sum + account.previousBalance, 0);
  const balanceChange = ((totalBalance - previousTotalBalance) / previousTotalBalance) * 100;

  // Calculate total balance history with credits and debits
  const totalBalanceHistory = Array.from({ length: 7 }, (_, i) => ({
    month: i,
    value: dummyBankAccounts.reduce((sum, account) => sum + account.balanceHistory[i].value, 0),
    credited: dummyBankAccounts.reduce((sum, account) => sum + account.balanceHistory[i].credited, 0),
    debited: dummyBankAccounts.reduce((sum, account) => sum + account.balanceHistory[i].debited, 0),
    date: new Date(2024, i, 1).toISOString()
  }));

  // Prepare data for pie chart
  const pieChartData = dummyBankAccounts.map(account => ({
    name: account.name,
    value: account.balance
  }));

  // Documents needing attention
  const documentsNeedingAttention = dummyDocuments.filter(doc => 
    doc.status === "needs_attention"
  );

  const refreshData = useCallback(() => {
    setIsLoading(true);
    setLoadingErrors({});
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Simulate API call
    refreshTimeoutRef.current = setTimeout(() => {
      refreshTimeoutRef.current = null;
      const shouldSucceed = Math.random() > 0.2;
      
      if (shouldSucceed) {
        setRefreshCounter(prev => prev + 1);
        setIsLoading(false);
        toast({
          title: "Data refreshed",
          description: "Dashboard data has been updated",
        });
      } else {
        // Simulate random section errors
        const newErrors: {[key: string]: boolean} = {};
        if (Math.random() > 0.5) newErrors.accounts = true;
        if (Math.random() > 0.5) newErrors.transactions = true;
        if (Math.random() > 0.5) newErrors.documents = true;
        
        setLoadingErrors(newErrors);
        setIsLoading(false);
        toast({
          title: "Refresh failed",
          description: "Some data couldn't be updated. Please try again.",
          type: "error",
        });
      }
    }, 1500);
  }, [toast]);

  // Handle auto-refresh with proper dependency array
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 60000); // Auto refresh every 60 seconds
    
    return () => {
      clearInterval(interval);
      // Also clear the refresh timeout on unmount
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefreshEnabled, refreshData]);

  // Retry a specific section
  const retrySection = (section: string) => {
    toast({
      title: "Retrying",
      description: `Refreshing ${section} data...`,
    });
    
    setTimeout(() => {
      setLoadingErrors(prev => ({...prev, [section]: false}));
      toast({
        title: "Success",
        description: `${section} data refreshed successfully`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            asChild
          >
            <Link href="/bank-statements/upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Statement
            </Link>
          </Button>
          <Button 
            variant="default" 
            size="sm"
            asChild
          >
            <Link href="/documents/upload">
              <FileUp className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>

      {showEmptyState ? (
        <Card className="p-6">
          <EmptyState
            title="Welcome to EBIZ-Saas Platform"
            description="Start by uploading your first bank statement to get an overview of your financial status."
            icon={PieChart}
            actionLabel="Upload First Statement"
            actionHref="/bank-statements/upload"
          />
        </Card>
      ) : (
        <>
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start space-x-4 p-4">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                    <div>
                      {alert.account && <p className="font-medium">{alert.account}</p>}
                      <p className="text-sm text-amber-800 dark:text-amber-300">{alert.message}</p>
                    </div>
                    {alert.type === 'review' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 border-amber-200 dark:border-amber-700"
                        asChild
                      >
                        <Link href="/documents?filter=needs_attention">
                          Review Documents
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Total Balance */}
          {loadingErrors.accounts ? (
            <Card className="p-6">
              <SectionError 
                message="Failed to load account data" 
                onRetry={() => retrySection('accounts')} 
              />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-1">
                <h2 className="text-sm font-medium text-muted-foreground">Total Balance</h2>
                <div className="text-3xl font-bold">{formatAmount(totalBalance, "EUR")}</div>
                <div className="flex items-center text-sm">
                  <span className={cn(
                    "font-medium",
                    balanceChange >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {balanceChange.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </div>

              {/* Balance trend visualization */}
              <div className="h-[80px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={totalBalanceHistory}>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="url(#gradient)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bank Account Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dummyBankAccounts.map((account) => {
                  const accountChange = ((account.balance - account.previousBalance) / account.previousBalance) * 100;

                  return (
                    <Card key={account.id} className="p-6">
                      <div className="space-y-1">
                        <h2 className="text-sm font-medium text-muted-foreground">{account.name}</h2>
                        <div className="text-2xl font-bold">
                          {formatAmount(account.balance, account.currency)}
                        </div>
                        <div className="flex items-center text-sm">
                          <span className={cn(
                            "font-medium",
                            accountChange >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {accountChange.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground ml-1">from last month</span>
                        </div>
                        <div className="text-sm font-mono text-muted-foreground mt-1">
                          {account.iban}
                        </div>
                      </div>

                      {/* Account balance trend visualization */}
                      <div className="h-[80px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={account.balanceHistory}>
                            <defs>
                              <linearGradient id={`gradient-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              fill={`url(#gradient-${account.id})`}
                              strokeWidth={1.5}
                              dot={false}
                            />
                            <Tooltip content={<CustomTooltip currency={account.currency} />} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Transactions */}
              <Card>
                <div className="p-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Recent Transactions</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/transactions">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {loadingErrors.transactions ? (
                  <div className="p-6 pt-0">
                    <SectionError 
                      message="Failed to load transaction data" 
                      onRetry={() => retrySection('transactions')} 
                    />
                  </div>
                ) : dummyTransactions.length === 0 ? (
                  <div className="p-6 pt-0">
                    <EmptyState
                      title="No transactions yet"
                      description="Transactions will appear here once you upload bank statements"
                      icon={FileText}
                      actionLabel="Upload Statement"
                      actionHref="/bank-statements/upload"
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            {formatDate(transaction.booking_date)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{transaction.remittance_info.unstructured}</div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.related_parties[transaction.credit_debit === 'credit' ? 'debtor' : 'creditor']?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-medium",
                            transaction.credit_debit === 'credit' ? "text-green-600" : "text-red-600"
                          )}>
                            {formatAmount(transaction.amount, transaction.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              {/* Bank Account Distribution */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Account Distribution</h2>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name }) => name}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieChartTooltip />} />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Documents Needing Attention */}
              <Card>
                <div className="p-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Documents Needing Attention</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents?filter=needs_attention">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {loadingErrors.documents ? (
                  <div className="p-6 pt-0">
                    <SectionError 
                      message="Failed to load document data" 
                      onRetry={() => retrySection('documents')} 
                    />
                  </div>
                ) : documentsNeedingAttention.length === 0 ? (
                  <div className="p-6 pt-0 flex items-center justify-center text-center">
                    <div className="py-6">
                      <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">All documents processed</p>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      {documentsNeedingAttention.map(doc => (
                        <div key={doc.id} className="flex items-start p-3 rounded-lg border bg-muted/50">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                          <div className="flex-1 mr-4">
                            <p className="font-medium">{doc.filename}</p>
                            <p className="text-sm text-muted-foreground">{doc.parsed_data.issue}</p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/documents/${doc.id}`}>Resolve</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Recent Documents */}
              <Card>
                <div className="p-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Recent Documents</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {loadingErrors.documents ? (
                  <div className="p-6 pt-0">
                    <SectionError 
                      message="Failed to load document data" 
                      onRetry={() => retrySection('documents')} 
                    />
                  </div>
                ) : dummyDocuments.length === 0 ? (
                  <div className="p-6 pt-0">
                    <EmptyState
                      title="No documents yet"
                      description="Upload your first document to get started"
                      icon={FileText}
                      actionLabel="Upload Document"
                      actionHref="/documents/upload"
                    />
                  </div>
                ) : (
                  <Table>
                    <TableBody>
                      {dummyDocuments.slice(0, 3).map((doc) => (
                        <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{doc.filename}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(doc.upload_date)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              doc.status === "processed" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            )}>
                              {doc.status === "processed" ? "Processed" : "Needs Attention"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 