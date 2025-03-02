"use client";

import { useState } from "react";
import { AccountSummary } from "./AccountSummary";
import { RecentTransactions } from "./RecentTransactions";
import { RecentDocuments } from "./RecentDocuments";
import { Alerts } from "./Alerts";
import { Button } from "../ui/button";
import { UploadCloud, FileUp } from "lucide-react";
import { 
  mockBankAccounts, 
  mockTransactions, 
  mockDocuments, 
  mockAlerts 
} from "../../data/mock/dashboard-data";

export default function DashboardContent() {
  const [accounts] = useState(mockBankAccounts);
  const [transactions] = useState(mockTransactions);
  const [documents] = useState(mockDocuments);
  const [alerts] = useState(mockAlerts);

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <Button size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Statement
          </Button>
          <Button size="sm" variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Alerts alerts={alerts} />
      )}

      {/* Account Summary Section */}
      <AccountSummary totalBalance={totalBalance} accounts={accounts} />

      {/* Transactions and Documents Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions.slice(0, 5)} />
        <RecentDocuments documents={documents.slice(0, 5)} />
      </div>
    </div>
  );
} 