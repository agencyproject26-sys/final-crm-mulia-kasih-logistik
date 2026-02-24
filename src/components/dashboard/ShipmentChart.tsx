import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useShipmentChartData } from "@/hooks/useDashboardCharts";
import { Loader2 } from "lucide-react";

export function ShipmentChart() {
  const { data, isLoading } = useShipmentChartData();

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg">Statistik Job Order</h3>
        <p className="text-sm text-muted-foreground">Jumlah job order per bulan (tahun ini)</p>
      </div>
      <div className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(222, 47%, 20%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(222, 47%, 20%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBaru" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 71%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 71%, 35%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
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
                allowDecimals={false}
              />
              <Tooltip
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
              <Area type="monotone" dataKey="totalOrders" name="Total Order" stroke="hsl(222, 47%, 20%)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              <Area type="monotone" dataKey="selesai" name="Selesai" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fillOpacity={1} fill="url(#colorSelesai)" />
              <Area type="monotone" dataKey="proses" name="Proses" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorProses)" />
              <Area type="monotone" dataKey="baru" name="Baru/Lainnya" stroke="hsl(187, 71%, 35%)" strokeWidth={2} fillOpacity={1} fill="url(#colorBaru)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
