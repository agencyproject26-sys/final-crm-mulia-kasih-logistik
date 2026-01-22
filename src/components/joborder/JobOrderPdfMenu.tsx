import { FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobOrder } from "@/hooks/useJobOrders";
import { generateJobOrderInvoicePdf, InvoiceType } from "@/lib/jobOrderPdf";
import { toast } from "sonner";

interface JobOrderPdfMenuProps {
  jobOrder: JobOrder;
}

export const JobOrderPdfMenu = ({ jobOrder }: JobOrderPdfMenuProps) => {
  const handleDownload = (type: InvoiceType) => {
    try {
      generateJobOrderInvoicePdf(jobOrder, type);
      toast.success(`PDF ${type.toUpperCase()} berhasil diunduh`);
    } catch (error) {
      toast.error("Gagal mengunduh PDF");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <FileText className="h-4 w-4" />
          PDF
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("penumpukan")}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Invoice Penumpukan
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("do")}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            Invoice DO
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("behandle")}>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            Invoice Behandle
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
