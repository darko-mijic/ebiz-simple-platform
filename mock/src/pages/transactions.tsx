import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Dummy data representing transactions
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
    references: {
      end_to_end_id: "INVOICE/2024/001",
      mandate_id: "MANDATE001"
    },
    related_parties: {
      debtor: {
        name: "Acme Corp",
        iban: "DE89370400440532013000"
      },
      creditor: {
        name: "Our Company",
        iban: "DE91100000000123456789"
      }
    },
    remittance_info: {
      unstructured: "Invoice payment INVOICE/2024/001",
      structured: {
        invoice_number: "INVOICE/2024/001",
        reference: "PAYMENT/2024/001"
      }
    },
    bank_account: {
      name: "Main Business Account",
      iban: "DE91100000000123456789"
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
    references: {
      end_to_end_id: "UTIL/2024/001",
      mandate_id: "MANDATE002"
    },
    related_parties: {
      debtor: {
        name: "Our Company",
        iban: "DE91100000000123456789"
      },
      creditor: {
        name: "Utility Provider",
        iban: "DE45500105174529223988"
      }
    },
    remittance_info: {
      unstructured: "Monthly utility payment",
      structured: {
        invoice_number: "UTIL/2024/001",
        reference: "PAYMENT/2024/002"
      }
    },
    bank_account: {
      name: "Operating Expenses",
      iban: "DE91100000000123456789"
    }
  }
];

export default function Transactions() {
  const [transactions] = useState(dummyTransactions);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your transactions across all bank accounts
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <h2 className="font-medium">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Account</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="main">Main Business Account</SelectItem>
                  <SelectItem value="expenses">Operating Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Range</label>
              <div className="flex space-x-2">
                <Input type="number" placeholder="Min" className="w-1/2" />
                <Input type="number" placeholder="Max" className="w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.booking_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{transaction.bank_account.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {transaction.bank_account.iban}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{transaction.remittance_info.unstructured}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.related_parties[transaction.credit_debit === 'credit' ? 'debtor' : 'creditor'].name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                    transaction.credit_debit === 'credit'
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  )}>
                    {transaction.credit_debit}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  transaction.credit_debit === 'credit' ? "text-green-600" : "text-red-600"
                )}>
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {transaction.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}