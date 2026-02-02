import { useState, useMemo } from "react";
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
import { useWarehouses } from "@/hooks/useWarehouses";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Warehouse,
  Download,
  Search,
  Package,
  TrendingUp,
  Box,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const HANDLING_COLORS: Record<string, string> = {
  "IN": "#10b981",
  "OUT": "#f43f5e",
  "STORAGE": "#3b82f6",
};

export default function LaporanOkupansiGudang() {
  const { data: warehouses, isLoading } = useWarehouses();
  const [searchTerm, setSearchTerm] = useState("");
  const [handlingFilter, setHandlingFilter] = useState<string>("all");

  const filteredWarehouses = warehouses?.filter((wh) => {
    const matchesSearch =
      wh.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.party?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHandling = handlingFilter === "all" || wh.handling_in_out === handlingFilter;
    return matchesSearch && matchesHandling;
  });

  const stats = useMemo(() => {
    if (!warehouses) return { totalCBM: 0, totalItems: 0, totalValue: 0, inItems: 0, outItems: 0 };

    const totalCBM = warehouses.reduce((sum, wh) => sum + (wh.cbm || 0), 0);
    const totalItems = warehouses.reduce((sum, wh) => sum + (wh.quantity || 0), 0);
    const totalValue = warehouses.reduce((sum, wh) => sum + ((wh.quantity || 0) * (wh.unit_price || 0)), 0);
    const inItems = warehouses.filter((wh) => wh.handling_in_out === "IN").length;
    const outItems = warehouses.filter((wh) => wh.handling_in_out === "OUT").length;

    return { totalCBM, totalItems, totalValue, inItems, outItems };
  }, [warehouses]);

  // Customer breakdown
  const customerData = useMemo(() => {
    if (!warehouses) return [];

    const customerCBM = warehouses.reduce((acc, wh) => {
      const customer = wh.customer_name;
      acc[customer] = (acc[customer] || 0) + (wh.cbm || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerCBM)
      .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + "..." : name, value, fullName: name }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [warehouses]);

  // Handling distribution
  const handlingData = [
    { name: "Masuk (IN)", value: stats.inItems, color: "#10b981" },
    { name: "Keluar (OUT)", value: stats.outItems, color: "#f43f5e" },
    { name: "Storage", value: Math.max(0, (warehouses?.length || 0) - stats.inItems - stats.outItems), color: "#3b82f6" },
  ].filter((item) => item.value > 0);

  // Capacity usage (simulated)
  const maxCapacity = 5000; // CBM
  const usagePercentage = ((stats.totalCBM / maxCapacity) * 100).toFixed(1);

  if (isLoading) {
    return (
      <MainLayout title="Okupansi Gudang" subtitle="Analisis kapasitas gudang">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Okupansi Gudang" subtitle="Analisis kapasitas dan inventori gudang">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Total CBM</p>
                <p className="text-3xl font-bold mt-1">{stats.totalCBM.toFixed(1)}</p>
                <p className="text-indigo-200 text-xs mt-1">Cubic Meter</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Warehouse className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Item</p>
                <p className="text-3xl font-bold mt-1">{stats.totalItems.toLocaleString("id-ID")}</p>
                <p className="text-emerald-200 text-xs mt-1">{warehouses?.length || 0} entry</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Nilai</p>
                <p className="text-xl font-bold mt-1">{formatRupiah(stats.totalValue)}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Tingkat Okupansi</p>
                <p className="text-3xl font-bold mt-1">{usagePercentage}%</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Bar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kapasitas Gudang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terpakai: {stats.totalCBM.toFixed(1)} CBM</span>
              <span className="text-muted-foreground">Kapasitas Max: {maxCapacity.toLocaleString()} CBM</span>
            </div>
            <Progress 
              value={Number(usagePercentage)} 
              className="h-4"
            />
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Terpakai ({usagePercentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span>Tersedia ({(100 - Number(usagePercentage)).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>CBM per Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)} CBM`}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={handlingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {handlingData.map((entry, index) => (
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
                placeholder="Cari pelanggan atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={handlingFilter} onValueChange={setHandlingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Handling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Handling</SelectItem>
                <SelectItem value="IN">Masuk (IN)</SelectItem>
                <SelectItem value="OUT">Keluar (OUT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Daftar Inventori Gudang
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
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-center">Handling</TableHead>
                  <TableHead className="text-right">CBM</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses?.map((wh) => (
                  <TableRow key={wh.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{wh.customer_name}</TableCell>
                    <TableCell>{wh.description || "-"}</TableCell>
                    <TableCell>{wh.party || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          wh.handling_in_out === "IN"
                            ? "bg-green-100 text-green-700"
                            : wh.handling_in_out === "OUT"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {wh.handling_in_out === "IN" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {wh.handling_in_out === "OUT" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {wh.handling_in_out || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{wh.cbm?.toFixed(2) || "-"}</TableCell>
                    <TableCell className="text-right">{wh.quantity?.toLocaleString("id-ID") || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatRupiah((wh.quantity || 0) * (wh.unit_price || 0))}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredWarehouses || filteredWarehouses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data gudang
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
