import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/hooks/useInvoices";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface JobOrderInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOrderId: string;
  jobOrderNumber: string;
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt },
  sent: { bg: "bg-blue-500/10", text: "text-blue-500", icon: Receipt },
  partial: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  paid: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertCircle },
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  partial: "Sebagian",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
};

export const JobOrderInvoicesDialog = ({
  open,
  onOpenChange,
  jobOrderId,
  jobOrderNumber,
}: JobOrderInvoicesDialogProps) => {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["job_order_invoices", jobOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("job_order_id", jobOrderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Invoice[];
    },
    enabled: open,
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.down_payment), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.remaining_amount), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice untuk {jobOrderNumber}</DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Total Invoice</p>
            <p className="text-lg font-bold">{formatRupiah(totalAmount)}</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Terbayar</p>
            <p className="text-lg font-bold text-success">{formatRupiah(totalPaid)}</p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-destructive">{formatRupiah(totalOutstanding)}</p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Memuat...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Belum ada invoice untuk job order ini</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">DP</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const status = invoice.status || "draft";
                const statusInfo = statusStyles[status] || statusStyles.draft;
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(Number(invoice.total_amount))}
                    </TableCell>
                    <TableCell className="text-right text-success">
                      {formatRupiah(Number(invoice.down_payment))}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatRupiah(Number(invoice.remaining_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", statusInfo.bg, statusInfo.text)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
