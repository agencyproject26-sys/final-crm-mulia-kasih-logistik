import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck } from "@/hooks/useTrucks";
import { Truck as TruckIcon, User, Phone, Hash, Gauge } from "lucide-react";

interface TruckDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: Truck | null;
}

export const TruckDetailDialog = ({
  open,
  onOpenChange,
  truck,
}: TruckDetailDialogProps) => {
  if (!truck) return null;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Tidak Aktif</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Detail Truk & Driver
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Truck Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informasi Truk</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  ID Truk
                </p>
                <p className="font-medium">{truck.truck_id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Nomor Polisi</p>
                <p className="font-medium">{truck.plate_number}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TruckIcon className="h-4 w-4" />
                  Tipe Truk
                </p>
                <p className="font-medium">{truck.truck_type}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-4 w-4" />
                  Kapasitas
                </p>
                <p className="font-medium">{truck.capacity || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(truck.status)}
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informasi Driver</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Nama Driver
                </p>
                <p className="font-medium">{truck.driver_name || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  No. Telepon
                </p>
                <p className="font-medium">{truck.driver_phone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Dibuat: {new Date(truck.created_at).toLocaleString("id-ID")}</p>
            <p>Diperbarui: {new Date(truck.updated_at).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
