import { Truck, Loader2 } from "lucide-react";
import { useTruckUtilData } from "@/hooks/useDashboardCharts";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  active: "Aktif",
  Tersedia: "Tersedia",
  Available: "Tersedia",
  maintenance: "Maintenance",
  Maintenance: "Maintenance",
  idle: "Idle",
  "Tidak Tersedia": "Tidak Tersedia",
};

const statusColors: Record<string, string> = {
  active: "text-success",
  Tersedia: "text-success",
  Available: "text-success",
  maintenance: "text-destructive",
  Maintenance: "text-destructive",
  idle: "text-warning",
  "Tidak Tersedia": "text-warning",
};

export function TruckUtilization() {
  const { data: trucks, isLoading } = useTruckUtilData();

  const totalTrucks = trucks?.length || 0;
  const availableTrucks = trucks?.filter(
    (t) => t.status === "Tersedia" || t.status === "Available" || t.status === "active"
  ).length || 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Utilisasi Truk</h3>
          <p className="text-sm text-muted-foreground">Data armada truk</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-secondary">{availableTrucks}/{totalTrucks}</p>
          <p className="text-xs text-muted-foreground">Tersedia</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : trucks && trucks.length > 0 ? (
        <div className="space-y-3">
          {trucks.slice(0, 8).map((truck) => (
            <div key={truck.id} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{truck.plate}</p>
                    <span className={`text-xs ${statusColors[truck.status] || "text-muted-foreground"}`}>
                      ({statusLabels[truck.status] || truck.status})
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">{truck.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{truck.driver}</p>
              </div>
            </div>
          ))}
          {trucks.length > 8 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{trucks.length - 8} truk lainnya
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          Belum ada data truk
        </div>
      )}
    </div>
  );
}
