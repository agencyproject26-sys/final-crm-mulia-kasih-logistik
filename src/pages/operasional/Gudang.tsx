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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Warehouse } from "lucide-react";
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
  Warehouse as WarehouseType,
  WarehouseInput,
} from "@/hooks/useWarehouses";
import { WarehouseDialog } from "@/components/warehouse/WarehouseDialog";
import { DeleteWarehouseDialog } from "@/components/warehouse/DeleteWarehouseDialog";

const statusLabels: Record<string, string> = {
  active: "Aktif",
  completed: "Selesai",
  pending: "Pending",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  completed: "outline",
  pending: "secondary",
};

const handlingLabels: Record<string, string> = {
  in: "IN",
  out: "OUT",
  in_out: "IN/OUT",
};

export default function GudangPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);

  const { data: warehouses, isLoading } = useWarehouses();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const filteredWarehouses = warehouses?.filter((wh) =>
    wh.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wh.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wh.party?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedWarehouse(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    setIsDialogOpen(true);
  };

  const handleDelete = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (data: WarehouseInput) => {
    if (selectedWarehouse) {
      updateWarehouse.mutate(
        { id: selectedWarehouse.id, ...data },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createWarehouse.mutate(data, { onSuccess: () => setIsDialogOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedWarehouse) {
      deleteWarehouse.mutate(selectedWarehouse.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <MainLayout title="Gudang" subtitle="Kelola data operasional gudang">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data Gudang
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari data gudang..."
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
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>CBM</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Handling</TableHead>
                <TableHead>Ket. Harian</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Administrasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredWarehouses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Warehouse className="h-8 w-8 text-muted-foreground" />
                      <p>Tidak ada data gudang</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWarehouses?.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium">
                      {wh.customer_name}
                    </TableCell>
                    <TableCell>{wh.cbm || "-"}</TableCell>
                    <TableCell>{wh.description || "-"}</TableCell>
                    <TableCell>
                      {wh.handling_in_out ? (
                        <Badge variant="outline">
                          {handlingLabels[wh.handling_in_out] || wh.handling_in_out}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{wh.daily_notes || "-"}</TableCell>
                    <TableCell>{wh.quantity || "-"}</TableCell>
                    <TableCell>{formatCurrency(wh.unit_price)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency((wh.quantity || 0) * (wh.unit_price || 0))}
                    </TableCell>
                    <TableCell>{wh.party || "-"}</TableCell>
                    <TableCell>{wh.administration || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[wh.status || "pending"]}>
                        {statusLabels[wh.status || "pending"] || wh.status}
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
                          <DropdownMenuItem onClick={() => handleEdit(wh)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(wh)}
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

      <WarehouseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        warehouse={selectedWarehouse}
        onSubmit={handleSubmit}
        isLoading={createWarehouse.isPending || updateWarehouse.isPending}
      />

      <DeleteWarehouseDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        warehouse={selectedWarehouse}
        onConfirm={handleConfirmDelete}
        isLoading={deleteWarehouse.isPending}
      />
    </MainLayout>
  );
}
