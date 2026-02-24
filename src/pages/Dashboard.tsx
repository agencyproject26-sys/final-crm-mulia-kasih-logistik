import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { ShipmentChart } from "@/components/dashboard/ShipmentChart";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { TruckUtilization } from "@/components/dashboard/TruckUtilization";
import { WarehouseOccupancy } from "@/components/dashboard/WarehouseOccupancy";
import { OutstandingInvoices } from "@/components/dashboard/OutstandingInvoices";
import { useDashboardStats, type DashboardPeriod } from "@/hooks/useDashboardStats";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Users,
  Package,
  Truck,
  CheckCircle2,
  Receipt,
  TrendingUp,
  Warehouse,
  FileText,
  Building2,
  MapPin,
  Handshake,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DASHBOARD_SECTIONS = [
  { key: "master-sales", label: "Master Data & Sales" },
  { key: "operasional", label: "Operasional" },
  { key: "keuangan", label: "Keuangan" },
  { key: "pengiriman-selesai", label: "Pengiriman Selesai" },
  { key: "charts", label: "Laporan & Grafik" },
  { key: "recent-outstanding", label: "Recent Orders & Outstanding" },
  { key: "utilization", label: "Utilisasi Truk & Gudang" },
] as const;

type SectionKey = typeof DASHBOARD_SECTIONS[number]["key"];

const DEFAULT_SECTIONS: SectionKey[] = DASHBOARD_SECTIONS.map((s) => s.key);

