import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/useInvoices";
import { useExpenses } from "@/hooks/useExpenses";
import { useInvoiceDP } from "@/hooks/useInvoiceDP";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatRupiahShort = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
  return `Rp ${value}`;
};

export default function LaporanLabaRugi() {
  const { invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses();
  const { invoicesDP, isLoading: loadingDP } = useInvoiceDP();
  const [periodFilter, setPeriodFilter] = useState<string>("6months");

  const isLoading = loadingInvoices || loadingExpenses || loadingDP;

  const monthlyData = useMemo(() => {
    if (!invoices || !expenses || !invoicesDP) return [];

    const now = new Date();
    let months: Date[] = [];
    
    switch (periodFilter) {
      case "3months":
        months = eachMonthOfInterval({
          start: subMonths(startOfMonth(now), 2),
          end: startOfMonth(now),
        });
        break;
      case "6months":
        months = eachMonthOfInterval({
          start: subMonths(startOfMonth(now), 5),
          end: startOfMonth(now),
        });
        break;
      case "12months":
        months = eachMonthOfInterval({
          start: subMonths(startOfMonth(now), 11),
          end: startOfMonth(now),
        });
        break;
      default:
        months = eachMonthOfInterval({
          start: subMonths(startOfMonth(now), 5),
          end: startOfMonth(now),
        });
    }

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Revenue from invoices
      const monthlyInvoiceRevenue = invoices
        .filter((inv) => {
          const date = new Date(inv.invoice_date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Revenue from invoice DP
      const monthlyDPRevenue = invoicesDP
        .filter((dp) => {
          const date = new Date(dp.invoice_date);
          return date >= monthStart && date <= monthEnd && dp.status === "Lunas";
        })
        .reduce((sum, dp) => sum + dp.total_amount, 0);

      const totalRevenue = monthlyInvoiceRevenue + monthlyDPRevenue;

      // Expenses
      const monthlyExpenses = expenses
        .filter((exp) => {
          const date = new Date(exp.expense_date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      const profit = totalRevenue - monthlyExpenses;
      const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

      return {
        month: format(month, "MMM yyyy", { locale: id }),
        monthShort: format(month, "MMM", { locale: id }),
        revenue: totalRevenue,
        expenses: monthlyExpenses,
        profit,
        margin: Number(margin),
      };
    });
  }, [invoices, expenses, invoicesDP, periodFilter]);

  const totals = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
    
    return { totalRevenue, totalExpenses, totalProfit, avgMargin };
  }, [monthlyData]);

  const lastMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  
  const revenueChange = prevMonth && lastMonth 
    ? ((lastMonth.revenue - prevMonth.revenue) / (prevMonth.revenue || 1)) * 100 
    : 0;
  const expenseChange = prevMonth && lastMonth 
    ? ((lastMonth.expenses - prevMonth.expenses) / (prevMonth.expenses || 1)) * 100 
    : 0;
  const profitChange = prevMonth && lastMonth 
    ? ((lastMonth.profit - prevMonth.profit) / (Math.abs(prevMonth.profit) || 1)) * 100 
    : 0;

  if (isLoading) {
    return (
      <MainLayout title="Margin Perusahaan" subtitle="Analisis profitabilitas">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Margin Perusahaan" subtitle="Analisis profitabilitas perusahaan">
      {/* Period Filter */}
      <div className="flex justify-between items-center mb-6">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
            <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
            <SelectItem value="12months">12 Bulan Terakhir</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Pendapatan</p>
                <p className="text-2xl font-bold mt-1">{formatRupiahShort(totals.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {revenueChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm">{Math.abs(revenueChange).toFixed(1)}% vs bulan lalu</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Total Pengeluaran</p>
                <p className="text-2xl font-bold mt-1">{formatRupiahShort(totals.totalExpenses)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {expenseChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm">{Math.abs(expenseChange).toFixed(1)}% vs bulan lalu</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`text-white border-0 ${totals.totalProfit >= 0 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totals.totalProfit >= 0 ? 'text-blue-100' : 'text-red-100'}`}>
                  {totals.totalProfit >= 0 ? 'Total Laba' : 'Total Rugi'}
                </p>
                <p className="text-2xl font-bold mt-1">{formatRupiahShort(Math.abs(totals.totalProfit))}</p>
                <div className="flex items-center gap-1 mt-2">
                  {profitChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm">{Math.abs(profitChange).toFixed(1)}% vs bulan lalu</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Margin Rata-rata</p>
                <p className="text-3xl font-bold mt-1">{totals.avgMargin}%</p>
                <p className="text-violet-200 text-sm mt-2">Profit margin</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="monthShort" />
                  <YAxis tickFormatter={(value) => formatRupiahShort(value)} />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="revenue" name="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Laba/Rugi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="monthShort" />
                  <YAxis tickFormatter={(value) => formatRupiahShort(value)} />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="Laba/Rugi"
                    stroke="#3b82f6" 
                    fill="url(#profitGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Bulan</th>
                  <th className="px-4 py-3 text-right font-medium">Pendapatan</th>
                  <th className="px-4 py-3 text-right font-medium">Pengeluaran</th>
                  <th className="px-4 py-3 text-right font-medium">Laba/Rugi</th>
                  <th className="px-4 py-3 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{data.month}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatRupiah(data.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {formatRupiah(data.expenses)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${data.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {data.profit > 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : data.profit < 0 ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        {formatRupiah(Math.abs(data.profit))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        data.margin >= 20 ? 'bg-green-100 text-green-700' :
                        data.margin >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        data.margin >= 0 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/50 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {formatRupiah(totals.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatRupiah(totals.totalExpenses)}
                  </td>
                  <td className={`px-4 py-3 text-right ${totals.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatRupiah(totals.totalProfit)}
                  </td>
                  <td className="px-4 py-3 text-right">{totals.avgMargin}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
