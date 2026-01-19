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
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Truck as TruckIcon } from "lucide-react";
import { useTrucks, Truck, TruckInput } from "@/hooks/useTrucks";
import { TruckDialog } from "@/components/master/TruckDialog";
import { TruckDetailDialog } from "@/components/master/TruckDetailDialog";
import { DeleteTruckDialog } from "@/components/master/DeleteTruckDialog";

const Truk = () => {
  const { trucks, isLoading, createTruck, updateTruck, deleteTruck } = useTrucks();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.truck_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.truck_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck.driver_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleCreate = (data: TruckInput) => {
    createTruck.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setSelectedTruck(null);
      },
    });
  };

  const handleUpdate = (data: TruckInput) => {
    if (selectedTruck) {
      updateTruck.mutate(
        { id: selectedTruck.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedTruck(null);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedTruck) {
      deleteTruck.mutate(selectedTruck.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedTruck(null);
        },
      });
    }
  };

  const openEditDialog = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDialogOpen(true);
  };

  const openDetailDialog = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDetailOpen(true);
  };

  const openDeleteDialog = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Tidak Aktif</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Master Truk & Driver" subtitle="Kelola data truk dan driver">
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari truk atau driver..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setSelectedTruck(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Truk & Driver
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Truk</TableHead>
                <TableHead>Nomor Polisi</TableHead>
                <TableHead>Tipe Truk</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Nama Driver</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredTrucks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <TruckIcon className="h-8 w-8" />
                      <p>Belum ada data truk</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">{truck.truck_id}</TableCell>
                    <TableCell>{truck.plate_number}</TableCell>
                    <TableCell>{truck.truck_type}</TableCell>
                    <TableCell>{truck.capacity || "-"}</TableCell>
                    <TableCell>{truck.driver_name || "-"}</TableCell>
                    <TableCell>{truck.driver_phone || "-"}</TableCell>
                    <TableCell>{getStatusBadge(truck.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => openDetailDialog(truck)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(truck)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(truck)}
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

      {/* Dialogs */}
      <TruckDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={selectedTruck ? handleUpdate : handleCreate}
        truck={selectedTruck}
        isLoading={createTruck.isPending || updateTruck.isPending}
      />

      <TruckDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        truck={selectedTruck}
      />

      <DeleteTruckDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        truck={selectedTruck}
        onConfirm={handleDelete}
        isLoading={deleteTruck.isPending}
      />
    </MainLayout>
  );
};

export default Truk;
