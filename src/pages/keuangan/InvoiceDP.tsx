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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Users,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Building2,
  CalendarDays,
  FolderOpen,
} from "lucide-react";
import { useInvoiceDP, InvoiceDP, InvoiceDPInput, InvoiceDPItem } from "@/hooks/useInvoiceDP";
import { InvoiceDPDialog } from "@/components/invoicedp/InvoiceDPDialog";
import { InvoiceDPPreview } from "@/components/invoicedp/InvoiceDPPreview";
import { DeleteInvoiceDPDialog } from "@/components/invoicedp/DeleteInvoiceDPDialog";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ExcelJS from "exceljs";
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
  const [showCustomerSummary, setShowCustomerSummary] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "folder">("folder");
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([]);
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

  // Group invoices by customer for summary
  const customerSummary = Object.entries(
    invoicesDP.reduce((acc, inv) => {
      const key = inv.customer_name;
      if (!acc[key]) {
        acc[key] = {
          customer_name: inv.customer_name,
          customer_id: inv.customer_id,
          invoices: [],
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          partCount: 0,
        };
      }
      acc[key].invoices.push(inv);
      acc[key].totalAmount += inv.total_amount;
      acc[key].partCount += 1;
      if (inv.status === "paid") {
        acc[key].paidAmount += inv.total_amount;
      } else {
        acc[key].pendingAmount += inv.total_amount;
      }
      return acc;
    }, {} as Record<string, {
      customer_name: string;
      customer_id: string | null;
      invoices: InvoiceDP[];
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
      partCount: number;
    }>)
  ).sort((a, b) => b[1].totalAmount - a[1].totalAmount);

  // Group filtered invoices by customer name, then by date
  const groupedByCustomer = filteredInvoices.reduce((acc, inv) => {
    const customerKey = inv.customer_name || "Tanpa Pelanggan";
    if (!acc[customerKey]) {
      acc[customerKey] = {
        customer_name: customerKey,
        invoices: [],
        totalAmount: 0,
        byDate: {} as Record<string, InvoiceDP[]>,
      };
    }
    acc[customerKey].invoices.push(inv);
    acc[customerKey].totalAmount += inv.total_amount;
    
    // Group by date
    const dateKey = new Date(inv.invoice_date).toLocaleDateString("id-ID", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[customerKey].byDate[dateKey]) {
      acc[customerKey].byDate[dateKey] = [];
    }
    acc[customerKey].byDate[dateKey].push(inv);
    
    return acc;
  }, {} as Record<string, {
    customer_name: string;
    invoices: InvoiceDP[];
    totalAmount: number;
    byDate: Record<string, InvoiceDP[]>;
  }>);

  const sortedCustomerGroups = Object.entries(groupedByCustomer)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount);

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

  const formatRupiahPlain = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
    }).format(value);
  };

  const exportSummaryToExcel = async () => {
    const data = customerSummary.map(([_, summary]) => ({
      "Pelanggan": summary.customer_name,
      "Jumlah Part": summary.partCount,
      "Total DP (Rp)": summary.totalAmount,
      "Lunas (Rp)": summary.paidAmount,
      "Pending (Rp)": summary.pendingAmount,
      "Progress (%)": summary.totalAmount > 0 
        ? Math.round((summary.paidAmount / summary.totalAmount) * 100) 
        : 0,
    }));

    // Add totals row
    const totals = customerSummary.reduce(
      (acc, [_, summary]) => ({
        totalAmount: acc.totalAmount + summary.totalAmount,
        paidAmount: acc.paidAmount + summary.paidAmount,
        pendingAmount: acc.pendingAmount + summary.pendingAmount,
        partCount: acc.partCount + summary.partCount,
      }),
      { totalAmount: 0, paidAmount: 0, pendingAmount: 0, partCount: 0 }
    );

    data.push({
      "Pelanggan": "TOTAL",
      "Jumlah Part": totals.partCount,
      "Total DP (Rp)": totals.totalAmount,
      "Lunas (Rp)": totals.paidAmount,
      "Pending (Rp)": totals.pendingAmount,
      "Progress (%)": totals.totalAmount > 0 
        ? Math.round((totals.paidAmount / totals.totalAmount) * 100) 
        : 0,
    });

    // Create workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ringkasan DP");

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add data rows
    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      column.width = 18;
    });

    // Generate file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    link.href = url;
    link.download = `Ringkasan_Invoice_DP_${dateStr}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Excel berhasil diunduh");
  };

  const exportSummaryToPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("PT MULIA KASIH LOGISTIK", pageWidth / 2, y, { align: "center" });
    y += 8;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Ringkasan Invoice Down Payment per Pelanggan", pageWidth / 2, y, { align: "center" });
    y += 6;

    const now = new Date();
    pdf.setFontSize(10);
    pdf.text(`Tanggal: ${now.toLocaleDateString("id-ID")}`, pageWidth / 2, y, { align: "center" });
    y += 12;

    // Table header
    const colWidths = [60, 20, 35, 35, 35];
    const headers = ["Pelanggan", "Part", "Total DP", "Lunas", "Pending"];
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    
    let x = margin;
    headers.forEach((header, i) => {
      pdf.text(header, x + 2, y);
      x += colWidths[i];
    });
    y += 8;

    // Table rows
    pdf.setFont("helvetica", "normal");
    let totalAll = 0;
    let paidAll = 0;
    let pendingAll = 0;
    let partAll = 0;

    customerSummary.forEach(([_, summary]) => {
      x = margin;
      const customerName = summary.customer_name.length > 25 
        ? summary.customer_name.substring(0, 25) + "..." 
        : summary.customer_name;
      
      pdf.text(customerName, x + 2, y);
      x += colWidths[0];
      pdf.text(String(summary.partCount), x + 2, y);
      x += colWidths[1];
      pdf.text(formatRupiahPlain(summary.totalAmount), x + 2, y);
      x += colWidths[2];
      pdf.text(formatRupiahPlain(summary.paidAmount), x + 2, y);
      x += colWidths[3];
      pdf.text(formatRupiahPlain(summary.pendingAmount), x + 2, y);
      
      totalAll += summary.totalAmount;
      paidAll += summary.paidAmount;
      pendingAll += summary.pendingAmount;
      partAll += summary.partCount;
      y += 6;

      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    // Total row
    y += 2;
    pdf.setFillColor(220, 220, 220);
    pdf.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");
    pdf.setFont("helvetica", "bold");
    x = margin;
    pdf.text("TOTAL", x + 2, y);
    x += colWidths[0];
    pdf.text(String(partAll), x + 2, y);
    x += colWidths[1];
    pdf.text(formatRupiahPlain(totalAll), x + 2, y);
    x += colWidths[2];
    pdf.text(formatRupiahPlain(paidAll), x + 2, y);
    x += colWidths[3];
    pdf.text(formatRupiahPlain(pendingAll), x + 2, y);

    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    pdf.save(`Ringkasan_Invoice_DP_${dateStr}.pdf`);
    toast.success("PDF berhasil diunduh");
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

        {/* Customer Summary Section */}
        {customerSummary.length > 0 && (
          <Collapsible open={showCustomerSummary} onOpenChange={setShowCustomerSummary}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Ringkasan per Pelanggan</CardTitle>
                      <Badge variant="secondary">{customerSummary.length} Pelanggan</Badge>
                    </div>
                    {showCustomerSummary ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Export Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={exportSummaryToExcel}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportSummaryToPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Pelanggan</TableHead>
                          <TableHead className="text-center">Jumlah Part</TableHead>
                          <TableHead className="text-right">Total DP</TableHead>
                          <TableHead className="text-right">Lunas</TableHead>
                          <TableHead className="text-right">Pending</TableHead>
                          <TableHead className="text-center">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerSummary.map(([key, summary]) => {
                          const progressPercent = summary.totalAmount > 0 
                            ? Math.round((summary.paidAmount / summary.totalAmount) * 100) 
                            : 0;
                          return (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{summary.customer_name}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {summary.partCount} Part
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatRupiah(summary.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatRupiah(summary.paidAmount)}
                              </TableCell>
                              <TableCell className="text-right text-orange-600">
                                {formatRupiah(summary.pendingAmount)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 transition-all duration-300"
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-10 text-right">
                                    {progressPercent}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Tabs, View Toggle, and Search */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="sent">Terkirim</TabsTrigger>
                <TabsTrigger value="paid">Lunas</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "folder" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("folder")}
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Folder
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Tabel
                </Button>
              </div>
            </div>
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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat data...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada invoice DP ditemukan
              </div>
            ) : viewMode === "folder" ? (
              /* Folder View - Grouped by Customer and Date */
              <Accordion
                type="multiple"
                value={expandedCustomers}
                onValueChange={setExpandedCustomers}
                className="space-y-3"
              >
                {sortedCustomerGroups.map(([customerName, group]) => (
                  <AccordionItem
                    key={customerName}
                    value={customerName}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-base">{customerName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.invoices.length} Invoice • {Object.keys(group.byDate).length} Tanggal
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {formatRupiah(group.totalAmount)}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 pt-2">
                        {Object.entries(group.byDate)
                          .sort((a, b) => new Date(b[1][0].invoice_date).getTime() - new Date(a[1][0].invoice_date).getTime())
                          .map(([dateKey, invoices]) => (
                            <div key={dateKey} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
                                <CalendarDays className="h-4 w-4" />
                                <span className="font-medium">{dateKey}</span>
                                <Badge variant="secondary" className="ml-auto">
                                  {invoices.length} Invoice
                                </Badge>
                              </div>
                              <div className="grid gap-2 pl-2">
                                {invoices.map((invoice) => {
                                  const style = statusStyles[invoice.status || "draft"];
                                  const StatusIcon = style.icon;
                                  return (
                                    <div
                                      key={invoice.id}
                                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                              {invoice.invoice_dp_number}
                                            </span>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                              Part {invoice.part_number}
                                            </Badge>
                                          </div>
                                          {invoice.bl_number && (
                                            <p className="text-xs text-muted-foreground">
                                              BL: {invoice.bl_number}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span className="font-semibold">
                                          {formatRupiah(invoice.total_amount)}
                                        </span>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                          <StatusIcon className="h-3 w-3" />
                                          {statusLabels[invoice.status || "draft"]}
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              /* Table View */
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
                    {filteredInvoices.map((invoice) => {
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
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
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
