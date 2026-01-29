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
                    <TableCell>
                      {customer.phone ? (() => {
                        // Format phone number for WhatsApp (Indonesia format)
                        let phoneNumber = customer.phone.replace(/[^0-9]/g, "");
                        // Replace leading 0 with 62 (Indonesia country code)
                        if (phoneNumber.startsWith("0")) {
                          phoneNumber = "62" + phoneNumber.substring(1);
                        }

                        const appUrl = `whatsapp://send?phone=${phoneNumber}`;
                        const webUrl = `https://wa.me/${phoneNumber}`;

                        const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                          // prevent row interactions
                          e.stopPropagation();
                          // Avoid loading WhatsApp inside the preview iframe (blocked by X-Frame-Options)
                          e.preventDefault();

                          // 1) Try open installed app
                          try {
                            window.location.href = appUrl;
                          } catch {
                            // ignore
                          }

                          // 2) Fallback to web (new tab/top) if app protocol isn't handled
                          window.setTimeout(() => {
                            try {
                              // Try break out of iframe when possible
                              window.open(webUrl, "_blank", "noopener,noreferrer");
                            } catch {
                              // ignore
                            }
                          }, 800);
                        };

                        return (
                          <a
                            href={appUrl}
                            onClick={handleWhatsAppClick}
                            className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors"
                            title="Chat via WhatsApp"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 fill-current"
                              aria-hidden="true"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {customer.phone}
                          </a>
                        );
                      })() : (
                        "-"
                      )}
                    </TableCell>
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
