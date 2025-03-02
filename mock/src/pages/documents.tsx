import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, FileCheck, AlertTriangle, ZoomIn, ZoomOut, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Dummy data representing uploaded documents
const dummyDocuments = [
  {
    id: 1,
    company_id: 1,
    file_path: "/uploads/INV-2024-001.pdf",
    upload_date: "2024-02-15T10:30:00Z",
    transaction_id: 1,
    parsed_data: {
      type: "invoice",
      status: "parsed",
      invoice_number: "INV-2024-001",
      issue_date: "2024-02-15",
      due_date: "2024-03-15",
      total_amount: 1500000, // in cents
      currency: "EUR",
      vendor: {
        name: "Acme Corp",
        vat_id: "DE123456789"
      }
    }
  },
  {
    id: 2,
    company_id: 1,
    file_path: "/uploads/INV-2024-002.pdf",
    upload_date: "2024-02-16T14:20:00Z",
    transaction_id: 2,
    parsed_data: {
      type: "invoice",
      status: "needs_review",
      invoice_number: "INV-2024-002",
      issue_date: "2024-02-16",
      due_date: "2024-03-16",
      total_amount: 50000, // in cents
      currency: "EUR",
      vendor: {
        name: "Utility Provider",
        vat_id: "DE987654321"
      }
    }
  },
  {
    id: 3,
    company_id: 1,
    file_path: "/uploads/RECEIPT-2024-001.pdf",
    upload_date: "2024-02-17T09:15:00Z",
    transaction_id: null,
    parsed_data: {
      type: "receipt",
      status: "unmatched",
      receipt_number: "RCPT-2024-001",
      date: "2024-02-17",
      total_amount: 2500, // in cents
      currency: "EUR",
      vendor: {
        name: "Office Supplies Co",
        vat_id: "DE456789123"
      }
    }
  }
];

export default function Documents() {
  const [documents] = useState(dummyDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof dummyDocuments[0] | null>(null);
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  // Format amount to display currency with proper decimals
  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount / 100); // Convert cents to currency units
  };

  // Get status icon based on document status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'parsed':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'needs_review':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unmatched':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const simulateFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(progress);
      }

      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newDocument = {
        id: documents.length + 1,
        company_id: 1,
        file_path: `/uploads/${file.name}`,
        upload_date: new Date().toISOString(),
        transaction_id: null,
        parsed_data: {
          type: file.name.toLowerCase().includes('invoice') ? 'invoice' : 'receipt',
          status: 'parsed',
          invoice_number: `INV-${new Date().getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_amount: Math.floor(Math.random() * 1000000),
          currency: "EUR",
          vendor: {
            name: "New Vendor Corp",
            vat_id: "DE" + Math.floor(Math.random() * 1000000000)
          }
        }
      };

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been processed and parsed.`,
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await simulateFileUpload(file);
    event.target.value = ''; // Reset file input
  };

  const handleDocumentClick = (doc: typeof dummyDocuments[0]) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
    setZoom(1); // Reset zoom when opening new document
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max zoom 300%
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 50%
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your invoices, receipts, and other financial documents
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="document-file" className="text-sm font-medium">
                  Select PDF document
                </label>
                <input
                  id="document-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {uploadProgress < 100
                      ? `Uploading... ${uploadProgress}%`
                      : "Processing document..."}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedDocument?.parsed_data.type === 'invoice'
                  ? selectedDocument?.parsed_data.invoice_number
                  : selectedDocument?.parsed_data.receipt_number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto relative">
            <div
              className="min-h-[100%] transition-transform duration-200 cursor-move"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Placeholder for actual document content */}
              <div className="bg-muted w-[800px] h-[1130px] rounded-lg flex items-center justify-center">
                <FileText className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleDocumentClick(doc)}
          >
            {/* Document Preview */}
            <div className="bg-muted rounded-lg h-32 mb-4 flex items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>

            {/* Document Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {doc.parsed_data.type === 'invoice' ? doc.parsed_data.invoice_number : doc.parsed_data.receipt_number}
                </span>
                {getStatusIcon(doc.parsed_data.status)}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>{doc.parsed_data.vendor.name}</p>
                <p>VAT ID: {doc.parsed_data.vendor.vat_id}</p>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>
                  {new Date(doc.parsed_data.type === 'invoice' ? doc.parsed_data.issue_date : doc.parsed_data.date).toLocaleDateString()}
                </span>
                <span className="font-medium">
                  {formatAmount(doc.parsed_data.total_amount, doc.parsed_data.currency)}
                </span>
              </div>

              {doc.parsed_data.type === 'invoice' && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Due: </span>
                  {new Date(doc.parsed_data.due_date).toLocaleDateString()}
                </div>
              )}

              {doc.parsed_data.status === 'unmatched' && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Match Transaction
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}