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
import { Warehouse } from "@/hooks/useWarehouses";

interface DeleteWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Warehouse | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteWarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  onConfirm,
  isLoading,
}: DeleteWarehouseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Gudang?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan menghapus data gudang untuk{" "}
            <strong>{warehouse?.customer_name}</strong>
            {warehouse?.description && (
              <> - {warehouse.description}</>
            )}
            . Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
