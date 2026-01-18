import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Ship,
  Truck,
  Warehouse,
  ArrowRight,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobOrder {
  id: string;
  customer: string;
  type: "ekspor" | "impor" | "domestik" | "trucking";
  origin: string;
  destination: string;
  cargo: string;
  weight: string;
  status: "pending" | "pickup" | "in_transit" | "delivered";
  createdAt: string;
  eta: string;
}

const jobOrders: JobOrder[] = [
  { id: "JO-2024-001", customer: "PT Maju Bersama", type: "ekspor", origin: "Jakarta", destination: "Singapore", cargo: "Elektronik", weight: "5,200 kg", status: "in_transit", createdAt: "16 Jan 2026", eta: "22 Jan 2026" },
  { id: "JO-2024-002", customer: "CV Sejahtera", type: "impor", origin: "Shanghai", destination: "Jakarta", cargo: "Tekstil", weight: "12,500 kg", status: "pickup", createdAt: "17 Jan 2026", eta: "28 Jan 2026" },
  { id: "JO-2024-003", customer: "PT Global Trade", type: "domestik", origin: "Surabaya", destination: "Makassar", cargo: "Machinery", weight: "8,300 kg", status: "delivered", createdAt: "14 Jan 2026", eta: "18 Jan 2026" },
  { id: "JO-2024-004", customer: "PT Indo Cargo", type: "trucking", origin: "Tanjung Priok", destination: "Cikarang", cargo: "Container 40ft", weight: "22,000 kg", status: "pending", createdAt: "18 Jan 2026", eta: "19 Jan 2026" },
  { id: "JO-2024-005", customer: "CV Mandiri", type: "ekspor", origin: "Semarang", destination: "Hongkong", cargo: "Furniture", weight: "6,800 kg", status: "in_transit", createdAt: "15 Jan 2026", eta: "25 Jan 2026" },
  { id: "JO-2024-006", customer: "PT Logistik Prima", type: "impor", origin: "Busan", destination: "Jakarta", cargo: "Otomotif Parts", weight: "15,200 kg", status: "pickup", createdAt: "17 Jan 2026", eta: "30 Jan 2026" },
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
  pending: "bg-muted text-muted-foreground",
  pickup: "bg-info/10 text-info",
  in_transit: "bg-warning/10 text-warning",
  delivered: "bg-success/10 text-success",
};

const statusLabels = {
  pending: "Pending",
  pickup: "Pickup",
  in_transit: "In Transit",
  delivered: "Selesai",
};

export default function JobOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = jobOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && order.type === activeTab;
  });

  return (
    <MainLayout title="Job Order" subtitle="Kelola order pengiriman">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Order</p>
                <p className="text-2xl font-bold font-display">156</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ekspor</p>
                <p className="text-2xl font-bold font-display">42</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Ship className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impor</p>
                <p className="text-2xl font-bold font-display">38</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Ship className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trucking</p>
                <p className="text-2xl font-bold font-display">76</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="ekspor">Ekspor</TabsTrigger>
            <TabsTrigger value="impor">Impor</TabsTrigger>
            <TabsTrigger value="domestik">Domestik</TabsTrigger>
            <TabsTrigger value="trucking">Trucking</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Buat Order
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => {
          const Icon = typeIcons[order.type];
          return (
            <Card key={order.id} className="stat-card cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <p className="text-xs text-muted-foreground">{typeLabels[order.type]}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", statusStyles[order.status])}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{order.customer}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.origin}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.destination}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{order.cargo}</span>
                  </div>
                  <span className="font-medium">{order.weight}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{order.createdAt}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">ETA: </span>
                    <span className="font-medium">{order.eta}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
