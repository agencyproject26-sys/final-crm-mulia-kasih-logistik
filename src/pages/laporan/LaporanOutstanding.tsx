import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/useInvoices";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertCircle,
  Download,
  Search,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function LaporanOutstanding() {
  const { invoices, isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState<string>("all");

  const outstandingInvoices = invoices
    ?.filter((inv) => inv.status !== "Lunas" && inv.remaining_amount > 0)
    .map((inv) => {
      const daysOverdue = differenceInDays(new Date(), new Date(inv.invoice_date));
      let ageCategory: "current" | "30days" | "60days" | "90days" | "over90";
      if (daysOverdue <= 30) ageCategory = "current";
      else if (daysOverdue <= 60) ageCategory = "30days";
      else if (daysOverdue <= 90) ageCategory = "60days";
      else if (daysOverdue <= 120) ageCategory = "90days";
      else ageCategory = "over90";

      return {
        ...inv,
        daysOverdue,
        ageCategory,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const filteredInvoices = outstandingInvoices?.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = ageFilter === "all" || invoice.ageCategory === ageFilter;
    return matchesSearch && matchesAge;
  });

  const totalOutstanding = filteredInvoices?.reduce((sum, inv) => sum + inv.remaining_amount, 0) || 0;
  const totalInvoices = filteredInvoices?.length || 0;
  const current = outstandingInvoices?.filter((inv) => inv.ageCategory === "current").reduce((sum, inv) => sum + inv.remaining_amount, 0) || 0;
  const overdue30 = outstandingInvoices?.filter((inv) => inv.ageCategory === "30days").reduce((sum, inv) => sum + inv.remaining_amount, 0) || 0;
  const overdue60 = outstandingInvoices?.filter((inv) => inv.ageCategory === "60days").reduce((sum, inv) => sum + inv.remaining_amount, 0) || 0;
  const overdue90Plus = outstandingInvoices?.filter((inv) => inv.ageCategory === "90days" || inv.ageCategory === "over90").reduce((sum, inv) => sum + inv.remaining_amount, 0) || 0;

  const getAgeBadge = (ageCategory: string, days: number) => {
    switch (ageCategory) {
      case "current":
        return <Badge className="bg-green-100 text-green-700">{days} hari</Badge>;
      case "30days":
        return <Badge className="bg-yellow-100 text-yellow-700">{days} hari</Badge>;
      case "60days":
        return <Badge className="bg-orange-100 text-orange-700">{days} hari</Badge>;
      case "90days":
      case "over90":
        return <Badge className="bg-red-100 text-red-700">{days} hari</Badge>;
      default:
        return <Badge>{days} hari</Badge>;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Laporan Outstanding" subtitle="Piutang belum terbayar">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan Outstanding" subtitle="Analisis piutang belum terbayar">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Outstanding</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(totalOutstanding)}</p>
                <p className="text-red-200 text-xs mt-1">{totalInvoices} invoice</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">0-30 Hari</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(current)}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">31-60 Hari</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(overdue30 + overdue60)}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">&gt; 90 Hari</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(overdue90Plus)}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Aging Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm">0-30 hari</span>
              <Progress value={totalOutstanding ? (current / totalOutstanding) * 100 : 0} className="flex-1 h-3" />
              <span className="w-32 text-right text-sm font-medium">{formatRupiah(current)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm">31-60 hari</span>
              <Progress value={totalOutstanding ? (overdue30 / totalOutstanding) * 100 : 0} className="flex-1 h-3 [&>div]:bg-yellow-500" />
              <span className="w-32 text-right text-sm font-medium">{formatRupiah(overdue30)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm">61-90 hari</span>
              <Progress value={totalOutstanding ? (overdue60 / totalOutstanding) * 100 : 0} className="flex-1 h-3 [&>div]:bg-orange-500" />
              <span className="w-32 text-right text-sm font-medium">{formatRupiah(overdue60)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm">&gt; 90 hari</span>
              <Progress value={totalOutstanding ? (overdue90Plus / totalOutstanding) * 100 : 0} className="flex-1 h-3 [&>div]:bg-red-500" />
              <span className="w-32 text-right text-sm font-medium">{formatRupiah(overdue90Plus)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor invoice atau pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Usia Piutang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Usia</SelectItem>
                <SelectItem value="current">0-30 Hari</SelectItem>
                <SelectItem value="30days">31-60 Hari</SelectItem>
                <SelectItem value="60days">61-90 Hari</SelectItem>
                <SelectItem value="90days">&gt; 90 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Daftar Piutang Outstanding
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total Invoice</TableHead>
                  <TableHead className="text-right">Sudah Bayar</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                  <TableHead className="text-center">Usia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(invoice.total_amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatRupiah(invoice.down_payment)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatRupiah(invoice.remaining_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getAgeBadge(invoice.ageCategory, invoice.daysOverdue)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredInvoices || filteredInvoices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada piutang outstanding
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
