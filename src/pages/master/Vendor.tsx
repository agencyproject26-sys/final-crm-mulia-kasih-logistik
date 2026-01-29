import { useState, useMemo } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, MapPin } from "lucide-react";
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

  const groupedByCity = useMemo(() => {
    if (!filteredVendors) return {};
    
    return filteredVendors.reduce((acc, vendor) => {
      const city = vendor.city?.trim() || "Tidak Ada Kota";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(vendor);
      return acc;
    }, {} as Record<string, Vendor[]>);
  }, [filteredVendors]);

  const sortedCities = useMemo(() => {
    return Object.keys(groupedByCity).sort((a, b) => {
      if (a === "Tidak Ada Kota") return 1;
      if (b === "Tidak Ada Kota") return -1;
      return a.localeCompare(b, "id");
    });
  }, [groupedByCity]);

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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-48" />
              </div>
            ))}
          </div>
        ) : sortedCities.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Tidak ada data vendor
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2" defaultValue={sortedCities}>
            {sortedCities.map((city) => (
              <AccordionItem key={city} value={city} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{city}</span>
                    <Badge variant="secondary" className="ml-2">
                      {groupedByCity[city].length} vendor
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border rounded-lg mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Perusahaan</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>PIC</TableHead>
                          <TableHead>Telepon</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByCity[city].map((vendor) => (
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
                            <TableCell>
                              {vendor.phone ? (() => {
                                let phoneNumber = vendor.phone.replace(/[^0-9]/g, "");
                                if (phoneNumber.startsWith("0")) {
                                  phoneNumber = "62" + phoneNumber.substring(1);
                                }

                                const appUrl = `whatsapp://send?phone=${phoneNumber}`;
                                const webUrl = `https://wa.me/${phoneNumber}`;

                                const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  try {
                                    window.location.href = appUrl;
                                  } catch {
                                    // ignore
                                  }

                                  window.setTimeout(() => {
                                    try {
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
                                    {vendor.phone}
                                  </a>
                                );
                              })() : (
                                "-"
                              )}
                            </TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
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
