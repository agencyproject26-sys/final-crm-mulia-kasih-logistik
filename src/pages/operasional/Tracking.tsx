import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Ship,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingStep {
  label: string;
  date: string;
  time: string;
  location: string;
  completed: boolean;
  current?: boolean;
}

interface Shipment {
  id: string;
  customer: string;
  type: "ekspor" | "impor";
  origin: string;
  destination: string;
  vessel: string;
  container: string;
  steps: TrackingStep[];
}

const shipment: Shipment = {
  id: "JO-2024-001",
  customer: "PT Maju Bersama",
  type: "ekspor",
  origin: "Jakarta, Indonesia",
  destination: "Singapore",
  vessel: "MV EVER GIVEN",
  container: "CSQU3054383",
  steps: [
    { label: "Order Dibuat", date: "16 Jan 2026", time: "09:30", location: "Jakarta", completed: true },
    { label: "Pickup dari Gudang", date: "16 Jan 2026", time: "14:00", location: "Gudang Cikarang", completed: true },
    { label: "Stuffing Container", date: "17 Jan 2026", time: "08:00", location: "Depo Container", completed: true },
    { label: "Gate In Pelabuhan", date: "17 Jan 2026", time: "15:30", location: "Tanjung Priok", completed: true },
    { label: "On Board Vessel", date: "18 Jan 2026", time: "10:00", location: "Tanjung Priok", completed: true, current: true },
    { label: "Arrival di Tujuan", date: "22 Jan 2026", time: "-", location: "Singapore", completed: false },
    { label: "Delivery ke Consignee", date: "23 Jan 2026", time: "-", location: "Singapore", completed: false },
  ],
};

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("JO-2024-001");

  return (
    <MainLayout title="Tracking Pengiriman" subtitle="Lacak status pengiriman real-time">
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Masukkan nomor Job Order atau Container..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Lacak
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Info */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-secondary" />
                {shipment.id}
              </CardTitle>
              <Badge className="bg-warning/10 text-warning">In Transit</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{shipment.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vessel</p>
                  <p className="font-medium">{shipment.vessel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Container No.</p>
                  <p className="font-medium font-mono">{shipment.container}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Rute</p>
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4 text-secondary" />
                    {shipment.origin}
                    <ArrowRight className="h-4 w-4" />
                    {shipment.destination}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipe</p>
                  <p className="font-medium capitalize">{shipment.type}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <circle
                    className="text-secondary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${(5 / 7) * 251.2} 251.2`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-display">71%</span>
                  <span className="text-xs text-muted-foreground">5 dari 7</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {shipment.steps.map((step, index) => (
              <div key={index} className="flex gap-4 pb-8 last:pb-0">
                {/* Timeline Line & Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2",
                      step.completed
                        ? step.current
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-success bg-success text-success-foreground"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  {index < shipment.steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 mt-2",
                        step.completed ? "bg-success" : "bg-muted"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn("flex-1 pb-2", step.current && "")}>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-medium",
                        step.current && "text-secondary"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.current && (
                      <Badge className="bg-secondary/10 text-secondary text-xs">
                        Saat ini
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{step.date}</span>
                    <span>{step.time}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {step.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
