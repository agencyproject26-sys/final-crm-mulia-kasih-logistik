import { Ship, Truck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecentOrders } from "@/hooks/useDashboardStats";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";

const statusStyles: Record<string, string> = {
  "Baru": "status-badge-info",
  "Proses": "status-badge-warning",
  "In Progress": "status-badge-warning",
  "Selesai": "status-badge-success",
  "Completed": "status-badge-success",
  "Pending": "status-badge-destructive",
  "Cancelled": "status-badge-destructive",
  "Dibatalkan": "status-badge-destructive",
};

export function RecentOrders() {
  const { data: orders, isLoading } = useRecentOrders(5);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-lg">Order Terbaru</h3>
          <p className="text-sm text-muted-foreground">5 order terakhir</p>
        </div>
        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary" asChild>
          <Link to="/operasional/job-order">
            Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders && orders.length > 0 ? (
          orders.map((order) => {
            const statusStyle = statusStyles[order.status || ""] || "status-badge-info";
            return (
              <div
                key={order.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Ship className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{order.job_order_number}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.customer_name || "-"} • {order.lokasi || "-"} → {order.tujuan || "-"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn("status-badge", statusStyle)}>
                    {order.status || "Baru"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Belum ada order
          </div>
        )}
      </div>
    </div>
  );
}
