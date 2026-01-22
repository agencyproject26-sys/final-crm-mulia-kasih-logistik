import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobOrder } from "@/hooks/useJobOrders";
import { useInvoiceDP, InvoiceDPInput, InvoiceDPItem } from "@/hooks/useInvoiceDP";
import { toast } from "sonner";

interface CreateInvoiceDPFromJobOrderProps {
  jobOrder: JobOrder;
  onSuccess?: () => void;
}

export const CreateInvoiceDPFromJobOrder = ({ jobOrder, onSuccess }: CreateInvoiceDPFromJobOrderProps) => {
  const navigate = useNavigate();
  const { createInvoiceDP, getNextPartNumber } = useInvoiceDP();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [partNumber, setPartNumber] = useState(1);
  const [items, setItems] = useState<{ description: string; amount: number }[]>([
    { description: "", amount: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [isLoadingPartNumber, setIsLoadingPartNumber] = useState(false);

  const generateInvoiceDPNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `DP${year}${month}-${random}`;
  };

  const openDialog = async () => {
    setIsLoadingPartNumber(true);
    try {
      // Check if there's already an invoice DP for this job order based on BL number
      const invoiceNumber = generateInvoiceDPNumber();
      const nextPart = await getNextPartNumber(invoiceNumber);
      setPartNumber(nextPart);
    } catch (error) {
      console.error("Error getting next part number:", error);
      setPartNumber(1);
    } finally {
      setIsLoadingPartNumber(false);
    }
    
    setItems([{ description: `Down Payment - ${jobOrder.job_order_number}`, amount: 0 }]);
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
    const total = calculateTotal();
    const invoiceItems: InvoiceDPItem[] = items
      .filter((item) => item.description.trim() !== "")
      .map((item) => ({
        description: item.description,
        amount: item.amount,
      }));

    if (invoiceItems.length === 0) {
      toast.error("Tambahkan minimal 1 item");
      return;
    }

    const invoiceDPData: InvoiceDPInput = {
      invoice_dp_number: generateInvoiceDPNumber(),
      part_number: partNumber,
      invoice_date: new Date().toISOString().split("T")[0],
      customer_id: jobOrder.customer_id,
      customer_name: jobOrder.customer_name || "",
      customer_address: null,
      customer_city: null,
      bl_number: jobOrder.bl_number,
      description: `Invoice DP - ${jobOrder.job_order_number}`,
      total_amount: total,
      status: "draft",
      notes: notes || null,
      items: invoiceItems,
    };

    createInvoiceDP.mutate(invoiceDPData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast.success(`Invoice DP Part ${partNumber} berhasil dibuat`);
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
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={openDialog}
        disabled={isLoadingPartNumber}
      >
        <CreditCard className="h-4 w-4" />
        DP
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Invoice DP</DialogTitle>
            <DialogDescription>
              Buat Invoice Down Payment dari Job Order {jobOrder.job_order_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Job Order Info */}
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><span className="text-muted-foreground">Customer:</span> {jobOrder.customer_name || "-"}</p>
              <p><span className="text-muted-foreground">BL:</span> {jobOrder.bl_number || "-"}</p>
              <p><span className="text-muted-foreground">AJU:</span> {jobOrder.aju || "-"}</p>
            </div>

            {/* Part Number */}
            <div className="space-y-2">
              <Label>Part Number</Label>
              <Select value={String(partNumber)} onValueChange={(val) => setPartNumber(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Part" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      Part {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <Label>Item Invoice DP</Label>
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
            <Button onClick={handleCreate} disabled={createInvoiceDP.isPending}>
              {createInvoiceDP.isPending ? "Membuat..." : "Buat Invoice DP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
