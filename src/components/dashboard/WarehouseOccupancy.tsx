import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Terisi", value: 68, color: "hsl(187, 71%, 35%)" },
  { name: "Tersedia", value: 22, color: "hsl(142, 71%, 45%)" },
  { name: "Reserved", value: 10, color: "hsl(38, 92%, 50%)" },
];

export function WarehouseOccupancy() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg">Okupansi Gudang</h3>
        <p className="text-sm text-muted-foreground">Status kapasitas gudang</p>
      </div>
      
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, ""]}
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "8px",
              }}
            />
            <Legend 
              formatter={(value) => <span style={{ color: "hsl(215, 16%, 47%)", fontSize: "12px" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-secondary">1,250</p>
          <p className="text-xs text-muted-foreground">Total m²</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-success">275</p>
          <p className="text-xs text-muted-foreground">Tersedia m²</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-warning">125</p>
          <p className="text-xs text-muted-foreground">Reserved m²</p>
        </div>
      </div>
    </div>
  );
}
