"use client";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";
import { FileText, Upload, Download, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "../../../components/ui/input";

export default function DocumentsPage() {
  // Mock data
  const documents = [
    {
      id: 1,
      name: "Invoice_2024_001.pdf",
      type: "Invoice",
      uploadDate: "2024-02-15",
      status: "parsed",
      amount: 1500000, // amount in cents
      currency: "EUR",
      vendor: "Acme Corp",
      linkedTransaction: true
    },
    {
      id: 2,
      name: "Utility_Bill_Feb.pdf",
      type: "Bill",
      uploadDate: "2024-02-16",
      status: "needs_review",
      amount: 50000, // amount in cents
      currency: "EUR",
      vendor: "Utility Provider",
      linkedTransaction: false
    },
    {
      id: 3,
      name: "Software_Subscription.pdf",
      type: "Invoice",
      uploadDate: "2024-02-18",
      status: "parsed",
      amount: 29900, // amount in cents
      currency: "EUR",
      vendor: "SaaS Provider",
      linkedTransaction: true
    },
    {
      id: 4,
      name: "Contract_Client_XYZ.pdf",
      type: "Contract",
      uploadDate: "2024-02-20",
      status: "needs_review",
      amount: null,
      currency: null,
      vendor: "Client XYZ",
      linkedTransaction: false
    }
  ];

  const formatAmount = (amount: number | null, currency: string | null) => {
    if (amount === null || currency === null) return "N/A";
    
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100); // Convert cents to currency units
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-medium">All Documents</h2>
            <p className="text-3xl font-bold mt-2">{documents.length}</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-medium">Processed</h2>
            <p className="text-3xl font-bold mt-2">
              {documents.filter(doc => doc.status === "parsed").length}
            </p>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-medium">Needs Review</h2>
            <p className="text-3xl font-bold mt-2">
              {documents.filter(doc => doc.status === "needs_review").length}
            </p>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Vendor/Client</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{document.name}</TableCell>
                <TableCell>{document.type}</TableCell>
                <TableCell>{document.uploadDate}</TableCell>
                <TableCell>
                  {document.status === "parsed" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Needs Review
                    </span>
                  )}
                </TableCell>
                <TableCell>{formatAmount(document.amount, document.currency)}</TableCell>
                <TableCell>{document.vendor}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 