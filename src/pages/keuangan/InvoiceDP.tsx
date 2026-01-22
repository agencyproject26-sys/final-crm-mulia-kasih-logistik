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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  FileText,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useInvoiceDP, InvoiceDP, InvoiceDPInput, InvoiceDPItem } from "@/hooks/useInvoiceDP";
import { InvoiceDPDialog } from "@/components/invoicedp/InvoiceDPDialog";
import { InvoiceDPPreview } from "@/components/invoicedp/InvoiceDPPreview";
import { DeleteInvoiceDPDialog } from "@/components/invoicedp/DeleteInvoiceDPDialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Clock },
  sent: { bg: "bg-blue-100", text: "text-blue-800", icon: FileText },
  paid: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
};

export default function InvoiceDPPage() {
  const {
    invoicesDP,
    isLoading,
    createInvoiceDP,
    updateInvoiceDP,
    deleteInvoiceDP,
    duplicateAsNextPart,
    getInvoiceDPWithItems,
  } = useInvoiceDP();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<(InvoiceDP & { items?: InvoiceDPItem[] }) | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<(InvoiceDP & { items?: InvoiceDPItem[] }) | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Filter by search and status tab
  const filteredInvoices = invoicesDP.filter((inv) => {
    const matchesSearch =
      inv.invoice_dp_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || inv.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Group invoices by customer for part counting
  const groupedByCustomer = invoicesDP.reduce((acc, inv) => {
    const key = inv.customer_id || inv.customer_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(inv);
    return acc;
  }, {} as Record<string, InvoiceDP[]>);

  // Stats
  const totalAmount = invoicesDP.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidAmount = invoicesDP
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingAmount = invoicesDP
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const handleCreate = (data: InvoiceDPInput) => {
    createInvoiceDP.mutate(data);
  };

  const handleUpdate = (data: InvoiceDPInput) => {
    if (selectedInvoice) {
      updateInvoiceDP.mutate({ id: selectedInvoice.id, input: data });
    }
  };

  const handleDelete = () => {
    if (selectedInvoice) {
      deleteInvoiceDP.mutate(selectedInvoice.id);
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const openEditDialog = async (invoice: InvoiceDP) => {
    const invoiceWithItems = await getInvoiceDPWithItems(invoice.id);
    setSelectedInvoice(invoiceWithItems);
    setIsDialogOpen(true);
  };

  const openPreviewDialog = async (invoice: InvoiceDP) => {
    const invoiceWithItems = await getInvoiceDPWithItems(invoice.id);
    setPreviewInvoice(invoiceWithItems);
    setIsPreviewOpen(true);
  };

  const openDeleteDialog = (invoice: InvoiceDP) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateNextPart = (invoice: InvoiceDP) => {
    duplicateAsNextPart.mutate(invoice.id);
  };

  const handleDownloadPDF = async (invoice: InvoiceDP) => {
    const invoiceWithItems = await getInvoiceDPWithItems(invoice.id);
    setPreviewInvoice(invoiceWithItems);

    setTimeout(async () => {
      if (previewRef.current) {
        try {
          const canvas = await html2canvas(previewRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`InvoiceDP_${invoice.invoice_dp_number}_Part${invoice.part_number}.pdf`);
          toast.success("PDF berhasil diunduh");
        } catch (error) {
          toast.error("Gagal mengunduh PDF");
        }
      }
    }, 500);
  };

  return (
    <MainLayout title="Invoice DP" subtitle="Kelola Invoice Down Payment dengan multi-part">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoice DP</h1>
            <p className="text-muted-foreground">
              Kelola Invoice Down Payment dengan multi-part
            </p>
          </div>
          <Button onClick={() => {
            setSelectedInvoice(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice DP
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoice DP
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRupiah(totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DP Lunas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatRupiah(paidAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DP Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatRupiah(pendingAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jumlah Invoice
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoicesDP.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="sent">Terkirim</TabsTrigger>
              <TabsTrigger value="paid">Lunas</TabsTrigger>
            </TabsList>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari invoice DP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice DP</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada invoice DP ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const style = statusStyles[invoice.status || "draft"];
                      const StatusIcon = style.icon;
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_dp_number}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Part {invoice.part_number}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoice_date).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>{invoice.customer_name}</TableCell>
                          <TableCell className="font-medium">
                            {formatRupiah(invoice.total_amount)}
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusLabels[invoice.status || "draft"]}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openPreviewDialog(invoice)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(invoice)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateNextPart(invoice)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Buat Part Baru
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(invoice)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
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
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <InvoiceDPDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={selectedInvoice ? handleUpdate : handleCreate}
          invoice={selectedInvoice || undefined}
        />

        {/* Delete Dialog */}
        <DeleteInvoiceDPDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          invoice={selectedInvoice}
        />

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Preview Invoice DP</DialogTitle>
            {previewInvoice && <InvoiceDPPreview invoice={previewInvoice} />}
          </DialogContent>
        </Dialog>

        {/* Hidden Preview for PDF Generation */}
        <div className="fixed left-[-9999px] top-0">
          {previewInvoice && (
            <InvoiceDPPreview ref={previewRef} invoice={previewInvoice} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
