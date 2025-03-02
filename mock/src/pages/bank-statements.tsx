import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

// Dummy data representing bank statements
const dummyBankStatements = [
  {
    id: 1,
    bank_account_id: 1,
    statement_id: "STMT/2024/001",
    sequence_number: 1,
    creation_date: "2024-01-01",
    from_date: "2024-01-01",
    to_date: "2024-01-31",
    bank_account: {
      name: "Main Business Account",
      iban: "DE89370400440532013000",
    },
    hasGap: false
  },
  {
    id: 2,
    bank_account_id: 1,
    statement_id: "STMT/2024/002",
    sequence_number: 2,
    creation_date: "2024-02-01",
    from_date: "2024-02-01",
    to_date: "2024-02-29",
    bank_account: {
      name: "Main Business Account",
      iban: "DE89370400440532013000",
    },
    hasGap: false
  },
  {
    id: 3,
    bank_account_id: 1,
    statement_id: "STMT/2024/004",
    sequence_number: 4,
    creation_date: "2024-04-01",
    from_date: "2024-04-01",
    to_date: "2024-04-30",
    bank_account: {
      name: "Main Business Account",
      iban: "DE89370400440532013000",
    },
    hasGap: true // Gap between sequence 2 and 4
  },
];

// Mock function to simulate CAMT parsing
const mockParseCamtFile = async (file: File) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate successful parsing
  if (file.name.toLowerCase().endsWith('.xml')) {
    return {
      statement_id: `STMT/2024/${Math.floor(Math.random() * 1000)}`,
      sequence_number: Math.floor(Math.random() * 10),
      creation_date: new Date().toISOString(),
      from_date: "2024-02-01",
      to_date: "2024-02-29",
      bank_account: {
        name: "Main Business Account",
        iban: "DE89370400440532013000",
      },
    };
  }

  throw new Error('Invalid file format. Please upload a CAMT.053 XML file.');
};

export default function BankStatements() {
  const [statements, setStatements] = useState(dummyBankStatements);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const parsedStatement = await mockParseCamtFile(file);
      setStatements(prev => [...prev, { ...parsedStatement, id: prev.length + 1, hasGap: false }]);
      toast({
        title: "Statement uploaded successfully",
        description: `Statement ${parsedStatement.statement_id} has been processed.`,
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process statement",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bank Statements</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your SEPA CAMT ISO bank statements
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Statement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload CAMT Statement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="statement-file" className="text-sm font-medium">
                  Select CAMT.053 XML file
                </label>
                <input
                  id="statement-file"
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              {isUploading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Processing statement...</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statement ID</TableHead>
              <TableHead>Bank Account</TableHead>
              <TableHead>Sequence</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statements.map((statement) => (
              <TableRow key={statement.id} className={statement.hasGap ? "bg-destructive/10" : ""}>
                <TableCell>{statement.statement_id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{statement.bank_account.name}</div>
                    <div className="text-sm text-muted-foreground">{statement.bank_account.iban}</div>
                  </div>
                </TableCell>
                <TableCell>{statement.sequence_number}</TableCell>
                <TableCell>
                  {new Date(statement.from_date).toLocaleDateString()} - {new Date(statement.to_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{new Date(statement.creation_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {statement.hasGap ? (
                    <span className="text-destructive font-medium">Gap Detected</span>
                  ) : (
                    <span className="text-muted-foreground">OK</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}