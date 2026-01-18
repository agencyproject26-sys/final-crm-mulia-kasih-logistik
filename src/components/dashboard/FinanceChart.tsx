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

const data = [
  { month: "Jan", pendapatan: 850, pengeluaran: 620, laba: 230 },
  { month: "Feb", pendapatan: 920, pengeluaran: 680, laba: 240 },
  { month: "Mar", pendapatan: 880, pengeluaran: 650, laba: 230 },
  { month: "Apr", pendapatan: 1050, pengeluaran: 750, laba: 300 },
  { month: "Mei", pendapatan: 980, pengeluaran: 720, laba: 260 },
  { month: "Jun", pendapatan: 1120, pengeluaran: 820, laba: 300 },
];

const formatRupiah = (value: number) => {
  return `${value}jt`;
};

export function FinanceChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="font-display font-semibold text-lg">Ringkasan Keuangan</h3>
        <p className="text-sm text-muted-foreground">Pendapatan vs Pengeluaran (dalam juta Rupiah)</p>
      </div>
      <div className="h-[300px]">
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
              tickFormatter={formatRupiah}
            />
            <Tooltip
              formatter={(value: number) => [`Rp ${value} jt`, ""]}
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
            <Bar
              dataKey="pendapatan"
              name="Pendapatan"
              fill="hsl(187, 71%, 35%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pengeluaran"
              name="Pengeluaran"
              fill="hsl(222, 47%, 20%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="laba"
              name="Laba Bersih"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
