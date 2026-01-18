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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  company: string;
  pic: string;
  phone: string;
  email: string;
  city: string;
  type: "eksportir" | "importir" | "keduanya";
  status: "aktif" | "tidak_aktif";
}

const customers: Customer[] = [
  { id: "C001", company: "PT Maju Bersama", pic: "Ahmad Fadli", phone: "08123456789", email: "ahmad@majubersama.com", city: "Jakarta", type: "eksportir", status: "aktif" },
  { id: "C002", company: "CV Sejahtera", pic: "Budi Santoso", phone: "08234567890", email: "budi@sejahtera.com", city: "Surabaya", type: "importir", status: "aktif" },
  { id: "C003", company: "PT Global Trade", pic: "Cahyo Wibowo", phone: "08345678901", email: "cahyo@globaltrade.com", city: "Semarang", type: "keduanya", status: "aktif" },
  { id: "C004", company: "PT Indo Cargo", pic: "Dedi Kurniawan", phone: "08456789012", email: "dedi@indocargo.com", city: "Makassar", type: "eksportir", status: "tidak_aktif" },
  { id: "C005", company: "CV Mandiri", pic: "Eko Prasetyo", phone: "08567890123", email: "eko@mandiri.com", city: "Bandung", type: "importir", status: "aktif" },
];

const typeLabels = {
  eksportir: "Eksportir",
  importir: "Importir",
  keduanya: "Keduanya",
};

export default function Pelanggan() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead className="w-[100px]">ID</TableHead>
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
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.company}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{customer.pic}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>
                    <span className="status-badge status-badge-info">
                      {typeLabels[customer.type]}
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" /> Lihat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm">
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