function loadVisibleSections(): SectionKey[] {
  try {
    const stored = localStorage.getItem("dashboard-sections");
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_SECTIONS;
}

function saveVisibleSections(sections: SectionKey[]) {
  localStorage.setItem("dashboard-sections", JSON.stringify(sections));
}
const formatRupiah = (value: number) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(2)} M`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)} jt`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)} rb`;
  }
  return `Rp ${value}`;
};

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("all");
  const [visibleSections, setVisibleSections] = useState<SectionKey[]>(loadVisibleSections);
  const { data: stats, isLoading } = useDashboardStats(period);
  const navigate = useNavigate();

  const toggleSection = (key: SectionKey) => {
    setVisibleSections((prev) => {
      const updated = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      saveVisibleSections(updated);
      return updated;
    });
  };

  const isVisible = (key: SectionKey) => visibleSections.includes(key);

  const periodOptions: { value: DashboardPeriod; label: string }[] = [
    { value: "today", label: "Hari Ini" },
    { value: "week", label: "Minggu Ini" },
    { value: "month", label: "Bulan Ini" },
    { value: "all", label: "Semua" },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Selamat datang di Sistem Manajemen PT Mulia Kasih Logistik">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-1">Periode:</span>
          {periodOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
              className="text-xs h-7"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Selamat datang di Sistem Manajemen PT Mulia Kasih Logistik">
      {/* Period Filter & Section Toggle */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-1">Periode:</span>
          {periodOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
              className="text-xs h-7"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              Atur Tampilan
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-3">
            <p className="text-sm font-medium mb-2">Tampilkan Bagian</p>
            <div className="space-y-2">
              {DASHBOARD_SECTIONS.map((section) => (
                <label
                  key={section.key}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground"
                >
                  <Checkbox
                    checked={visibleSections.includes(section.key)}
                    onCheckedChange={() => toggleSection(section.key)}
                  />
                  {section.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Master Data & Sales */}
      {isVisible("master-sales") && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Master Data & Sales</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div onClick={() => navigate("/master/pelanggan")} className="cursor-pointer">
              <StatCard title="Total Pelanggan" value={stats?.totalCustomers.toLocaleString("id-ID") || "0"} icon={Users} />
            </div>
            <div onClick={() => navigate("/master/vendor")} className="cursor-pointer">
              <StatCard title="Total Vendor" value={stats?.totalVendors?.toLocaleString("id-ID") || "0"} icon={Building2} variant="secondary" />
            </div>
            <div onClick={() => navigate("/sales/penawaran")} className="cursor-pointer">
              <StatCard title="Total Penawaran" value={stats?.totalQuotations?.toLocaleString("id-ID") || "0"} subtitle={`Aktif: ${stats?.activeQuotations || 0}`} icon={Handshake} />
            </div>
            <div onClick={() => navigate("/master/truk")} className="cursor-pointer">
              <StatCard title="Total Truk" value={stats?.totalTrucks?.toLocaleString("id-ID") || "0"} subtitle={`Tersedia: ${stats?.availableTrucks || 0}`} icon={Truck} variant="primary" />
            </div>
          </div>
        </>
      )}

      {/* Operasional */}
      {isVisible("operasional") && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Operasional</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
              <StatCard title="Order Aktif" value={stats?.activeOrders.toLocaleString("id-ID") || "0"} icon={Package} />
            </div>
            <div onClick={() => navigate("/operasional/tracking")} className="cursor-pointer">
              <StatCard title="Tracking Aktif" value={stats?.activeTrackings?.toLocaleString("id-ID") || "0"} subtitle={`Total: ${stats?.totalTrackings || 0}`} icon={MapPin} variant="secondary" />
            </div>
            <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
              <StatCard title="Pengiriman Berjalan" value={stats?.inProgressOrders.toLocaleString("id-ID") || "0"} icon={Truck} />
            </div>
            <div onClick={() => navigate("/operasional/gudang")} className="cursor-pointer">
              <StatCard title="Total Gudang" value={`${stats?.totalCBM?.toFixed(0) || 0} CBM`} subtitle={`${stats?.totalWarehouseItems || 0} item`} icon={Warehouse} variant="primary" />
            </div>
          </div>
        </>
      )}

      {/* Keuangan */}
      {isVisible("keuangan") && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Keuangan</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div onClick={() => navigate("/keuangan/invoice")} className="cursor-pointer">
              <StatCard title="Invoice Outstanding" value={formatRupiah(stats?.outstandingAmount || 0)} subtitle={`${stats?.outstandingCount || 0} invoice pending`} icon={Receipt} variant="warning" />
            </div>
            <div onClick={() => navigate("/keuangan/invoice")} className="cursor-pointer">
              <StatCard title="Total Invoice" value={formatRupiah(stats?.monthlyRevenue || 0)} icon={TrendingUp} />
            </div>
            <div onClick={() => navigate("/keuangan/invoice-dp")} className="cursor-pointer">
              <StatCard title="Total Invoice DP" value={formatRupiah(stats?.totalInvoiceDPAmount || 0)} subtitle={`Terbayar: ${formatRupiah(stats?.paidInvoiceDPAmount || 0)}`} icon={FileText} />
            </div>
            <div onClick={() => navigate("/keuangan/pengeluaran")} className="cursor-pointer">
              <StatCard title="Total Pengeluaran" value={formatRupiah(stats?.totalExpenses || 0)} subtitle={`Bulan ini: ${formatRupiah(stats?.monthlyExpenses || 0)}`} icon={CreditCard} variant="warning" />
            </div>
          </div>
        </>
      )}

      {/* Pengiriman Selesai */}
      {isVisible("pengiriman-selesai") && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
            <StatCard title="Pengiriman Selesai" value={stats?.completedOrders.toLocaleString("id-ID") || "0"} subtitle={`Bulan ini: ${stats?.completedThisMonth || 0}`} icon={CheckCircle2} variant="success" />
          </div>
        </div>
      )}

      {/* Charts Row */}
      {isVisible("charts") && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Laporan & Grafik</h3>
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <ShipmentChart />
            <FinanceChart />
          </div>
        </>
      )}

      {/* Bottom Section */}
      {isVisible("recent-outstanding") && (
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>
          <OutstandingInvoices />
        </div>
      )}

      {/* Utilization Section */}
      {isVisible("utilization") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TruckUtilization />
          <WarehouseOccupancy />
        </div>
      )}
    </MainLayout>
  );
}
