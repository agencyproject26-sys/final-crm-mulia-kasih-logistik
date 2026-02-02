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
import { useExpenses } from "@/hooks/useExpenses";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Receipt,
  Download,
  Search,
  Calendar,
  Truck,
  Ship,
  Warehouse,
  Anchor,
  Briefcase,
  TrendingDown,
  PieChart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "Biaya Truk": { label: "Biaya Truk", icon: Truck, color: "#3b82f6" },
  "Biaya Pelabuhan": { label: "Biaya Pelabuhan", icon: Anchor, color: "#8b5cf6" },
  "Biaya Shipping Line": { label: "Biaya Shipping Line", icon: Ship, color: "#06b6d4" },
  "Biaya Gudang": { label: "Biaya Gudang", icon: Warehouse, color: "#f59e0b" },
  "Biaya Operasional": { label: "Biaya Operasional", icon: Briefcase, color: "#10b981" },
};

export default function LaporanPengeluaran() {
  const { data: expenses, isLoading } = useExpenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const filteredExpenses = expenses?.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesMonth =
      monthFilter === "all" ||
      format(new Date(expense.expense_date), "yyyy-MM") === monthFilter;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const totalExpenses = filteredExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const expenseCount = filteredExpenses?.length || 0;

  // Category breakdown
  const categoryBreakdown = Object.keys(CATEGORY_CONFIG).map((category) => {
    const amount = filteredExpenses
      ?.filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0) || 0;
    return {
      name: CATEGORY_CONFIG[category].label,
      value: amount,
      color: CATEGORY_CONFIG[category].color,
    };
  }).filter((item) => item.value > 0);

  const months = [
    ...new Set(
      expenses?.map((exp) => format(new Date(exp.expense_date), "yyyy-MM")) || []
    ),
  ].sort().reverse();

  const getCategoryIcon = (category: string) => {
    const config = CATEGORY_CONFIG[category];
    if (config) {
      const Icon = config.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Receipt className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <MainLayout title="Laporan Pengeluaran" subtitle="Rekap biaya operasional">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan Pengeluaran" subtitle="Analisis biaya operasional perusahaan">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Total Pengeluaran</p>
                <p className="text-3xl font-bold mt-1">{formatRupiah(totalExpenses)}</p>
                <p className="text-rose-200 text-sm mt-1">{expenseCount} transaksi</p>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingDown className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(CATEGORY_CONFIG).slice(0, 2).map(([key, config]) => {
          const amount = filteredExpenses
            ?.filter((exp) => exp.category === key)
            .reduce((sum, exp) => sum + exp.amount, 0) || 0;
          const Icon = config.icon;
          return (
            <Card key={key} className="border-0 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{config.label}</p>
                    <p className="text-xl font-bold mt-1">{formatRupiah(amount)}</p>
                  </div>
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart and Category Cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribusi Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rincian per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const amount = filteredExpenses
                ?.filter((exp) => exp.category === key)
                .reduce((sum, exp) => sum + exp.amount, 0) || 0;
              const percentage = totalExpenses ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                  <p className="text-sm font-semibold">{formatRupiah(amount)}</p>
                </div>
              );
            })}
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
                placeholder="Cari deskripsi pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
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
            <Receipt className="h-5 w-5" />
            Daftar Pengeluaran
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
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses?.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/30">
                    <TableCell>
                      {format(new Date(expense.expense_date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(expense.category)}
                        <span>{expense.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.vendors?.company_name || "-"}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -{formatRupiah(expense.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredExpenses || filteredExpenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pengeluaran
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
