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

const data = [
  { month: "Jan", ekspor: 45, impor: 32, domestik: 28, trucking: 65 },
  { month: "Feb", ekspor: 52, impor: 38, domestik: 35, trucking: 72 },
  { month: "Mar", ekspor: 48, impor: 45, domestik: 42, trucking: 68 },
  { month: "Apr", ekspor: 61, impor: 52, domestik: 38, trucking: 85 },
  { month: "Mei", ekspor: 55, impor: 48, domestik: 45, trucking: 78 },
  { month: "Jun", ekspor: 67, impor: 55, domestik: 52, trucking: 92 },
  { month: "Jul", ekspor: 72, impor: 62, domestik: 48, trucking: 88 },
  { month: "Agu", ekspor: 68, impor: 58, domestik: 55, trucking: 95 },
  { month: "Sep", ekspor: 75, impor: 65, domestik: 62, trucking: 102 },
  { month: "Okt", ekspor: 82, impor: 72, domestik: 58, trucking: 98 },
  { month: "Nov", ekspor: 78, impor: 68, domestik: 65, trucking: 105 },
  { month: "Des", ekspor: 85, impor: 75, domestik: 72, trucking: 112 },
];

export function ShipmentChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg">Statistik Pengiriman</h3>
        <p className="text-sm text-muted-foreground">Jumlah pengiriman per bulan</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEkspor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(222, 47%, 20%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(222, 47%, 20%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorImpor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 71%, 35%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187, 71%, 35%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDomestik" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTrucking" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
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
            <Area
              type="monotone"
              dataKey="ekspor"
              name="Ekspor"
              stroke="hsl(222, 47%, 20%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEkspor)"
            />
            <Area
              type="monotone"
              dataKey="impor"
              name="Impor"
              stroke="hsl(187, 71%, 35%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorImpor)"
            />
            <Area
              type="monotone"
              dataKey="domestik"
              name="Domestik"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDomestik)"
            />
            <Area
              type="monotone"
              dataKey="trucking"
              name="Trucking"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTrucking)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
