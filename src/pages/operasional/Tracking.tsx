import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Truck } from "lucide-react";
import {
  useTrackings,
  useCreateTracking,
  useUpdateTracking,
  useDeleteTracking,
  Tracking,
  TrackingInput,
} from "@/hooks/useTrackings";
import { TrackingDialog } from "@/components/tracking/TrackingDialog";
import { DeleteTrackingDialog } from "@/components/tracking/DeleteTrackingDialog";

const statusLabels: Record<string, string> = {
  in_transit: "In Transit",
  loading: "Loading",
  unloading: "Unloading",
  delivered: "Delivered",
  pending: "Pending",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  in_transit: "default",
  loading: "secondary",
  unloading: "secondary",
  delivered: "outline",
  pending: "destructive",
};

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null);

  const { data: trackings, isLoading } = useTrackings();
  const createTracking = useCreateTracking();
  const updateTracking = useUpdateTracking();
  const deleteTracking = useDeleteTracking();

  const filteredTrackings = trackings?.filter((tracking) =>
    tracking.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tracking.container_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tracking.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tracking.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tracking.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedTracking(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setIsDialogOpen(true);
  };

  const handleDelete = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (data: TrackingInput) => {
    if (selectedTracking) {
      updateTracking.mutate(
        { id: selectedTracking.id, ...data },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createTracking.mutate(data, { onSuccess: () => setIsDialogOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedTracking) {
      deleteTracking.mutate(selectedTracking.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  return (
    <MainLayout title="Tracking Pengiriman" subtitle="Kelola dan lacak status pengiriman">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tracking
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama PT</TableHead>
                <TableHead>AJU</TableHead>
                <TableHead>No Container</TableHead>
                <TableHead>Depo Kosongan</TableHead>
                <TableHead>Nama Sopir</TableHead>
                <TableHead>No Telpon</TableHead>
                <TableHead>Nomer Polisi</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredTrackings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                      <p>Tidak ada data tracking</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrackings?.map((tracking) => (
                  <TableRow key={tracking.id}>
                    <TableCell className="font-medium">
                      {tracking.company_name}
                    </TableCell>
                    <TableCell>{tracking.aju || "-"}</TableCell>
                    <TableCell className="font-mono">
                      {tracking.container_number || "-"}
                    </TableCell>
                    <TableCell>{tracking.depo_kosongan || "-"}</TableCell>
                    <TableCell>{tracking.driver_name || "-"}</TableCell>
                    <TableCell>{tracking.driver_phone || "-"}</TableCell>
                    <TableCell className="font-mono">
                      {tracking.plate_number || "-"}
                    </TableCell>
                    <TableCell>{tracking.destination || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[tracking.status || "pending"]}>
                        {statusLabels[tracking.status || "pending"] || tracking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tracking)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(tracking)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TrackingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tracking={selectedTracking}
        onSubmit={handleSubmit}
        isLoading={createTracking.isPending || updateTracking.isPending}
      />

      <DeleteTrackingDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        tracking={selectedTracking}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTracking.isPending}
      />
    </MainLayout>
  );
}
