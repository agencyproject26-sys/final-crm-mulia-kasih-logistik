import { useState } from "react";
import { format } from "date-fns";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Ship,
  Package,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileCheck,
  Clock,
  CheckCircle2,
  Receipt,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobOrders, JobOrder, JobOrderInput } from "@/hooks/useJobOrders";
import { JobOrderDialog } from "@/components/joborder/JobOrderDialog";
import { JobOrderPdfMenu } from "@/components/joborder/JobOrderPdfMenu";
import { DeleteJobOrderDialog } from "@/components/joborder/DeleteJobOrderDialog";
import { CreateInvoiceFromJobOrder } from "@/components/joborder/CreateInvoiceFromJobOrder";
import { CreateInvoiceDPFromJobOrder } from "@/components/joborder/CreateInvoiceDPFromJobOrder";
import { JobOrderInvoicesDialog } from "@/components/joborder/JobOrderInvoicesDialog";


const statusDoStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  released: "bg-success/10 text-success",
  on_hold: "bg-warning/10 text-warning",
  expired: "bg-destructive/10 text-destructive",
};

const statusDoLabels: Record<string, string> = {
  pending: "Pending",
  released: "Released",
  on_hold: "On Hold",
  expired: "Expired",
};

const respondBcStyles: Record<string, string> = {
  green: "bg-success/10 text-success",
  yellow: "bg-warning/10 text-warning",
  red: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

const respondBcLabels: Record<string, string> = {
  green: "Jalur Hijau",
  yellow: "Jalur Kuning",
  red: "Jalur Merah",
  pending: "Pending",
};

const statusLabels: Record<string, string> = {
  original: "Original",
  lc: "LC",
  sea_waybill: "Sea Waybill",
  pending: "Pending",
  received: "Received",
  surrendered: "Surrendered",
  telex_release: "Telex Release",
};

export default function JobOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInvoicesDialogOpen, setIsInvoicesDialogOpen] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);

  const { jobOrders, isLoading, createJobOrder, updateJobOrder, deleteJobOrder } = useJobOrders();

  const refetchJobOrders = () => {
    // Force a refresh when invoice is created
  };

  const filteredOrders = jobOrders.filter((order) => {
    const matchesSearch =
      order.bl_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && order.status_do === "pending";
    if (activeTab === "released") return matchesSearch && order.status_do === "released";
    if (activeTab === "on_hold") return matchesSearch && order.status_do === "on_hold";
    return matchesSearch;
  });

  const stats = {
    total: jobOrders.length,
    pending: jobOrders.filter(o => o.status_do === "pending").length,
    released: jobOrders.filter(o => o.status_do === "released").length,
    onHold: jobOrders.filter(o => o.status_do === "on_hold").length,
  };

  const handleCreate = (data: JobOrderInput) => {
    createJobOrder.mutate(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: JobOrderInput) => {
    if (selectedJobOrder) {
      updateJobOrder.mutate({ id: selectedJobOrder.id, ...data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedJobOrder(null);
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedJobOrder) {
      deleteJobOrder.mutate(selectedJobOrder.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedJobOrder(null);
        },
      });
    }
  };

  const openEditDialog = (order: JobOrder) => {
    setSelectedJobOrder(order);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (order: JobOrder) => {
    setSelectedJobOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <MainLayout title="Job Order" subtitle="Kelola order pengiriman">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Order</p>
                <p className="text-2xl font-bold font-display">{stats.total}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-display">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Released</p>
                <p className="text-2xl font-bold font-display">{stats.released}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold font-display">{stats.onHold}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-warning" />
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
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="released">Released</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari No. BL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => {
              setSelectedJobOrder(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Daftar Job Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada job order
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. JO</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>BL Number</TableHead>
                    <TableHead>ETA Kapal</TableHead>
                    <TableHead>Lokasi → Tujuan</TableHead>
                     <TableHead>Status DO</TableHead>
                     <TableHead>Status BL</TableHead>
                     <TableHead>Respond BC</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.job_order_number}
                      </TableCell>
                      <TableCell>{order.customer_name || "-"}</TableCell>
                      <TableCell>{order.bl_number || "-"}</TableCell>
                      <TableCell>{formatDate(order.eta_kapal)}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {order.lokasi || "-"} → {order.tujuan || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusDoStyles[order.status_do || "pending"])}>
                          {statusDoLabels[order.status_do || "pending"]}
                        </Badge>
                       </TableCell>
                       <TableCell>
                         <span className="text-sm">{statusLabels[order.status || ""] || "-"}</span>
                       </TableCell>
                       <TableCell>
                         <Badge className={cn("text-xs", respondBcStyles[order.respond_bc || "pending"])}>
                          {respondBcLabels[order.respond_bc || "pending"]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <CreateInvoiceFromJobOrder jobOrder={order} />
                          <CreateInvoiceDPFromJobOrder jobOrder={order} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedJobOrder(order);
                              setIsInvoicesDialogOpen(true);
                            }}
                          >
                            <Banknote className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <JobOrderPdfMenu jobOrder={order} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(order)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(order)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <JobOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={selectedJobOrder ? handleUpdate : handleCreate}
        jobOrder={selectedJobOrder}
        isLoading={createJobOrder.isPending || updateJobOrder.isPending}
      />

      <DeleteJobOrderDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        jobOrderNumber={selectedJobOrder?.job_order_number}
      />

      {selectedJobOrder && (
        <JobOrderInvoicesDialog
          open={isInvoicesDialogOpen}
          onOpenChange={setIsInvoicesDialogOpen}
          jobOrderId={selectedJobOrder.id}
          jobOrderNumber={selectedJobOrder.job_order_number}
        />
      )}
    </MainLayout>
  );
}
