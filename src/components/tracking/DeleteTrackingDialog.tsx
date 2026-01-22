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
import { Tracking } from "@/hooks/useTrackings";

interface DeleteTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracking: Tracking | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteTrackingDialog({
  open,
  onOpenChange,
  tracking,
  onConfirm,
  isLoading,
}: DeleteTrackingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Tracking?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan menghapus tracking untuk{" "}
            <strong>{tracking?.company_name}</strong>
            {tracking?.container_number && (
              <> dengan container <strong>{tracking.container_number}</strong></>
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
