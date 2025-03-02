import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dummy data representing bank accounts
const dummyBankAccounts = [
  {
    id: 1,
    name: "Main Business Account",
    iban: "DE89370400440532013000",
    currency: "EUR",
    company_id: 1,
    totalStatements: 3,
    lastStatement: "2024-02-29",
    balance: 1500000 // in cents
  },
  {
    id: 2,
    name: "Operating Expenses",
    iban: "DE91100000000123456789",
    currency: "EUR",
    company_id: 1,
    totalStatements: 1,
    lastStatement: "2024-01-31",
    balance: 50000 // in cents
  },
  {
    id: 3,
    name: "USD Trading Account",
    iban: "DE45500105174529223988",
    currency: "USD",
    company_id: 1,
    totalStatements: 0,
    lastStatement: null,
    balance: 250000 // in cents
  }
];

export default function BankAccounts() {
  const [accounts] = useState(dummyBankAccounts);

  // Format amount to display currency with proper decimals
  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100); // Convert cents to currency units
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Manage your company's bank accounts and view their statements
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Statements</TableHead>
              <TableHead>Last Statement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="font-medium">{account.name}</div>
                </TableCell>
                <TableCell className="font-mono">{account.iban}</TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell>{formatAmount(account.balance, account.currency)}</TableCell>
                <TableCell>{account.totalStatements}</TableCell>
                <TableCell>
                  {account.lastStatement 
                    ? new Date(account.lastStatement).toLocaleDateString()
                    : <span className="text-muted-foreground">No statements</span>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}