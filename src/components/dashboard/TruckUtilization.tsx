import { Progress } from "@/components/ui/progress";
import { Truck } from "lucide-react";

interface TruckData {
  id: string;
  plate: string;
  driver: string;
  utilization: number;
  status: "active" | "maintenance" | "idle";
}

const trucks: TruckData[] = [
  { id: "TRK-001", plate: "B 1234 KLM", driver: "Ahmad Yani", utilization: 92, status: "active" },
  { id: "TRK-002", plate: "B 5678 KLM", driver: "Budi Santoso", utilization: 78, status: "active" },
  { id: "TRK-003", plate: "B 9012 KLM", driver: "Cahyo Wibowo", utilization: 65, status: "active" },
  { id: "TRK-004", plate: "B 3456 KLM", driver: "Dedi Kurniawan", utilization: 45, status: "idle" },
  { id: "TRK-005", plate: "B 7890 KLM", driver: "Eko Prasetyo", utilization: 0, status: "maintenance" },
];

const statusLabels = {
  active: "Aktif",
  maintenance: "Maintenance",
  idle: "Idle",
};

const statusColors = {
  active: "text-success",
  maintenance: "text-destructive",
  idle: "text-warning",
};

export function TruckUtilization() {
  const avgUtilization = Math.round(
    trucks.filter(t => t.status === "active").reduce((sum, t) => sum + t.utilization, 0) / 
    trucks.filter(t => t.status === "active").length
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Utilisasi Truk</h3>
          <p className="text-sm text-muted-foreground">Performa armada bulan ini</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-secondary">{avgUtilization}%</p>
          <p className="text-xs text-muted-foreground">Rata-rata utilisasi</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {trucks.map((truck) => (
          <div key={truck.id} className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{truck.plate}</p>
                  <span className={`text-xs ${statusColors[truck.status]}`}>
                    ({statusLabels[truck.status]})
                  </span>
                </div>
                <span className="text-sm font-medium">{truck.utilization}%</span>
              </div>
              <Progress 
                value={truck.utilization} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">{truck.driver}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
