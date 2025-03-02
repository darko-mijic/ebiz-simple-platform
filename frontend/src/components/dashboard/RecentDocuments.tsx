"use client";

import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ArrowRight, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { RecentDocumentsProps } from "../../data/types";
import { formatDate } from "../../data/mock/dashboard-data";
import Link from "next/link";

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Documents</h3>
        <Link 
          href="/documents" 
          className="flex items-center text-sm text-primary hover:underline"
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    {document.filename}
                  </div>
                </TableCell>
                <TableCell>
                  {document.parsed_data.type.charAt(0).toUpperCase() + document.parsed_data.type.slice(1)}
                </TableCell>
                <TableCell>{formatDate(document.upload_date)}</TableCell>
                <TableCell>
                  {document.status === "processed" ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Processed
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="mr-1 h-4 w-4" />
                      Needs Attention
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
} 