import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Invoice, InvoiceItem, InvoiceInput } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { InvoicePreview } from "./InvoicePreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Download, Eye, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const formSchema = z.object({
  invoice_number: z.string().min(1, "Nomor invoice wajib diisi"),
  invoice_date: z.string().min(1, "Tanggal wajib diisi"),
  no_aju: z.string().optional(),
  bl_number: z.string().optional(),
  customer_id: z.string().optional(),
  customer_name: z.string().min(1, "Nama pelanggan wajib diisi"),
  customer_address: z.string().optional(),
  customer_city: z.string().optional(),
  party: z.string().optional(),
  flight_vessel: z.string().optional(),
  origin: z.string().optional(),
  no_pen: z.string().optional(),
  no_invoice: z.string().optional(),
  description: z.string().optional(),
  delivery_date: z.string().optional(),
  down_payment: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InvoiceInput) => void;
  invoice?: Invoice | null;
  isLoading?: boolean;
}

export const InvoiceDialog = ({
  open,
  onOpenChange,
  onSubmit,
  invoice,
  isLoading,
}: InvoiceDialogProps) => {
  const { data: customers = [] } = useCustomers();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [signerName, setSignerName] = useState("RUDY SURIYANTO");
  const [dpItems, setDpItems] = useState<{ label: string; amount: number }[]>([]);
  const [bankAccountName, setBankAccountName] = useState("PT. MULIA KASIH LOGISTIK");
  const [bankAccountNumber, setBankAccountNumber] = useState("6910492436");
  const [bankBranch, setBankBranch] = useState("BANK BCA CAB. YOS SUDARSO");
  const [activeTab, setActiveTab] = useState("form");
  const previewRef = useRef<HTMLDivElement>(null);

  const DEFAULT_ITEMS: { description: string; amount: number }[] = [
    { description: "Trucking", amount: 0 },
    { description: "Tuslag", amount: 0 },
    { description: "Kawalan Truck", amount: 100000 },
    { description: "Buruh Pabrik", amount: 100000 },
    { description: "Lolo / Lift Off", amount: 0 },
    { description: "Penumpukan", amount: 0 },
    { description: "DO", amount: 0 },
    { description: "Materai", amount: 10000 },
  ];

  const DEFAULT_NOTES = `Enclosure :\nAll cheques be crossed and made payable to MULIA KASIH LOGISTIK\nInterest at 1% per month will be charged on overdue account.\nAny complaints/disputes regarding this invoice should be lodged within\n1 days from date of invoice.`;

  const getDefaultItems = (): InvoiceItem[] =>
    DEFAULT_ITEMS.map((item) => ({ description: item.description, amount: item.amount }));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      no_aju: "",
      bl_number: "",
      customer_id: "",
      customer_name: "",
      customer_address: "",
      customer_city: "",
      party: "",
      flight_vessel: "",
      origin: "",
      no_pen: "",
      no_invoice: "",
      description: "",
      delivery_date: "",
      down_payment: 0,
      notes: DEFAULT_NOTES,
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        no_aju: invoice.no_aju || "",
        bl_number: invoice.bl_number || "",
        customer_id: invoice.customer_id || "",
        customer_name: invoice.customer_name,
        customer_address: invoice.customer_address || "",
        customer_city: invoice.customer_city || "",
        party: invoice.party || "",
        flight_vessel: invoice.flight_vessel || "",
        origin: invoice.origin || "",
        no_pen: invoice.no_pen || "",
        no_invoice: (invoice as any).no_invoice || "",
        description: invoice.description || "",
        delivery_date: invoice.delivery_date || "",
        down_payment: invoice.down_payment || 0,
        notes: invoice.notes || "",
      });
      setItems(invoice.items || []);
      // Restore DP items from saved dp_items array
      const savedDpItems = invoice.dp_items as { label: string; amount: number }[] | null;
      if (savedDpItems && Array.isArray(savedDpItems) && savedDpItems.length > 0) {
        setDpItems(savedDpItems);
      } else if (invoice.down_payment && invoice.down_payment > 0) {
        setDpItems([{ label: "DP 1", amount: invoice.down_payment }]);
      } else {
        setDpItems([]);
      }
    } else {
      form.reset({
        invoice_number: generateInvoiceNumber(),
        invoice_date: new Date().toISOString().split("T")[0],
        no_aju: "",
        bl_number: "",
        customer_id: "",
        customer_name: "",
        customer_address: "",
        customer_city: "",
        party: "",
        flight_vessel: "",
        origin: "",
        no_pen: "",
        no_invoice: "",
        description: "",
        delivery_date: "",
        down_payment: 0,
        notes: DEFAULT_NOTES,
      });
      setItems(getDefaultItems());
      setDpItems([]);
    }
  }, [invoice, form, open]);

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `INV/MITRA/${month}${random}/${year}`;
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue("customer_id", customerId);
      form.setValue("customer_name", customer.company_name);
      form.setValue("customer_address", customer.address || "");
      form.setValue("customer_city", customer.city || "");
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const formatRupiah = (value: number): string => {
    if (!value && value !== 0) return "";
    return value.toLocaleString("id-ID");
  };

  const parseRupiah = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, "");
    return Number(cleaned) || 0;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const calculateTotalDP = () => {
    return dpItems.reduce((sum, dp) => sum + (dp.amount || 0), 0);
  };

  const addDpItem = () => {
    const nextNum = dpItems.length + 1;
    setDpItems([...dpItems, { label: `DP ${nextNum}`, amount: 0 }]);
  };

  const removeDpItem = (index: number) => {
    const newDpItems = dpItems.filter((_, i) => i !== index);
    // Re-label
    const relabeled = newDpItems.map((dp, i) => ({ ...dp, label: `DP ${i + 1}` }));
    setDpItems(relabeled);
  };

  const updateDpItem = (index: number, amount: number) => {
    const newDpItems = [...dpItems];
    newDpItems[index] = { ...newDpItems[index], amount };
    setDpItems(newDpItems);
  };

  const handleSubmit = (data: FormData) => {
    const subtotal = calculateTotal();
    const downPayment = calculateTotalDP();
    const remaining = subtotal - downPayment;

    const invoiceData: InvoiceInput = {
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      no_aju: data.no_aju || null,
      bl_number: data.bl_number || null,
      customer_id: data.customer_id || null,
      customer_name: data.customer_name,
      customer_address: data.customer_address || null,
      customer_city: data.customer_city || null,
      party: data.party || null,
      flight_vessel: data.flight_vessel || null,
      origin: data.origin || null,
      no_pen: data.no_pen || null,
      no_invoice: data.no_invoice || null,
      description: data.description || null,
      delivery_date: data.delivery_date || null,
      subtotal,
      down_payment: downPayment,
      total_amount: subtotal,
      remaining_amount: remaining,
      dp_items: dpItems.length > 0 ? dpItems : null,
      status: "draft",
      notes: data.notes || null,
      job_order_id: invoice?.job_order_id || null,
      items: items.filter((item) => item.description.trim() !== ""),
    };

    onSubmit(invoiceData);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Invoice_${form.getValues("invoice_number")}.pdf`);
      
      toast.dismiss();
      toast.success("PDF berhasil diunduh");
    } catch (error) {
      toast.dismiss();
      toast.error("Gagal mengunduh PDF");
    }
  };

  const formValues = form.watch();
  const totalDP = calculateTotalDP();
  const previewData = {
    ...formValues,
    items,
    subtotal: calculateTotal(),
    total_amount: calculateTotal(),
    down_payment: totalDP,
    remaining_amount: calculateTotal() - totalDP,
    signer_name: signerName,
    dp_items: dpItems,
    bank_account_name: bankAccountName,
    bank_account_number: bankAccountNumber,
    bank_branch: bankBranch,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {invoice ? "Edit Invoice" : "Buat Invoice Baru"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Form Input
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Invoice Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="invoice_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Invoice *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="invoice_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="no_aju"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. AJU</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bl_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>B/L Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Pilih Pelanggan</FormLabel>
                      <Select onValueChange={handleCustomerChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan..." />
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
                  </div>

                  {/* Customer Info */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Informasi Pelanggan</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="customer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Pelanggan *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kota</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Detail Pengiriman</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="party"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Party</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: 1X40'" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="flight_vessel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flight / Vessel</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama kapal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From (Asal)</FormLabel>
                            <FormControl>
                              <Input placeholder="Kota asal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="no_pen"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. PEN</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="no_invoice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice No</FormLabel>
                            <FormControl>
                              <Input placeholder="Nomor invoice terkait" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Deskripsi barang" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="delivery_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Item Biaya</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Keterangan item biaya"
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            className="flex-1"
                          />
                          <div className="relative w-48">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                            <Input
                              placeholder="0"
                              value={item.amount ? formatRupiah(item.amount) : ""}
                              onChange={(e) => updateItem(index, "amount", parseRupiah(e.target.value))}
                              className="pl-9 text-right"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <p className="font-semibold">
                        Total: Rp {calculateTotal().toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Pembayaran (Down Payment)</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addDpItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah DP
                      </Button>
                    </div>
                    {dpItems.length > 0 ? (
                      <div className="space-y-2">
                        {dpItems.map((dp, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              value={dp.label}
                              readOnly
                              className="w-24 bg-muted text-center"
                            />
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                              <Input
                                placeholder="0"
                                value={dp.amount ? formatRupiah(dp.amount) : ""}
                                onChange={(e) => updateDpItem(index, parseRupiah(e.target.value))}
                                className="pl-9 text-right"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDpItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada Down Payment. Klik "Tambah DP" untuk menambahkan.</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div>
                        <FormLabel>Total DP</FormLabel>
                        <p className="text-lg font-semibold mt-2">
                          Rp {calculateTotalDP().toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <FormLabel>Total Invoice</FormLabel>
                        <p className="text-lg font-semibold mt-2">
                          Rp {calculateTotal().toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <FormLabel>Sisa Invoice</FormLabel>
                        <p className="text-lg font-semibold mt-2 text-primary">
                          Rp {(calculateTotal() - calculateTotalDP()).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Catatan & Tanda Tangan</h3>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Catatan tambahan..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Nama Penandatangan</FormLabel>
                      <Input
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="Nama penandatangan"
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <FormLabel>Nama Rekening</FormLabel>
                        <Input
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          placeholder="Nama rekening"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <FormLabel>No. Rekening</FormLabel>
                        <Input
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Nomor rekening"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <FormLabel>Bank & Cabang</FormLabel>
                        <Input
                          value={bankBranch}
                          onChange={(e) => setBankBranch(e.target.value)}
                          placeholder="Bank dan cabang"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Batal
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveTab("preview")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Menyimpan..." : invoice ? "Simpan Perubahan" : "Buat Invoice"}
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" onClick={() => setActiveTab("form")}>
                <FileText className="h-4 w-4 mr-2" />
                Kembali ke Form
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <ScrollArea className="h-[60vh] border rounded-lg">
              <InvoicePreview ref={previewRef} invoice={previewData} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
