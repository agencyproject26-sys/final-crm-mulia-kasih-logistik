import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Truck, Anchor, Ship, Warehouse, Wrench } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useExpenses, useDeleteExpense, type Expense, type ExpenseCategory } from "@/hooks/useExpenses";
import { ExpenseDialog } from "@/components/expense/ExpenseDialog";
import { DeleteExpenseDialog } from "@/components/expense/DeleteExpenseDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryConfig: Record<ExpenseCategory, { label: string; icon: React.ElementType; color: string }> = {
  truk: { label: "Biaya Truk", icon: Truck, color: "bg-blue-100 text-blue-700" },
  pelabuhan: { label: "Biaya Pelabuhan", icon: Anchor, color: "bg-cyan-100 text-cyan-700" },
  shipping_line: { label: "Biaya Shipping Line", icon: Ship, color: "bg-indigo-100 text-indigo-700" },
  gudang: { label: "Biaya Gudang", icon: Warehouse, color: "bg-amber-100 text-amber-700" },
  operasional: { label: "Biaya Operasional", icon: Wrench, color: "bg-purple-100 text-purple-700" },
};

export default function Pengeluaran() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedExpense) {
      deleteExpense.mutate(selectedExpense.id);
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExpense(null);
  };

  // Summary by category
  const categorySummary = Object.entries(categoryConfig).map(([key, config]) => {
    const categoryExpenses = expenses.filter((e) => e.category === key);
    const total = categoryExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return { key, ...config, total, count: categoryExpenses.length };
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <MainLayout title="Pengeluaran" subtitle="Kelola semua pengeluaran operasional">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)} className="ocean-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorySummary.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="p-4 rounded-xl border bg-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCategoryFilter(cat.key)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${cat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{cat.label}</p>
                <p className="text-lg font-bold">{formatRupiah(cat.total)}</p>
                <p className="text-xs text-muted-foreground">{cat.count} transaksi</p>
              </div>
            );
          })}
          <div
            className="p-4 rounded-xl border bg-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCategoryFilter("all")}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total Semua</p>
            <p className="text-lg font-bold text-primary">{formatRupiah(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground">{expenses.length} transaksi</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Job Order</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Tidak ada data pengeluaran
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => {
                  const catConfig = categoryConfig[expense.category];
                  const Icon = catConfig.icon;
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.expense_date), "dd MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <Badge className={catConfig.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {catConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground">{expense.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{expense.vendors?.company_name || "-"}</TableCell>
                      <TableCell>{expense.job_orders?.job_order_number || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(Number(expense.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ExpenseDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        expense={selectedExpense}
      />

      <DeleteExpenseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        expenseDescription={selectedExpense?.description || ""}
      />
    </MainLayout>
  );
}
