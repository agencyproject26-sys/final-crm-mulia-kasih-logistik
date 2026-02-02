import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrucks } from "@/hooks/useTrucks";
import { useTrackings } from "@/hooks/useTrackings";
import {
  Truck,
  Download,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wrench,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  "Tersedia": { label: "Tersedia", color: "#10b981", bgColor: "bg-green-100 text-green-700" },
  "Dalam Perjalanan": { label: "Dalam Perjalanan", color: "#3b82f6", bgColor: "bg-blue-100 text-blue-700" },
  "Maintenance": { label: "Maintenance", color: "#f59e0b", bgColor: "bg-amber-100 text-amber-700" },
  "Tidak Aktif": { label: "Tidak Aktif", color: "#6b7280", bgColor: "bg-gray-100 text-gray-700" },
};

export default function LaporanUtilisasiTruk() {
  const { trucks, isLoading: loadingTrucks } = useTrucks();
  const { data: trackings, isLoading: loadingTrackings } = useTrackings();
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const isLoading = loadingTrucks || loadingTrackings;

  const truckStats = useMemo(() => {
    if (!trucks) return { total: 0, available: 0, inUse: 0, maintenance: 0 };

    const total = trucks.length;
    const available = trucks.filter((t) => t.status === "Tersedia").length;
    const inUse = trucks.filter((t) => t.status === "Dalam Perjalanan").length;
    const maintenance = trucks.filter((t) => t.status === "Maintenance").length;
    const inactive = trucks.filter((t) => t.status === "Tidak Aktif" || !t.status).length;

    return { total, available, inUse, maintenance, inactive };
  }, [trucks]);

  const utilizationRate = truckStats.total > 0 
    ? ((truckStats.inUse / truckStats.total) * 100).toFixed(1) 
    : 0;

  const availabilityRate = truckStats.total > 0 
    ? (((truckStats.available + truckStats.inUse) / truckStats.total) * 100).toFixed(1) 
    : 0;

  const statusData = [
    { name: "Tersedia", value: truckStats.available, color: "#10b981" },
    { name: "Dalam Perjalanan", value: truckStats.inUse, color: "#3b82f6" },
    { name: "Maintenance", value: truckStats.maintenance, color: "#f59e0b" },
    { name: "Tidak Aktif", value: truckStats.inactive, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  const truckTypeData = useMemo(() => {
    if (!trucks) return [];
    
    const typeCount = trucks.reduce((acc, truck) => {
      const type = truck.truck_type || "Lainnya";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [trucks]);

  const gaugeData = [
    {
      name: "Utilisasi",
      value: Number(utilizationRate),
      fill: "#3b82f6",
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Utilisasi Truk" subtitle="Analisis penggunaan armada">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Utilisasi Truk" subtitle="Analisis penggunaan armada perusahaan">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Total Armada</p>
                <p className="text-3xl font-bold mt-1">{truckStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tersedia</p>
                <p className="text-3xl font-bold mt-1">{truckStats.available}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Dalam Perjalanan</p>
                <p className="text-3xl font-bold mt-1">{truckStats.inUse}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Maintenance</p>
                <p className="text-3xl font-bold mt-1">{truckStats.maintenance}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Tingkat Utilisasi</p>
                <p className="text-3xl font-bold mt-1">{utilizationRate}%</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Gauge Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Utilisasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  barSize={20}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill="#3b82f6"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-4xl font-bold text-blue-600">{utilizationRate}%</p>
                <p className="text-sm text-muted-foreground">Utilisasi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Truck Types */}
        <Card>
          <CardHeader>
            <CardTitle>Jenis Armada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={truckTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Truck List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Daftar Armada
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trucks?.map((truck) => {
              const statusConfig = STATUS_CONFIG[truck.status || "Tidak Aktif"] || STATUS_CONFIG["Tidak Aktif"];
              return (
                <Card key={truck.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">{truck.plate_number}</p>
                        <p className="text-sm text-muted-foreground">{truck.truck_type}</p>
                      </div>
                      <Badge className={statusConfig.bgColor}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Truk</span>
                        <span className="font-medium">{truck.truck_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kapasitas</span>
                        <span className="font-medium">{truck.capacity || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sopir</span>
                        <span className="font-medium">{truck.driver_name || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {(!trucks || trucks.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data armada
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
