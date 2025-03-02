"use client";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";
import { CreditCard, Plus, Download, ExternalLink } from "lucide-react";

export default function BankAccountsPage() {
  // Mock data
  const bankAccounts = [
    {
      id: 1,
      name: "Main Business Account",
      iban: "DE89370400440532013000",
      currency: "EUR",
      balance: 1500000, // in cents
      lastStatement: "2024-02-29",
      statementCount: 3
    },
    {
      id: 2,
      name: "Operating Expenses",
      iban: "DE91100000000123456789",
      currency: "EUR",
      balance: 50000, // in cents
      lastStatement: "2024-01-31",
      statementCount: 1
    }
  ];

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100); // Convert cents to currency units
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bank Accounts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bank Account
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankAccounts.map((account) => (
          <Card key={account.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-primary/10 rounded-full">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">{account.name}</h2>
                  <p className="text-sm text-muted-foreground">{account.iban}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{formatAmount(account.balance, account.currency)}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Statement</p>
                <p className="text-sm">{account.lastStatement}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Statements ({account.statementCount})
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Recent Statements</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank Account</TableHead>
              <TableHead>Statement Date</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Main Business Account</TableCell>
              <TableCell>Feb 29, 2024</TableCell>
              <TableCell>STMT-2024-003</TableCell>
              <TableCell>12</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Main Business Account</TableCell>
              <TableCell>Jan 31, 2024</TableCell>
              <TableCell>STMT-2024-002</TableCell>
              <TableCell>15</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 