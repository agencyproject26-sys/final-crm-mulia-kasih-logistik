import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InvoiceDP } from "@/hooks/useInvoiceDP";

interface DeleteInvoiceDPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  invoice: InvoiceDP | null;
}

export function DeleteInvoiceDPDialog({
  open,
  onOpenChange,
  onConfirm,
  invoice,
}: DeleteInvoiceDPDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Invoice DP?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda yakin ingin menghapus invoice DP{" "}
            <strong>{invoice?.invoice_dp_number}</strong> (Part{" "}
            {invoice?.part_number})? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
