import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/hooks/useVendors";

interface VendorDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

const vendorTypeLabels: Record<string, string> = {
  trucking: "Trucking",
  shipping: "Shipping Line",
  warehouse: "Warehouse",
  forwarding: "Forwarding",
  stevedoring: "Stevedoring",
  other: "Lainnya",
};

export function VendorDetailDialog({
  open,
  onOpenChange,
  vendor,
}: VendorDetailDialogProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Vendor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{vendor.company_name}</h3>
            <div className="flex gap-2">
              <Badge variant={vendor.status === "aktif" ? "default" : "secondary"}>
                {vendor.status === "aktif" ? "Aktif" : "Tidak Aktif"}
              </Badge>
              <Badge variant="outline">
                {vendorTypeLabels[vendor.vendor_type || "other"] || vendor.vendor_type}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">PIC</p>
              <div className="space-y-1">
                {vendor.pic_name && vendor.pic_name.length > 0
                  ? vendor.pic_name.map((name, i) => (
                      <p key={i} className="font-medium">{name}</p>
                    ))
                  : <p className="font-medium">-</p>
                }
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Telepon</p>
              <div className="space-y-1">
                {vendor.phone && vendor.phone.length > 0
                  ? vendor.phone.map((ph, i) => (
                      <p key={i} className="font-medium">{ph}</p>
                    ))
                  : <p className="font-medium">-</p>
                }
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{vendor.email || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Kota</p>
              <p className="font-medium">{vendor.city || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Alamat</p>
              <p className="font-medium">{vendor.address || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Layanan</p>
              <p className="font-medium">{vendor.services || "-"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Informasi Keuangan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">NPWP</p>
                <p className="font-medium">{vendor.npwp || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank</p>
                <p className="font-medium">{vendor.bank_name || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">No. Rekening</p>
                <p className="font-medium">{vendor.bank_account_number || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nama Rekening</p>
                <p className="font-medium">{vendor.bank_account_name || "-"}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-sm text-muted-foreground">
            <p>Dibuat: {new Date(vendor.created_at).toLocaleString("id-ID")}</p>
            <p>Diperbarui: {new Date(vendor.updated_at).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
