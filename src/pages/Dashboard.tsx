import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { ShipmentChart } from "@/components/dashboard/ShipmentChart";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { TruckUtilization } from "@/components/dashboard/TruckUtilization";
import { WarehouseOccupancy } from "@/components/dashboard/WarehouseOccupancy";
import { OutstandingInvoices } from "@/components/dashboard/OutstandingInvoices";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Users,
  Package,
  Truck,
  CheckCircle2,
  Receipt,
  TrendingUp,
  Warehouse,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Selamat datang di Sistem Manajemen PT Mulia Kasih Logistik">
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
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Pelanggan"
          value={stats?.totalCustomers.toLocaleString("id-ID") || "0"}
          icon={Users}
        />
        <StatCard
          title="Order Aktif"
          value={stats?.activeOrders.toLocaleString("id-ID") || "0"}
          icon={Package}
        />
        <StatCard
          title="Pengiriman Berjalan"
          value={stats?.inProgressOrders.toLocaleString("id-ID") || "0"}
          icon={Truck}
          variant="secondary"
        />
        <StatCard
          title="Pengiriman Selesai"
          value={stats?.completedOrders.toLocaleString("id-ID") || "0"}
          subtitle={`Bulan ini: ${stats?.completedThisMonth || 0}`}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Invoice Outstanding"
          value={formatRupiah(stats?.outstandingAmount || 0)}
          subtitle={`${stats?.outstandingCount || 0} invoice pending`}
          icon={Receipt}
          variant="warning"
        />
        <StatCard
          title="Total Invoice"
          value={formatRupiah(stats?.monthlyRevenue || 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Invoice DP"
          value={formatRupiah(stats?.totalInvoiceDPAmount || 0)}
          subtitle={`Terbayar: ${formatRupiah(stats?.paidInvoiceDPAmount || 0)}`}
          icon={FileText}
        />
        <StatCard
          title="Total Gudang"
          value={`${stats?.totalCBM?.toFixed(0) || 0} CBM`}
          subtitle={`${stats?.totalWarehouseItems || 0} item`}
          icon={Warehouse}
          variant="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <ShipmentChart />
        <FinanceChart />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <OutstandingInvoices />
      </div>

      {/* Utilization Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TruckUtilization />
        <WarehouseOccupancy />
      </div>
    </MainLayout>
  );
}
