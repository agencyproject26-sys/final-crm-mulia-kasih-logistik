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
  const [activeTab, setActiveTab] = useState("form");
  const previewRef = useRef<HTMLDivElement>(null);

  const DEFAULT_ITEM_DESCRIPTIONS = [
    "Trucking",
    "Tuslag",
    "Kawalan Truck",
    "Buruh Pabrik",
    "Lolo / Lift Off",
    "Penumpukan",
    "DO",
    "Materai",
  ];

  const getDefaultItems = (): InvoiceItem[] =>
    DEFAULT_ITEM_DESCRIPTIONS.map((desc) => ({ description: desc, amount: 0 }));

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
      notes: "",
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
        notes: "",
      });
      setItems(getDefaultItems());
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

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSubmit = (data: FormData) => {
    const subtotal = calculateTotal();
    const downPayment = data.down_payment || 0;
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
  const previewData = {
    ...formValues,
    items,
    subtotal: calculateTotal(),
    total_amount: calculateTotal(),
    remaining_amount: calculateTotal() - (formValues.down_payment || 0),
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
                          <Input
                            type="number"
                            placeholder="Jumlah (Rp)"
                            value={item.amount || ""}
                            onChange={(e) => updateItem(index, "amount", Number(e.target.value))}
                            className="w-40"
                          />
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
                    <h3 className="font-semibold">Pembayaran</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="down_payment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Down Payment (DP)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel>Total</FormLabel>
                        <p className="text-lg font-semibold mt-2">
                          Rp {calculateTotal().toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <FormLabel>Sisa Invoice</FormLabel>
                        <p className="text-lg font-semibold mt-2 text-primary">
                          Rp {(calculateTotal() - (form.watch("down_payment") || 0)).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
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
