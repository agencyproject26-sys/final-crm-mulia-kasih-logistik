import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Pencil,
  Trash2,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInvoices, Invoice, InvoiceInput, InvoiceItem } from "@/hooks/useInvoices";
import { InvoiceDialog } from "@/components/invoice/InvoiceDialog";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { DeleteInvoiceDialog } from "@/components/invoice/DeleteInvoiceDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt },
  sent: { bg: "bg-blue-500/10", text: "text-blue-500", icon: FileText },
  partial: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
  paid: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle2 },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertCircle },
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  partial: "Sebagian",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
};

export default function InvoicePage() {
  const { invoices, isLoading, createInvoice, updateInvoice, deleteInvoice, getInvoiceWithItems } = useInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<(Partial<Invoice> & { items: InvoiceItem[] }) | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && invoice.status === activeTab;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.down_payment), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.remaining_amount), 0);

  const handleCreate = (data: InvoiceInput) => {
    createInvoice.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedInvoice(null);
      },
    });
  };

  const handleUpdate = (data: InvoiceInput) => {
    if (selectedInvoice) {
      updateInvoice.mutate(
        { id: selectedInvoice.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedInvoice(null);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedInvoice) {
      deleteInvoice.mutate(selectedInvoice.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedInvoice(null);
        },
      });
    }
  };

  const openEditDialog = async (invoice: Invoice) => {
    const invoiceWithItems = await getInvoiceWithItems(invoice.id);
    if (invoiceWithItems) {
      setSelectedInvoice(invoiceWithItems);
      setIsDialogOpen(true);
    }
  };

  const openPreviewDialog = async (invoice: Invoice) => {
    const invoiceWithItems = await getInvoiceWithItems(invoice.id);
    if (invoiceWithItems) {
      setPreviewInvoice({ ...invoiceWithItems, items: invoiceWithItems.items || [] });
      setIsPreviewOpen(true);
    }
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteOpen(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const invoiceWithItems = await getInvoiceWithItems(invoice.id);
    if (invoiceWithItems) {
      setPreviewInvoice({ ...invoiceWithItems, items: invoiceWithItems.items || [] });
      
      // Wait for render
      setTimeout(async () => {
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
          pdf.save(`Invoice_${invoice.invoice_number}.pdf`);

          toast.dismiss();
          toast.success("PDF berhasil diunduh");
          setPreviewInvoice(null);
        } catch (error) {
          toast.dismiss();
          toast.error("Gagal mengunduh PDF");
        }
      }, 500);
    }
  };

  const getStatusInfo = (status: string | null) => {
    const s = status || "draft";
    return statusStyles[s] || statusStyles.draft;
  };

  return (
    <MainLayout title="INVOICE" subtitle="Kelola invoice pelanggan">
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
              <p className="text-2xl font-bold font-display text-green-500">{formatRupiah(totalPaid)}</p>
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
              <p className="text-2xl font-bold font-display">{invoices.length}</p>
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
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="sent">Terkirim</TabsTrigger>
              <TabsTrigger value="partial">Sebagian</TabsTrigger>
              <TabsTrigger value="paid">Lunas</TabsTrigger>
              <TabsTrigger value="overdue">Jatuh Tempo</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button onClick={() => {
              setSelectedInvoice(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Invoice
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">DP</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Belum ada invoice</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusInfo = getStatusInfo(invoice.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.bl_number || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer_city || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(Number(invoice.total_amount))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-500">
                        {formatRupiah(Number(invoice.down_payment))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {formatRupiah(Number(invoice.remaining_amount))}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            statusInfo.bg,
                            statusInfo.text
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[invoice.status || "draft"]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => openPreviewDialog(invoice)}>
                              <Eye className="h-4 w-4 mr-2" /> Lihat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <Download className="h-4 w-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(invoice)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(invoice)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredInvoices.length} dari {invoices.length} invoice
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm">
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={selectedInvoice ? handleUpdate : handleCreate}
        invoice={selectedInvoice}
        isLoading={createInvoice.isPending || updateInvoice.isPending}
      />

      <DeleteInvoiceDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        invoice={selectedInvoice}
        onConfirm={handleDelete}
        isLoading={deleteInvoice.isPending}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex justify-end mb-4">
            <Button onClick={() => previewInvoice && handleDownloadPDF(previewInvoice as Invoice)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <ScrollArea className="h-[70vh]">
            {previewInvoice && <InvoicePreview ref={previewRef} invoice={previewInvoice} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hidden preview for PDF generation */}
      {previewInvoice && !isPreviewOpen && (
        <div className="fixed left-[-9999px] top-0">
          <InvoicePreview ref={previewRef} invoice={previewInvoice} />
        </div>
      )}
    </MainLayout>
  );
}
