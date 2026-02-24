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
  Building2,
  MapPin,
  Handshake,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      {/* Master Data & Sales */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Master Data & Sales</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div onClick={() => navigate("/master/pelanggan")} className="cursor-pointer">
          <StatCard
            title="Total Pelanggan"
            value={stats?.totalCustomers.toLocaleString("id-ID") || "0"}
            icon={Users}
          />
        </div>
        <div onClick={() => navigate("/master/vendor")} className="cursor-pointer">
          <StatCard
            title="Total Vendor"
            value={stats?.totalVendors?.toLocaleString("id-ID") || "0"}
            icon={Building2}
            variant="secondary"
          />
        </div>
        <div onClick={() => navigate("/sales/penawaran")} className="cursor-pointer">
          <StatCard
            title="Total Penawaran"
            value={stats?.totalQuotations?.toLocaleString("id-ID") || "0"}
            subtitle={`Aktif: ${stats?.activeQuotations || 0}`}
            icon={Handshake}
          />
        </div>
        <div onClick={() => navigate("/master/truk")} className="cursor-pointer">
          <StatCard
            title="Total Truk"
            value={stats?.totalTrucks?.toLocaleString("id-ID") || "0"}
            subtitle={`Tersedia: ${stats?.availableTrucks || 0}`}
            icon={Truck}
            variant="primary"
          />
        </div>
      </div>

      {/* Operasional */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Operasional</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
          <StatCard
            title="Order Aktif"
            value={stats?.activeOrders.toLocaleString("id-ID") || "0"}
            icon={Package}
          />
        </div>
        <div onClick={() => navigate("/operasional/tracking")} className="cursor-pointer">
          <StatCard
            title="Tracking Aktif"
            value={stats?.activeTrackings?.toLocaleString("id-ID") || "0"}
            subtitle={`Total: ${stats?.totalTrackings || 0}`}
            icon={MapPin}
            variant="secondary"
          />
        </div>
        <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
          <StatCard
            title="Pengiriman Berjalan"
            value={stats?.inProgressOrders.toLocaleString("id-ID") || "0"}
            icon={Truck}
          />
        </div>
        <div onClick={() => navigate("/operasional/gudang")} className="cursor-pointer">
          <StatCard
            title="Total Gudang"
            value={`${stats?.totalCBM?.toFixed(0) || 0} CBM`}
            subtitle={`${stats?.totalWarehouseItems || 0} item`}
            icon={Warehouse}
            variant="primary"
          />
        </div>
      </div>

      {/* Keuangan */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Keuangan</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div onClick={() => navigate("/keuangan/invoice")} className="cursor-pointer">
          <StatCard
            title="Invoice Outstanding"
            value={formatRupiah(stats?.outstandingAmount || 0)}
            subtitle={`${stats?.outstandingCount || 0} invoice pending`}
            icon={Receipt}
            variant="warning"
          />
        </div>
        <div onClick={() => navigate("/keuangan/invoice")} className="cursor-pointer">
          <StatCard
            title="Total Invoice"
            value={formatRupiah(stats?.monthlyRevenue || 0)}
            icon={TrendingUp}
          />
        </div>
        <div onClick={() => navigate("/keuangan/invoice-dp")} className="cursor-pointer">
          <StatCard
            title="Total Invoice DP"
            value={formatRupiah(stats?.totalInvoiceDPAmount || 0)}
            subtitle={`Terbayar: ${formatRupiah(stats?.paidInvoiceDPAmount || 0)}`}
            icon={FileText}
          />
        </div>
        <div onClick={() => navigate("/keuangan/pengeluaran")} className="cursor-pointer">
          <StatCard
            title="Total Pengeluaran"
            value={formatRupiah(stats?.totalExpenses || 0)}
            subtitle={`Bulan ini: ${formatRupiah(stats?.monthlyExpenses || 0)}`}
            icon={CreditCard}
            variant="warning"
          />
        </div>
      </div>

      {/* Pengiriman Selesai */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div onClick={() => navigate("/operasional/job-order")} className="cursor-pointer">
          <StatCard
            title="Pengiriman Selesai"
            value={stats?.completedOrders.toLocaleString("id-ID") || "0"}
            subtitle={`Bulan ini: ${stats?.completedThisMonth || 0}`}
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      </div>

      {/* Charts Row */}
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Laporan & Grafik</h3>
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
