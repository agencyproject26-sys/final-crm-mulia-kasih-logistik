import { useEffect, useState } from "react";
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
import { useCreateExpense, useUpdateExpense, type Expense, type ExpenseCategory } from "@/hooks/useExpenses";
import { useVendors } from "@/hooks/useVendors";
import { useJobOrders } from "@/hooks/useJobOrders";
import { format } from "date-fns";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: "truk", label: "Biaya Truk" },
  { value: "pelabuhan", label: "Biaya Pelabuhan" },
  { value: "shipping_line", label: "Biaya Shipping Line" },
  { value: "gudang", label: "Biaya Gudang" },
  { value: "operasional", label: "Biaya Operasional" },
];

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const [formData, setFormData] = useState({
    category: "operasional" as ExpenseCategory,
    description: "",
    amount: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    vendor_id: "",
    job_order_id: "",
    notes: "",
  });

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { data: vendors = [] } = useVendors();
  const { jobOrders = [] } = useJobOrders();

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: String(expense.amount),
        expense_date: expense.expense_date,
        vendor_id: expense.vendor_id || "",
        job_order_id: expense.job_order_id || "",
        notes: expense.notes || "",
      });
    } else {
      setFormData({
        category: "operasional",
        description: "",
        amount: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
        vendor_id: "",
        job_order_id: "",
        notes: "",
      });
    }
  }, [expense, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      category: formData.category,
      description: formData.description,
      amount: Number(formData.amount),
      expense_date: formData.expense_date,
      vendor_id: formData.vendor_id || null,
      job_order_id: formData.job_order_id || null,
      notes: formData.notes || null,
    };

    if (expense) {
      updateExpense.mutate({ id: expense.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createExpense.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ExpenseCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi *</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan deskripsi pengeluaran"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah (Rp) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendor_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Job Order</Label>
              <Select
                value={formData.job_order_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, job_order_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih job order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {jobOrders.map((jo) => (
                    <SelectItem key={jo.id} value={jo.id}>
                      {jo.job_order_number}
                    </SelectItem>
                  ))}
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
              placeholder="Catatan tambahan (opsional)"
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
            <Button
              type="submit"
              className="ocean-gradient"
              disabled={createExpense.isPending || updateExpense.isPending}
            >
              {expense ? "Simpan Perubahan" : "Tambah Pengeluaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
