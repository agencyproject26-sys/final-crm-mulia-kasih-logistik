import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/hooks/useCustomers";
import { Building2, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const typeLabels = {
  eksportir: "Eksportir",
  importir: "Importir",
  keduanya: "Keduanya",
};

export function CustomerDetailDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailDialogProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detail Pelanggan
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap pelanggan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{customer.company_name}</h3>
              <div className="flex gap-2 mt-2">
                <Badge variant={customer.status === "aktif" ? "default" : "destructive"}>
                  {customer.status === "aktif" ? "Aktif" : "Tidak Aktif"}
                </Badge>
                <Badge variant="outline">
                  {typeLabels[customer.customer_type]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {customer.pic_name && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">PIC</p>
                  <p className="font-medium">{customer.pic_name}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
            )}

            {(customer.address || customer.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">
                    {customer.address}
                    {customer.address && customer.city && ", "}
                    {customer.city}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Terdaftar</p>
                <p className="font-medium">
                  {format(new Date(customer.created_at), "dd MMMM yyyy", {
                    locale: id,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
