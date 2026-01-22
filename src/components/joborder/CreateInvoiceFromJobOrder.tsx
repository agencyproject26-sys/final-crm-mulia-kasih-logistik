import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronDown, Receipt, Banknote, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobOrder } from "@/hooks/useJobOrders";
import { useInvoices, InvoiceInput, InvoiceItem } from "@/hooks/useInvoices";
import { toast } from "sonner";

interface CreateInvoiceFromJobOrderProps {
  jobOrder: JobOrder;
  onSuccess?: () => void;
}

type InvoiceCategory = "penumpukan" | "do" | "behandle";

const invoiceCategories: Record<InvoiceCategory, { label: string; icon: React.ElementType; color: string }> = {
  penumpukan: { label: "Invoice Penumpukan", icon: Package, color: "text-primary" },
  do: { label: "Invoice DO", icon: Banknote, color: "text-success" },
  behandle: { label: "Invoice Behandle", icon: Receipt, color: "text-destructive" },
};

export const CreateInvoiceFromJobOrder = ({ jobOrder, onSuccess }: CreateInvoiceFromJobOrderProps) => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InvoiceCategory | null>(null);
  const [items, setItems] = useState<{ description: string; amount: number }[]>([
    { description: "", amount: 0 },
  ]);
  const [notes, setNotes] = useState("");

  const generateInvoiceNumber = (category: InvoiceCategory): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const prefix = category === "penumpukan" ? "PNP" : category === "do" ? "DO" : "BHD";
    return `INV-${prefix}${year}${month}-${random}`;
  };

  const openCreateDialog = (category: InvoiceCategory) => {
    setSelectedCategory(category);
    setItems([{ description: invoiceCategories[category].label, amount: 0 }]);
    setNotes("");
    setIsDialogOpen(true);
  };

  const addItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: "description" | "amount", value: string | number) => {
    const newItems = [...items];
    if (field === "amount") {
      newItems[index].amount = Number(value) || 0;
    } else {
      newItems[index].description = String(value);
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleCreate = () => {
    if (!selectedCategory) return;

    const subtotal = calculateTotal();
    const invoiceItems: InvoiceItem[] = items
      .filter((item) => item.description.trim() !== "")
      .map((item) => ({
        description: item.description,
        amount: item.amount,
      }));

    if (invoiceItems.length === 0) {
      toast.error("Tambahkan minimal 1 item");
      return;
    }

    const invoiceData: InvoiceInput = {
      invoice_number: generateInvoiceNumber(selectedCategory),
      invoice_date: new Date().toISOString().split("T")[0],
      no_aju: jobOrder.aju,
      bl_number: jobOrder.bl_number,
      customer_id: jobOrder.customer_id,
      customer_name: jobOrder.customer_name || "",
      customer_address: null,
      customer_city: null,
      party: jobOrder.party,
      flight_vessel: null,
      origin: jobOrder.lokasi,
      no_pen: null,
      description: `${invoiceCategories[selectedCategory].label} - ${jobOrder.job_order_number}`,
      delivery_date: null,
      subtotal,
      down_payment: 0,
      total_amount: subtotal,
      remaining_amount: subtotal,
      status: "draft",
      notes: notes || null,
      job_order_id: jobOrder.id,
      items: invoiceItems,
    };

    createInvoice.mutate(invoiceData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedCategory(null);
        toast.success(`${invoiceCategories[selectedCategory].label} berhasil dibuat`);
        onSuccess?.();
      },
    });
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Receipt className="h-4 w-4" />
            Invoice
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(invoiceCategories) as InvoiceCategory[]).map((category) => {
            const { label, icon: Icon, color } = invoiceCategories[category];
            return (
              <DropdownMenuItem key={category} onClick={() => openCreateDialog(category)}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  Buat {label}
                </div>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/keuangan/invoice")}>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lihat Semua Invoice
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Buat {selectedCategory && invoiceCategories[selectedCategory].label}
            </DialogTitle>
            <DialogDescription>
              Buat invoice baru dari Job Order {jobOrder.job_order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Job Order Info */}
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><span className="text-muted-foreground">Customer:</span> {jobOrder.customer_name || "-"}</p>
              <p><span className="text-muted-foreground">BL:</span> {jobOrder.bl_number || "-"}</p>
              <p><span className="text-muted-foreground">AJU:</span> {jobOrder.aju || "-"}</p>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <Label>Item Invoice</Label>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Deskripsi"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    value={item.amount || ""}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                    className="w-32"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + Tambah Item
              </Button>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">{formatRupiah(calculateTotal())}</span>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan invoice (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Membuat..." : "Buat Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
