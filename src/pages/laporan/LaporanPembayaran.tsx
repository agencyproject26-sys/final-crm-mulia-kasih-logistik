import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useInvoiceDP } from "@/hooks/useInvoiceDP";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CreditCard,
  Download,
  Search,
  Calendar,
  TrendingUp,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function LaporanPembayaran() {
  const { invoices, isLoading: loadingInvoices } = useInvoices();
  const { invoicesDP, isLoading: loadingDP } = useInvoiceDP();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const isLoading = loadingInvoices || loadingDP;

  // Combine payments from invoices (DP paid) and invoice DP (paid)
  const payments = [
    ...(invoices
      ?.filter((inv) => inv.down_payment > 0)
      .map((inv) => ({
        id: inv.id,
        date: inv.invoice_date,
        reference: inv.invoice_number,
        customer: inv.customer_name,
        type: "Invoice DP" as const,
        amount: inv.down_payment,
        status: "Diterima",
      })) || []),
    ...(invoicesDP
      ?.filter((dp) => dp.status === "Lunas")
      .map((dp) => ({
        id: dp.id,
        date: dp.invoice_date,
        reference: dp.invoice_dp_number,
        customer: dp.customer_name,
        type: "Invoice DP Khusus" as const,
        amount: dp.total_amount,
        status: "Lunas",
      })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || payment.type === typeFilter;
    const matchesMonth =
      monthFilter === "all" ||
      format(new Date(payment.date), "yyyy-MM") === monthFilter;
    return matchesSearch && matchesType && matchesMonth;
  });

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const invoiceDPCount = filteredPayments.filter((p) => p.type === "Invoice DP").length;
  const invoiceDPKhususCount = filteredPayments.filter((p) => p.type === "Invoice DP Khusus").length;

  const months = [
    ...new Set(payments.map((p) => format(new Date(p.date), "yyyy-MM"))),
  ].sort().reverse();

  if (isLoading) {
    return (
      <MainLayout title="Laporan Pembayaran" subtitle="Rekap pembayaran masuk">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan Pembayaran" subtitle="Rekap seluruh pembayaran masuk">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Total Transaksi</p>
                <p className="text-3xl font-bold mt-1">{totalPayments}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Diterima</p>
                <p className="text-2xl font-bold mt-1">{formatRupiah(totalAmount)}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Invoice DP</p>
                <p className="text-3xl font-bold mt-1">{invoiceDPCount}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Invoice DP Khusus</p>
                <p className="text-3xl font-bold mt-1">{invoiceDPKhususCount}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari referensi atau pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Invoice DP">Invoice DP</SelectItem>
                <SelectItem value="Invoice DP Khusus">Invoice DP Khusus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + "-01"), "MMMM yyyy", { locale: id })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Daftar Pembayaran
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
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Referensi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30">
                    <TableCell>
                      {format(new Date(payment.date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell className="font-medium">{payment.reference}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatRupiah(payment.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pembayaran
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
