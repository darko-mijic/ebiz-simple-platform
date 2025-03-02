"use client";

import { useEffect } from 'react';
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";
import { ArrowDownIcon, ArrowUpIcon, Download, Filter, Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { setAuthCookie } from "../../../lib/set-auth-cookie";

export default function TransactionsPage() {
  // Set auth cookie for development testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setAuthCookie();
    }
  }, []);

  // Mock data
  const transactions = [
    {
      id: 1,
      date: "2024-02-15",
      description: "Invoice payment INVOICE/2024/001",
      amount: 1500000, // amount in cents
      currency: "EUR",
      type: "credit",
      bankAccount: "Main Business Account",
      relatedParty: "Acme Corp",
      hasDocument: true
    },
    {
      id: 2,
      date: "2024-02-16",
      description: "Monthly utility payment",
      amount: -50000, // amount in cents
      currency: "EUR",
      type: "debit",
      bankAccount: "Operating Expenses",
      relatedParty: "Utility Provider",
      hasDocument: false
    },
    {
      id: 3,
      date: "2024-02-18",
      description: "Software subscription",
      amount: -29900, // amount in cents
      currency: "EUR",
      type: "debit",
      bankAccount: "Operating Expenses",
      relatedParty: "SaaS Provider",
      hasDocument: true
    },
    {
      id: 4,
      date: "2024-02-20",
      description: "Client payment for services",
      amount: 750000, // amount in cents
      currency: "EUR",
      type: "credit",
      bankAccount: "Main Business Account",
      relatedParty: "Client XYZ",
      hasDocument: false
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
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Bank Account</TableHead>
              <TableHead>Related Party</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.bankAccount}</TableCell>
                <TableCell>{transaction.relatedParty}</TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUpIcon className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-4 w-4" />
                    )}
                    {formatAmount(Math.abs(transaction.amount), transaction.currency)}
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.hasDocument ? (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}