import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Eye, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { useInvoiceFinalAutoView, InvoiceFinalAutoEntry } from "@/hooks/useInvoiceFinalAutoView";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function InvoiceFinalAutoViewContent() {
  const { entries, isLoading, getDetailedItems } = useInvoiceFinalAutoView();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "positive") return entry.remaining_amount >= 0;
    if (activeTab === "negative") return entry.remaining_amount < 0;
    return true;
  });

  const totalAmount = entries.reduce((sum, e) => sum + e.combined_total, 0);
  const totalDP = entries.reduce((sum, e) => sum + e.down_payment, 0);
  const totalOutstanding = entries.reduce((sum, e) => sum + e.remaining_amount, 0);

  const openPreview = async (entry: InvoiceFinalAutoEntry) => {
    try {
      const { items, dpItems } = await getDetailedItems(entry);
      setPreviewInvoice({
        invoice_number: entry.invoice_number,
        invoice_date: entry.invoice_date,
        customer_name: entry.customer_name,
        customer_address: entry.customer_address,
        customer_city: entry.customer_city,
        no_aju: entry.no_aju,
        bl_number: entry.bl_number,
        party: entry.party,
        flight_vessel: entry.flight_vessel,
        origin: entry.origin,
        no_pen: entry.no_pen,
        no_invoice: entry.no_invoice,
        description: entry.description,
        delivery_date: entry.delivery_date,
        down_payment: entry.down_payment,
        remaining_amount: entry.remaining_amount,
        total_amount: entry.combined_total,
        items,
        dp_items: dpItems,
        reimbursement_remaining: null,
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Gagal memuat preview");
    }
  };

  const handleDownloadPDF = async (entry: InvoiceFinalAutoEntry) => {
    const { items, dpItems } = await getDetailedItems(entry);
    setPreviewInvoice({
      invoice_number: entry.invoice_number,
      invoice_date: entry.invoice_date,
      customer_name: entry.customer_name,
      customer_address: entry.customer_address,
      customer_city: entry.customer_city,
      no_aju: entry.no_aju,
      bl_number: entry.bl_number,
      party: entry.party,
      flight_vessel: entry.flight_vessel,
      origin: entry.origin,
      no_pen: entry.no_pen,
      no_invoice: entry.no_invoice,
      description: entry.description,
      delivery_date: entry.delivery_date,
      down_payment: entry.down_payment,
      remaining_amount: entry.remaining_amount,
      total_amount: entry.combined_total,
      items,
      dp_items: dpItems,
      reimbursement_remaining: null,
    });

    setTimeout(async () => {
      if (!previewRef.current) return;
      try {
        toast.loading("Generating PDF...");
        const canvas = await html2canvas(previewRef.current, {
          scale: 2, useCORS: true, logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const imgX = (pdfWidth - canvas.width * ratio) / 2;
        pdf.addImage(imgData, "PNG", imgX, 0, canvas.width * ratio, canvas.height * ratio);
        pdf.save(`Invoice_Final_${entry.invoice_number}.pdf`);
        toast.dismiss();
        toast.success("PDF berhasil diunduh");
        setPreviewInvoice(null);
      } catch {
        toast.dismiss();
        toast.error("Gagal mengunduh PDF");
      }
    }, 500);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Invoice</p>
              <p className="text-2xl font-bold font-display">{formatRupiah(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Down Payment</p>
              <p className="text-2xl font-bold font-display text-green-500">{formatRupiah(totalDP)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold font-display text-destructive">{formatRupiah(totalOutstanding)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Jumlah Invoice</p>
              <p className="text-2xl font-bold font-display">{entries.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-b border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="positive" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                Positif ({entries.filter((e) => e.remaining_amount >= 0).length})
              </TabsTrigger>
              <TabsTrigger value="negative" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-600">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                Negatif ({entries.filter((e) => e.remaining_amount < 0).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Reimbursement</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">DP</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Belum ada invoice</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.invoice_number} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">{entry.bl_number || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{entry.customer_city || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-500">
                      {formatRupiah(entry.reimbursement_total)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-purple-500">
                      {formatRupiah(entry.invoice_total)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRupiah(entry.combined_total)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-500">
                      {formatRupiah(entry.down_payment)}
                    </TableCell>
                    <TableCell className={cn("text-right font-medium", entry.remaining_amount >= 0 ? "text-green-600" : "text-red-500")}>
                      {formatRupiah(entry.remaining_amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.invoice_date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openPreview(entry)} title="Lihat">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(entry)} title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredEntries.length} dari {entries.length} invoice
          </p>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex justify-end mb-4">
            <Button onClick={() => previewInvoice && handleDownloadPDF(previewInvoice)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <ScrollArea className="h-[70vh]">
            {previewInvoice && <InvoicePreview ref={previewRef} invoice={previewInvoice} title="INVOICE FINAL" />}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hidden preview for PDF generation */}
      {previewInvoice && !isPreviewOpen && (
        <div className="fixed left-[-9999px] top-0">
          <InvoicePreview ref={previewRef} invoice={previewInvoice} title="INVOICE FINAL" />
        </div>
      )}
    </>
  );
}
