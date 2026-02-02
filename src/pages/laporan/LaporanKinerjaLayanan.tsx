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
import { useJobOrders } from "@/hooks/useJobOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useTrackings } from "@/hooks/useTrackings";
import {
  Award,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Star,
  Target,
  Zap,
  ThumbsUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function LaporanKinerjaLayanan() {
  const { jobOrders, isLoading: loadingJO } = useJobOrders();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: trackings, isLoading: loadingTrackings } = useTrackings();
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const isLoading = loadingJO || loadingCustomers || loadingTrackings;

  const metrics = useMemo(() => {
    if (!jobOrders) return {
      completionRate: 0,
      onTimeRate: 0,
      customerSatisfaction: 0,
      activeCustomers: 0,
      avgProcessingTime: 0,
    };

    const total = jobOrders.length;
    const completed = jobOrders.filter((jo) => jo.status === "Selesai").length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Simulated metrics
    const onTimeRate = 87.5; // Would calculate from actual delivery dates
    const customerSatisfaction = 92; // Would come from feedback system
    const avgProcessingTime = 3.2; // Days

    const activeCustomerIds = new Set(jobOrders.map((jo) => jo.customer_id).filter(Boolean));
    const activeCustomers = activeCustomerIds.size;

    return {
      completionRate,
      onTimeRate,
      customerSatisfaction,
      activeCustomers,
      avgProcessingTime,
    };
  }, [jobOrders]);

  // Radar chart data for service metrics
  const radarData = [
    { metric: "Ketepatan Waktu", value: metrics.onTimeRate, fullMark: 100 },
    { metric: "Tingkat Selesai", value: metrics.completionRate, fullMark: 100 },
    { metric: "Kepuasan Pelanggan", value: metrics.customerSatisfaction, fullMark: 100 },
    { metric: "Efisiensi", value: 85, fullMark: 100 },
    { metric: "Responsivitas", value: 90, fullMark: 100 },
  ];

  // Service type performance
  const serviceData = [
    { name: "Trucking", orders: 45, completed: 42, rate: 93 },
    { name: "Forwarding", orders: 32, completed: 28, rate: 87 },
    { name: "Sea Freight", orders: 28, completed: 25, rate: 89 },
    { name: "Warehousing", orders: 18, completed: 17, rate: 94 },
    { name: "Stevedoring", orders: 12, completed: 11, rate: 91 },
  ];

  // Monthly trend
  const trendData = [
    { month: "Jan", rate: 85 },
    { month: "Feb", rate: 87 },
    { month: "Mar", rate: 84 },
    { month: "Apr", rate: 89 },
    { month: "Mei", rate: 91 },
    { month: "Jun", rate: 88 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 75) return "bg-amber-100";
    return "bg-red-100";
  };

  if (isLoading) {
    return (
      <MainLayout title="Kinerja Layanan" subtitle="Analisis performa layanan">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Kinerja Layanan" subtitle="Analisis performa layanan perusahaan">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Tingkat Selesai</p>
                <p className="text-3xl font-bold mt-1">{metrics.completionRate.toFixed(1)}%</p>
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
                <p className="text-blue-100 text-sm font-medium">Ketepatan Waktu</p>
                <p className="text-3xl font-bold mt-1">{metrics.onTimeRate}%</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Kepuasan Pelanggan</p>
                <p className="text-3xl font-bold mt-1">{metrics.customerSatisfaction}%</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <ThumbsUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pelanggan Aktif</p>
                <p className="text-3xl font-bold mt-1">{metrics.activeCustomers}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Waktu Proses</p>
                <p className="text-3xl font-bold mt-1">{metrics.avgProcessingTime}</p>
                <p className="text-cyan-200 text-xs">hari rata-rata</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metrik Kinerja Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performa"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Kinerja Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="Tingkat Kinerja"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Kinerja per Jenis Layanan
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {serviceData.map((service) => (
              <div key={service.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium w-32">{service.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.completed}/{service.orders} order selesai
                    </span>
                  </div>
                  <Badge className={`${getScoreBg(service.rate)} ${getScoreColor(service.rate)}`}>
                    {service.rate}%
                  </Badge>
                </div>
                <Progress value={service.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Volume Layanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" name="Total Order" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
