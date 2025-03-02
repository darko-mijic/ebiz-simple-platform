import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

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
  }
];

const dummyDocuments = [
  {
    id: 1,
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
    upload_date: "2024-02-15T10:30:00Z"
  },
  {
    id: 2,
    parsed_data: {
      type: "invoice",
      status: "needs_review",
      invoice_number: "INV-2024-002",
      total_amount: 50000,
      currency: "EUR",
      vendor: {
        name: "Utility Provider"
      }
    },
    upload_date: "2024-02-16T14:20:00Z"
  }
];

const alerts = [
  {
    id: 1,
    type: "gap",
    account: "Main Business Account",
    message: "Missing statements between sequence numbers 2 and 4"
  }
];

const formatAmount = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount / 100); // Convert cents to currency units
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

export default function Dashboard() {
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* Total Balance */}
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

      {/* Bank Account Cards */}
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

      {/* Recent Transactions and Documents */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="col-span-1">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
          </div>
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
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.booking_date).toLocaleDateString()}
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
        </Card>

        {/* Recent Documents */}
        <Card className="col-span-1">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Document</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div>{doc.parsed_data.invoice_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.parsed_data.vendor.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAmount(doc.parsed_data.total_amount, doc.parsed_data.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Alerts</h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-4 bg-destructive/10 text-destructive rounded-lg p-4"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{alert.account}</p>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}