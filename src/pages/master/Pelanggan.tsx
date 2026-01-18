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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  Customer,
  CustomerInput,
} from "@/hooks/useCustomers";
import { CustomerDialog } from "@/components/master/CustomerDialog";
import { CustomerDetailDialog } from "@/components/master/CustomerDetailDialog";
import { DeleteCustomerDialog } from "@/components/master/DeleteCustomerDialog";
import { Skeleton } from "@/components/ui/skeleton";

const typeLabels = {
  eksportir: "Eksportir",
  importir: "Importir",
  keduanya: "Keduanya",
};

export default function Pelanggan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.pic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (customer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleViewClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (data: CustomerInput) => {
    if (selectedCustomer) {
      updateCustomer.mutate(
        { id: selectedCustomer.id, ...data },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createCustomer.mutate(data, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomer) {
      deleteCustomer.mutate(selectedCustomer.id, {
        onSuccess: () => setIsDeleteOpen(false),
      });
    }
  };

  return (
    <MainLayout title="Master Pelanggan" subtitle="Kelola data pelanggan Anda">
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Perusahaan</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "Tidak ada pelanggan yang ditemukan"
                      : "Belum ada data pelanggan"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{customer.pic_name || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.city || "-"}</TableCell>
                    <TableCell>
                      <span className="status-badge status-badge-info">
                        {typeLabels[customer.customer_type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "status-badge",
                          customer.status === "aktif"
                            ? "status-badge-success"
                            : "status-badge-destructive"
                        )}
                      >
                        {customer.status === "aktif" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClick(customer)}>
                            <Eye className="h-4 w-4 mr-2" /> Lihat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(customer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
      />

      <CustomerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        customer={selectedCustomer}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCustomer.isPending}
      />
    </MainLayout>
  );
}
