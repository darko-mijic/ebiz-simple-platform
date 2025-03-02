"use client";

import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ArrowRight } from "lucide-react";
import { RecentTransactionsProps } from "../../data/types";
import { formatAmount, formatDate } from "../../data/mock/dashboard-data";
import Link from "next/link";

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Link 
          href="/transactions" 
          className="flex items-center text-sm text-primary hover:underline"
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {formatDate(transaction.booking_date)}
                </TableCell>
                <TableCell>
                  {transaction.remittance_info.unstructured}
                </TableCell>
                <TableCell>{transaction.bank_account.name}</TableCell>
                <TableCell className={`text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 