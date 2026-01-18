import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { ShipmentChart } from "@/components/dashboard/ShipmentChart";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { TruckUtilization } from "@/components/dashboard/TruckUtilization";
import { WarehouseOccupancy } from "@/components/dashboard/WarehouseOccupancy";
import { OutstandingInvoices } from "@/components/dashboard/OutstandingInvoices";
import {
  Users,
  Package,
  Truck,
  CheckCircle2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard" subtitle="Selamat datang di Sistem Manajemen PT Mulia Kasih Logistik">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Pelanggan"
          value="248"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Order Aktif"
          value="56"
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pengiriman Berjalan"
          value="32"
          icon={Truck}
          variant="secondary"
        />
        <StatCard
          title="Pengiriman Selesai"
          value="1,847"
          subtitle="Bulan ini: 142"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Invoice Outstanding"
          value="Rp 172,5 jt"
          subtitle="12 invoice pending"
          icon={Receipt}
          variant="warning"
        />
        <StatCard
          title="Pendapatan Bulanan"
          value="Rp 1,12 M"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Pengeluaran Bulanan"
          value="Rp 820 jt"
          icon={TrendingDown}
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Laba Bersih"
          value="Rp 300 jt"
          icon={Wallet}
          variant="primary"
          trend={{ value: 18, isPositive: true }}
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
