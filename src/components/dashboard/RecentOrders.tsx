import { Ship, Truck, Warehouse, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  type: "ekspor" | "impor" | "domestik" | "trucking";
  route: string;
  status: "pickup" | "in_transit" | "delivered" | "pending";
  date: string;
}

const orders: Order[] = [
  {
    id: "JO-2024-001",
    customer: "PT Maju Bersama",
    type: "ekspor",
    route: "Jakarta → Singapore",
    status: "in_transit",
    date: "18 Jan 2026",
  },
  {
    id: "JO-2024-002",
    customer: "CV Sejahtera",
    type: "impor",
    route: "Shanghai → Jakarta",
    status: "pickup",
    date: "18 Jan 2026",
  },
  {
    id: "JO-2024-003",
    customer: "PT Global Trade",
    type: "domestik",
    route: "Surabaya → Makassar",
    status: "delivered",
    date: "17 Jan 2026",
  },
  {
    id: "JO-2024-004",
    customer: "PT Indo Cargo",
    type: "trucking",
    route: "Tanjung Priok → Cikarang",
    status: "pending",
    date: "18 Jan 2026",
  },
  {
    id: "JO-2024-005",
    customer: "CV Mandiri",
    type: "ekspor",
    route: "Semarang → Hongkong",
    status: "in_transit",
    date: "17 Jan 2026",
  },
];

const typeIcons = {
  ekspor: Ship,
  impor: Ship,
  domestik: Ship,
  trucking: Truck,
};

const typeLabels = {
  ekspor: "Ekspor",
  impor: "Impor",
  domestik: "Domestik",
  trucking: "Trucking",
};

const statusStyles = {
  pickup: "status-badge-info",
  in_transit: "status-badge-warning",
  delivered: "status-badge-success",
  pending: "status-badge-destructive",
};

const statusLabels = {
  pickup: "Pickup",
  in_transit: "In Transit",
  delivered: "Selesai",
  pending: "Pending",
};

export function RecentOrders() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-lg">Order Terbaru</h3>
          <p className="text-sm text-muted-foreground">5 order terakhir</p>
        </div>
        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary">
          Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y divide-border">
        {orders.map((order) => {
          const Icon = typeIcons[order.type];
          return (
            <div
              key={order.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{order.id}</p>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                    {typeLabels[order.type]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {order.customer} • {order.route}
                </p>
              </div>
              <div className="text-right">
                <span className={cn("status-badge", statusStyles[order.status])}>
                  {statusLabels[order.status]}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
