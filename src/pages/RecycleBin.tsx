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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Recycle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecycleBin,
  useRestoreItem,
  usePermanentDelete,
  useEmptyRecycleBin,
  TABLE_LABELS,
  RecycleBinItem,
} from "@/hooks/useRecycleBin";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function RecycleBin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "restore" | "delete" | "empty";
    item?: RecycleBinItem;
  } | null>(null);

  const { data: items = [], isLoading } = useRecycleBin();
  const restoreItem = useRestoreItem();
  const permanentDelete = usePermanentDelete();
  const emptyRecycleBin = useEmptyRecycleBin();

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || item.table_name === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const tableFilters = [
    { key: "all", label: "Semua" },
    ...Object.entries(TABLE_LABELS).map(([key, label]) => ({
      key,
      label,
    })),
  ];

  const handleRestore = (item: RecycleBinItem) => {
    setConfirmDialog({ type: "restore", item });
  };

  const handlePermanentDelete = (item: RecycleBinItem) => {
    setConfirmDialog({ type: "delete", item });
  };

  const handleEmptyBin = () => {
    setConfirmDialog({ type: "empty" });
  };

  const handleConfirm = () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === "restore" && confirmDialog.item) {
      restoreItem.mutate({
        id: confirmDialog.item.id,
        tableName: confirmDialog.item.table_name,
      });
    } else if (confirmDialog.type === "delete" && confirmDialog.item) {
      permanentDelete.mutate({
        id: confirmDialog.item.id,
        tableName: confirmDialog.item.table_name,
      });
    } else if (confirmDialog.type === "empty") {
      emptyRecycleBin.mutate(items);
    }

    setConfirmDialog(null);
  };

  return (
    <MainLayout
      title="Recycle Bin"
      subtitle="Pulihkan atau hapus permanen data yang telah dihapus"
    >
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari data yang dihapus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleEmptyBin}
            disabled={items.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kosongkan Recycle Bin
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-border">
          {tableFilters.map((filter) => {
            const count =
              filter.key === "all"
                ? items.length
                : items.filter((i) => i.table_name === filter.key).length;
            if (filter.key !== "all" && count === 0) return null;
            return (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedFilter === filter.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Recycle className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Recycle Bin kosong</p>
              <p className="text-sm">
                {searchQuery
                  ? "Tidak ada data yang cocok dengan pencarian"
                  : "Tidak ada data yang dihapus"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Dihapus</TableHead>
                  <TableHead className="w-[160px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={`${item.table_name}-${item.id}`} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium">{item.display_name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TABLE_LABELS[item.table_name] || item.table_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.deleted_at), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(item)}
                          className="text-primary hover:text-primary/80"
                          title="Pulihkan"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermanentDelete(item)}
                          className="text-destructive hover:text-destructive/80"
                          title="Hapus Permanen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} item di Recycle Bin
          </p>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog?.type === "restore" ? (
                <>
                  <RotateCcw className="h-5 w-5 text-primary" />
                  Pulihkan Data
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {confirmDialog?.type === "empty"
                    ? "Kosongkan Recycle Bin"
                    : "Hapus Permanen"}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === "restore" ? (
                <>
                  Apakah Anda yakin ingin memulihkan{" "}
                  <strong>{confirmDialog.item?.display_name}</strong>? Data akan
                  dikembalikan ke tempat semula.
                </>
              ) : confirmDialog?.type === "empty" ? (
                <>
                  Apakah Anda yakin ingin mengosongkan seluruh Recycle Bin?{" "}
                  <strong>{items.length} item</strong> akan dihapus secara
                  permanen dan tidak dapat dipulihkan lagi.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong>{confirmDialog?.item?.display_name}</strong> secara
                  permanen? Data tidak dapat dipulihkan lagi.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmDialog?.type === "restore"
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {confirmDialog?.type === "restore"
                ? "Pulihkan"
                : "Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
