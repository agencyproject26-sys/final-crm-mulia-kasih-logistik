import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  Target,
  DollarSign,
  Phone,
  Mail,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  company: string;
  pic: string;
  phone: string;
  email: string;
  source: string;
  service: string;
  estimatedValue: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  createdAt: string;
}

const leads: Lead[] = [
  { id: "L001", company: "PT Sinar Jaya", pic: "Andi Wijaya", phone: "08123456789", email: "andi@sinarjaya.com", source: "Website", service: "Sea Freight Ekspor", estimatedValue: 150000000, status: "new", createdAt: "18 Jan 2026" },
  { id: "L002", company: "CV Abadi Sentosa", pic: "Budi Hartono", phone: "08234567890", email: "budi@abadisentosa.com", source: "Referral", service: "Trucking", estimatedValue: 75000000, status: "contacted", createdAt: "17 Jan 2026" },
  { id: "L003", company: "PT Mitra Logistik", pic: "Citra Dewi", phone: "08345678901", email: "citra@mitralogistik.com", source: "Cold Call", service: "Warehousing", estimatedValue: 200000000, status: "qualified", createdAt: "16 Jan 2026" },
  { id: "L004", company: "PT Nusantara Trade", pic: "Dedi Kurniawan", phone: "08456789012", email: "dedi@nusantaratrade.com", source: "Exhibition", service: "Sea Freight Impor", estimatedValue: 320000000, status: "proposal", createdAt: "15 Jan 2026" },
  { id: "L005", company: "CV Prima Cargo", pic: "Eko Prasetyo", phone: "08567890123", email: "eko@primacargo.com", source: "Website", service: "Forwarding", estimatedValue: 180000000, status: "negotiation", createdAt: "14 Jan 2026" },
  { id: "L006", company: "PT Global Express", pic: "Faisal Rahman", phone: "08678901234", email: "faisal@globalexpress.com", source: "Referral", service: "Stevedoring", estimatedValue: 250000000, status: "won", createdAt: "12 Jan 2026" },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const statusStyles = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-info/10 text-info",
  qualified: "bg-secondary/10 text-secondary",
  proposal: "bg-warning/10 text-warning",
  negotiation: "bg-primary/10 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  new: "Baru",
  contacted: "Dihubungi",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negosiasi",
  won: "Menang",
  lost: "Kalah",
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.pic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const conversionRate = Math.round((wonLeads / totalLeads) * 100);

  return (
    <MainLayout title="Leads & Peluang" subtitle="Kelola prospek pelanggan">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold font-display">{totalLeads}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nilai Estimasi</p>
                <p className="text-2xl font-bold font-display">{formatRupiah(totalValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Menang</p>
                <p className="text-2xl font-bold font-display">{wonLeads}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold font-display">{conversionRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Lead
        </Button>
      </div>

      {/* Leads Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="stat-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{lead.company}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lead.pic}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Buat Penawaran</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Layanan</span>
                  <span className="text-sm font-medium">{lead.service}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sumber</span>
                  <span className="text-sm">{lead.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nilai Estimasi</span>
                  <span className="text-sm font-semibold text-secondary">{formatRupiah(lead.estimatedValue)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Badge className={cn("text-xs", statusStyles[lead.status])}>
                  {statusLabels[lead.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">{lead.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}
