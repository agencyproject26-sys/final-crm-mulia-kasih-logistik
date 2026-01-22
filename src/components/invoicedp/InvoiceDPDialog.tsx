import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { InvoiceDP, InvoiceDPInput, InvoiceDPItem } from "@/hooks/useInvoiceDP";

interface InvoiceDPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InvoiceDPInput) => void;
  invoice?: InvoiceDP & { items?: InvoiceDPItem[] };
  nextPartNumber?: number;
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export function InvoiceDPDialog({
  open,
  onOpenChange,
  onSubmit,
  invoice,
  nextPartNumber = 1,
}: InvoiceDPDialogProps) {
  const { data: customers = [] } = useCustomers();
  const [formData, setFormData] = useState({
    invoice_dp_number: "",
    part_number: nextPartNumber,
    invoice_date: new Date().toISOString().split("T")[0],
    customer_id: "",
    customer_name: "",
    customer_address: "",
    customer_city: "",
    bl_number: "",
    description: "",
    status: "draft",
    notes: "",
  });
  const [items, setItems] = useState<InvoiceDPItem[]>([
    { description: "Biaya DO", amount: 0 },
    { description: "Uang Jalan Truck", amount: 0 },
    { description: "Storage", amount: 0 },
    { description: "Kosongan Container (Lolo)", amount: 0 },
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_dp_number: invoice.invoice_dp_number,
        part_number: invoice.part_number,
        invoice_date: invoice.invoice_date,
        customer_id: invoice.customer_id || "",
        customer_name: invoice.customer_name,
        customer_address: invoice.customer_address || "",
        customer_city: invoice.customer_city || "",
        bl_number: invoice.bl_number || "",
        description: invoice.description || "",
        status: invoice.status || "draft",
        notes: invoice.notes || "",
      });
      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items);
      }
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const newNumber = `${Math.floor(Math.random() * 9000) + 1000}/DP-${nextPartNumber}/${year}`;
      setFormData({
        invoice_dp_number: newNumber,
        part_number: nextPartNumber,
        invoice_date: today.toISOString().split("T")[0],
        customer_id: "",
        customer_name: "",
        customer_address: "",
        customer_city: "",
        bl_number: "",
        description: "",
        status: "draft",
        notes: "",
      });
      setItems([
        { description: "Biaya DO", amount: 0 },
        { description: "Uang Jalan Truck", amount: 0 },
        { description: "Storage", amount: 0 },
        { description: "Kosongan Container (Lolo)", amount: 0 },
      ]);
    }
  }, [invoice, nextPartNumber, open]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customer_id: customerId,
        customer_name: customer.company_name,
        customer_address: customer.address || "",
        customer_city: customer.city || "",
      }));
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceDPItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "amount") {
      newItems[index][field] = Number(value) || 0;
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      customer_id: formData.customer_id || null,
      total_amount: totalAmount,
      items,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Edit Invoice DP" : "Buat Invoice DP Baru"} - Part {formData.part_number}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>No. Invoice DP</Label>
              <Input
                value={formData.invoice_dp_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_dp_number: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Part Number</Label>
              <Input
                type="number"
                min={1}
                value={formData.part_number}
                onChange={(e) =>
                  setFormData({ ...formData, part_number: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Invoice</Label>
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>BL Number</Label>
              <Input
                value={formData.bl_number}
                onChange={(e) =>
                  setFormData({ ...formData, bl_number: e.target.value })
                }
                placeholder="Masukkan BL Number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pelanggan</Label>
            <Select
              value={formData.customer_id}
              onValueChange={handleCustomerChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pelanggan" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input
                value={formData.customer_address}
                onChange={(e) =>
                  setFormData({ ...formData, customer_address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Kota</Label>
              <Input
                value={formData.customer_city}
                onChange={(e) =>
                  setFormData({ ...formData, customer_city: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Contoh: DP Import PTP A.N PT XYZ 1X40'"
            />
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Item Biaya</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <Input
                    className="flex-1"
                    placeholder="Deskripsi"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                  <Input
                    className="w-40"
                    type="number"
                    placeholder="Jumlah"
                    value={item.amount || ""}
                    onChange={(e) =>
                      handleItemChange(index, "amount", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-3 bg-primary/10 rounded-lg">
              <span className="font-semibold text-lg">
                Total: {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Terkirim</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit">
              {invoice ? "Simpan Perubahan" : "Buat Invoice DP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
