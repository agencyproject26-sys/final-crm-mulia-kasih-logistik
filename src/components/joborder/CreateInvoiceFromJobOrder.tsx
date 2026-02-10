import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, ChevronDown, Receipt, Package, Upload, Wrench, Clock, Move, MoreHorizontal, Banknote, Eye, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobOrder } from "@/hooks/useJobOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateInvoiceFromJobOrderProps {
  jobOrder: JobOrder;
  onSuccess?: () => void;
}

type InvoiceCategory = "penumpukan" | "do" | "spjm" | "repair" | "perpanjangan_do" | "perpanjangan_tila" | "gerakan" | "lain_lain";

const invoiceCategories: Record<InvoiceCategory, { label: string; icon: React.ElementType; color: string }> = {
  penumpukan: { label: "Invoice Penumpukan", icon: Package, color: "text-primary" },
  do: { label: "Invoice DO", icon: Banknote, color: "text-success" },
  spjm: { label: "Invoice Penumpukan SPJM", icon: Receipt, color: "text-destructive" },
  repair: { label: "Invoice Repair", icon: Wrench, color: "text-warning" },
  perpanjangan_do: { label: "Invoice Perpanjangan DO", icon: Clock, color: "text-blue-500" },
  perpanjangan_tila: { label: "Invoice Perpanjangan Tila", icon: Clock, color: "text-purple-500" },
  gerakan: { label: "Invoice Gerakan", icon: Move, color: "text-orange-500" },
  lain_lain: { label: "Invoice Lain-lain", icon: MoreHorizontal, color: "text-muted-foreground" },
};

const BUCKET = "job-order-invoices";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
}

export const CreateInvoiceFromJobOrder = ({ jobOrder, onSuccess }: CreateInvoiceFromJobOrderProps) => {
  const [selectedCategory, setSelectedCategory] = useState<InvoiceCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCategoryRef = useRef<InvoiceCategory | null>(null);
  const queryClient = useQueryClient();

  const folderPath = selectedCategory ? `${jobOrder.id}/${selectedCategory}` : "";

  const { data: files = [], isLoading: isFilesLoading } = useQuery({
    queryKey: ["job-order-files", jobOrder.id, selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(`${jobOrder.id}/${selectedCategory}`, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder") as StorageFile[];
    },
    enabled: !!selectedCategory,
  });

  const triggerUpload = (category: InvoiceCategory) => {
    uploadCategoryRef.current = category;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const category = uploadCategoryRef.current;
    if (!file || !category) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${jobOrder.id}/${category}/${fileName}`;

      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
      if (error) throw error;

      toast.success(`File berhasil diupload ke ${invoiceCategories[category].label}`);
      // If dialog is open for this category, refresh files
      if (selectedCategory === category) {
        queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrder.id, category] });
      }
      // Also open the dialog to show the uploaded file
      setSelectedCategory(category);
      queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrder.id, category] });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = (fileName: string) => {
    if (!selectedCategory) return;
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${jobOrder.id}/${selectedCategory}/${fileName}`);
    setPreviewUrl(data.publicUrl);
  };

  const handleDownload = async (fileName: string) => {
    if (!selectedCategory) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(`${jobOrder.id}/${selectedCategory}/${fileName}`);

    if (error) {
      toast.error("Gagal mengunduh file");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/^\d+_/, "");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName: string) => {
    if (!selectedCategory) return;
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${jobOrder.id}/${selectedCategory}/${fileName}`]);

    if (error) {
      toast.error("Gagal menghapus file");
      return;
    }

    toast.success("File berhasil dihapus");
    queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrder.id, selectedCategory] });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelected}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1" disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
            Invoice
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-popover">
          {(Object.keys(invoiceCategories) as InvoiceCategory[]).map((category) => {
            const { label, icon: Icon, color } = invoiceCategories[category];
            return (
              <DropdownMenuItem key={category} onClick={() => triggerUpload(category)}>
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <Icon className={`h-4 w-4 ${color}`} />
                  Upload {label}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Files Dialog - shows uploaded files for a category */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory && invoiceCategories[selectedCategory].label} - {jobOrder.job_order_number}
            </DialogTitle>
          </DialogHeader>

          {/* Upload more button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => selectedCategory && triggerUpload(selectedCategory)}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Mengupload..." : "Upload File Lagi"}
          </Button>

          {/* File list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isFilesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Memuat...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada file</p>
              </div>
            ) : (
              files.map((file) => {
                const displayName = file.name.replace(/^\d+_/, "");
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{displayName}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(file.name)} title="Lihat">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(file.name)} title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(file.name)} title="Hapus">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview File</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-[70vh] rounded-lg border"
              title="File Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
