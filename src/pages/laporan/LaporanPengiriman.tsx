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
import { useJobOrders } from "@/hooks/useJobOrders";
import { useTrackings } from "@/hooks/useTrackings";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Truck,
  Download,
  Search,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Ship,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Dalam Proses": "#f59e0b",
  "Selesai": "#10b981",
  "Pending": "#6b7280",
  "Dibatalkan": "#ef4444",
};

export default function LaporanPengiriman() {
  const { jobOrders, isLoading: loadingJO } = useJobOrders();
  const { data: trackings, isLoading: loadingTracking } = useTrackings();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const isLoading = loadingJO || loadingTracking;

  const filteredOrders = jobOrders?.filter((order) => {
    const matchesSearch =
      order.job_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.bl_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesMonth =
      monthFilter === "all" ||
      format(new Date(order.created_at), "yyyy-MM") === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalOrders = filteredOrders?.length || 0;
  const completedOrders = filteredOrders?.filter((o) => o.status === "Selesai").length || 0;
  const inProgressOrders = filteredOrders?.filter((o) => o.status === "Dalam Proses").length || 0;
  const pendingOrders = filteredOrders?.filter((o) => o.status === "Pending" || !o.status).length || 0;

  const statusData = [
    { name: "Selesai", value: completedOrders, color: "#10b981" },
    { name: "Dalam Proses", value: inProgressOrders, color: "#f59e0b" },
    { name: "Pending", value: pendingOrders, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Monthly trend data
  const monthlyData = jobOrders?.reduce((acc, order) => {
    const month = format(new Date(order.created_at), "MMM", { locale: id });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.total += 1;
      if (order.status === "Selesai") existing.selesai += 1;
    } else {
      acc.push({
        month,
        total: 1,
        selesai: order.status === "Selesai" ? 1 : 0,
      });
    }
    return acc;
  }, [] as { month: string; total: number; selesai: number }[]) || [];

  const months = [
    ...new Set(
      jobOrders?.map((o) => format(new Date(o.created_at), "yyyy-MM")) || []
    ),
  ].sort().reverse();

  const getStatusBadge = (status: string | null) => {
    const statusText = status || "Pending";
    const colorClass = {
      "Selesai": "bg-green-100 text-green-700",
      "Dalam Proses": "bg-amber-100 text-amber-700",
      "Pending": "bg-gray-100 text-gray-700",
      "Dibatalkan": "bg-red-100 text-red-700",
    }[statusText] || "bg-gray-100 text-gray-700";

    return <Badge className={colorClass}>{statusText}</Badge>;
  };

  if (isLoading) {
    return (
      <MainLayout title="Laporan Pengiriman" subtitle="Analisis pengiriman dan tracking">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan Pengiriman" subtitle="Analisis pengiriman dan tracking perusahaan">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Pengiriman</p>
                <p className="text-3xl font-bold mt-1">{totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Selesai</p>
                <p className="text-3xl font-bold mt-1">{completedOrders}</p>
                <p className="text-emerald-200 text-xs mt-1">
                  {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Dalam Proses</p>
                <p className="text-3xl font-bold mt-1">{inProgressOrders}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Active Tracking</p>
                <p className="text-3xl font-bold mt-1">{trackings?.length || 0}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Trend Pengiriman Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Order" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="selesai" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
                placeholder="Cari no. job order, pelanggan, atau BL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
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
            <Package className="h-5 w-5" />
            Daftar Pengiriman
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
                  <TableHead>No. Job Order</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>No. BL</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.slice(0, 20).map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{order.job_order_number}</TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>{order.customer_name || "-"}</TableCell>
                    <TableCell>{order.bl_number || "-"}</TableCell>
                    <TableCell>{order.tujuan || "-"}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredOrders || filteredOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pengiriman
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
