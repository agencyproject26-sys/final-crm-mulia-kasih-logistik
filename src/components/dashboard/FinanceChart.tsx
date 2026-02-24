import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFinanceChartData } from "@/hooks/useDashboardCharts";
import { Loader2 } from "lucide-react";

const formatRupiahAxis = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
  return `${value}`;
};

const formatRupiahTooltip = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function FinanceChart() {
  const { data, isLoading } = useFinanceChartData();

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg">Ringkasan Keuangan</h3>
        <p className="text-sm text-muted-foreground">Pendapatan vs Pengeluaran per bulan (tahun ini)</p>
      </div>
      <div className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }}
                axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
                tickLine={false}
                tickFormatter={formatRupiahAxis}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatRupiahTooltip(value), name]}
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span style={{ color: "hsl(215, 16%, 47%)", fontSize: "12px" }}>{value}</span>}
              />
              <Bar dataKey="pendapatan" name="Pendapatan" fill="hsl(187, 71%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="hsl(222, 47%, 20%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="laba" name="Laba Bersih" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
