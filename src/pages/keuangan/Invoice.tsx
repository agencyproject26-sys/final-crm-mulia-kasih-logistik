import { useState } from "react";
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
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Send,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  customer: string;
  jobOrder: string;
  amount: number;
  dpAmount: number;
  paidAmount: number;
  tax: number;
  dueDate: string;
  status: "draft" | "sent" | "partial" | "paid" | "overdue";
  createdAt: string;
}

const invoices: Invoice[] = [
  { id: "INV-2024-095", customer: "PT Maju Bersama", jobOrder: "JO-2024-001", amount: 45000000, dpAmount: 13500000, paidAmount: 13500000, tax: 4500000, dueDate: "25 Jan 2026", status: "partial", createdAt: "18 Jan 2026" },
  { id: "INV-2024-094", customer: "CV Sejahtera", jobOrder: "JO-2024-002", amount: 28500000, dpAmount: 0, paidAmount: 28500000, tax: 2850000, dueDate: "20 Jan 2026", status: "paid", createdAt: "17 Jan 2026" },
  { id: "INV-2024-093", customer: "PT Global Trade", jobOrder: "JO-2024-003", amount: 67000000, dpAmount: 20000000, paidAmount: 0, tax: 6700000, dueDate: "15 Jan 2026", status: "overdue", createdAt: "15 Jan 2026" },
  { id: "INV-2024-092", customer: "PT Indo Cargo", jobOrder: "JO-2024-004", amount: 32000000, dpAmount: 0, paidAmount: 0, tax: 3200000, dueDate: "28 Jan 2026", status: "sent", createdAt: "14 Jan 2026" },
  { id: "INV-2024-091", customer: "CV Mandiri", jobOrder: "JO-2024-005", amount: 55000000, dpAmount: 16500000, paidAmount: 55000000, tax: 5500000, dueDate: "22 Jan 2026", status: "paid", createdAt: "12 Jan 2026" },
  { id: "INV-2024-090", customer: "PT Logistik Prima", jobOrder: "JO-2024-006", amount: 42000000, dpAmount: 0, paidAmount: 0, tax: 4200000, dueDate: "30 Jan 2026", status: "draft", createdAt: "18 Jan 2026" },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const statusStyles = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", icon: Receipt },
  sent: { bg: "bg-info/10", text: "text-info", icon: Send },
  partial: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  paid: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", icon: AlertCircle },
};

const statusLabels = {
  draft: "Draft",
  sent: "Terkirim",
  partial: "Sebagian",
  paid: "Lunas",
  overdue: "Jatuh Tempo",
};

export default function Invoice() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && invoice.status === activeTab;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalAmount - totalPaid;

  return (
    <MainLayout title="Invoice" subtitle="Kelola invoice pelanggan">
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
              <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
              <p className="text-2xl font-bold font-display text-success">{formatRupiah(totalPaid)}</p>
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
              <p className="text-sm text-muted-foreground">Total Invoice</p>
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
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
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
                <TableHead>Job Order</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Dibayar</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const remaining = invoice.amount + invoice.tax - invoice.paidAmount;
                const StatusIcon = statusStyles[invoice.status].icon;
                return (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">{invoice.createdAt}</p>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{invoice.jobOrder}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">{formatRupiah(invoice.amount)}</p>
                        <p className="text-xs text-muted-foreground">+PPN {formatRupiah(invoice.tax)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-success">
                      {formatRupiah(invoice.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatRupiah(remaining)}
                    </TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          statusStyles[invoice.status].bg,
                          statusStyles[invoice.status].text
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusLabels[invoice.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" /> Lihat
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" /> Kirim Email
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
    </MainLayout>
  );
}
