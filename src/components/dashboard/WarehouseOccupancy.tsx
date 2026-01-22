import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useWarehouseStats } from "@/hooks/useDashboardStats";
import { Loader2 } from "lucide-react";

export function WarehouseOccupancy() {
  const { data: stats, isLoading } = useWarehouseStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-lg">Okupansi Gudang</h3>
          <p className="text-sm text-muted-foreground">Status kapasitas gudang</p>
        </div>
        <div className="h-[220px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const data = [
    { name: "Aktif", value: stats?.activeItems || 0, color: "hsl(187, 71%, 35%)" },
    { name: "Tidak Aktif", value: stats?.inactiveItems || 0, color: "hsl(38, 92%, 50%)" },
  ];

  const hasData = (stats?.activeItems || 0) + (stats?.inactiveItems || 0) > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg">Okupansi Gudang</h3>
        <p className="text-sm text-muted-foreground">Status kapasitas gudang</p>
      </div>
      
      {hasData ? (
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
                formatter={(value: number) => [`${value} item`, ""]}
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
      ) : (
        <div className="h-[220px] flex items-center justify-center text-muted-foreground">
          Belum ada data gudang
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-secondary">{stats?.totalItems || 0}</p>
          <p className="text-xs text-muted-foreground">Total Item</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-success">{stats?.totalCBM?.toFixed(0) || 0}</p>
          <p className="text-xs text-muted-foreground">Total CBM</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-warning">{stats?.activeItems || 0}</p>
          <p className="text-xs text-muted-foreground">Item Aktif</p>
        </div>
      </div>
    </div>
  );
}
