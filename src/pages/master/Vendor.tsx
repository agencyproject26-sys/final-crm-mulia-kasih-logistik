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
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  Vendor,
  VendorInput,
} from "@/hooks/useVendors";
import { VendorDialog } from "@/components/master/VendorDialog";
import { VendorDetailDialog } from "@/components/master/VendorDetailDialog";
import { DeleteVendorDialog } from "@/components/master/DeleteVendorDialog";

const vendorTypeLabels: Record<string, string> = {
  trucking: "Trucking",
  shipping: "Shipping Line",
  warehouse: "Warehouse",
  forwarding: "Forwarding",
  stevedoring: "Stevedoring",
  other: "Lainnya",
};

export default function VendorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const { data: vendors, isLoading } = useVendors();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const filteredVendors = vendors?.filter((vendor) =>
    vendor.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.pic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedVendor(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleView = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailOpen(true);
  };

  const handleDelete = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (data: VendorInput) => {
    if (selectedVendor) {
      updateVendor.mutate(
        { id: selectedVendor.id, ...data },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createVendor.mutate(data, { onSuccess: () => setIsDialogOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedVendor) {
      deleteVendor.mutate(selectedVendor.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  return (
    <MainLayout title="Master Vendor" subtitle="Kelola data vendor dan mitra bisnis">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Vendor
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Perusahaan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredVendors?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Tidak ada data vendor
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors?.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      {vendor.company_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vendorTypeLabels[vendor.vendor_type || "other"] || vendor.vendor_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{vendor.pic_name || "-"}</TableCell>
                    <TableCell>{vendor.phone || "-"}</TableCell>
                    <TableCell>{vendor.city || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={vendor.status === "aktif" ? "default" : "secondary"}
                      >
                        {vendor.status === "aktif" ? "Aktif" : "Tidak Aktif"}
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
                          <DropdownMenuItem onClick={() => handleView(vendor)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(vendor)}
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

      <VendorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vendor={selectedVendor}
        onSubmit={handleSubmit}
        isLoading={createVendor.isPending || updateVendor.isPending}
      />

      <VendorDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        vendor={selectedVendor}
      />

      <DeleteVendorDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        vendor={selectedVendor}
        onConfirm={handleConfirmDelete}
        isLoading={deleteVendor.isPending}
      />
    </MainLayout>
  );
}
