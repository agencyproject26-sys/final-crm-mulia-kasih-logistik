import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText, ChevronDown, Receipt, Package, Upload, Wrench, Clock, Move,
  MoreHorizontal, Banknote, Eye, Download, Trash2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobOrder } from "@/hooks/useJobOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CreateInvoiceFromJobOrderProps {
  jobOrder: JobOrder;
  onSuccess?: () => void;
}

type InvoiceCategory = "penumpukan" | "do" | "spjm" | "repair" | "perpanjangan_do" | "perpanjangan_tila" | "gerakan" | "lain_lain" | "foto_repair";

const CATEGORIES: { key: InvoiceCategory; label: string; icon: React.ElementType; color: string }[] = [
  { key: "penumpukan", label: "Invoice Penumpukan", icon: Package, color: "text-primary" },
  { key: "do", label: "Invoice DO", icon: Banknote, color: "text-success" },
  { key: "spjm", label: "Invoice Penumpukan SPJM", icon: Receipt, color: "text-destructive" },
  { key: "repair", label: "Invoice Repair", icon: Wrench, color: "text-warning" },
  { key: "perpanjangan_do", label: "Invoice Perpanjangan DO", icon: Clock, color: "text-blue-500" },
  { key: "perpanjangan_tila", label: "Invoice Perpanjangan Tila", icon: Clock, color: "text-purple-500" },
  { key: "gerakan", label: "Invoice Gerakan", icon: Move, color: "text-orange-500" },
  { key: "foto_repair", label: "Foto Repair", icon: Wrench, color: "text-amber-500" },
  { key: "lain_lain", label: "Invoice Lain-lain", icon: MoreHorizontal, color: "text-muted-foreground" },
];

const BUCKET = "job-order-invoices";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
}

function CategoryRow({
  jobOrderId,
  category,
}: {
  jobOrderId: string;
  category: typeof CATEGORIES[number];
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const folderPath = `${jobOrderId}/${category.key}`;

  const { data: files = [] } = useQuery({
    queryKey: ["job-order-files", jobOrderId, category.key],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folderPath, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder") as StorageFile[];
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(`${folderPath}/${fileName}`, file);
      if (error) throw error;
      toast.success(`File berhasil diupload ke ${category.label}`);
      queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId, category.key] });
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = (fileName: string) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${folderPath}/${fileName}`);
    setPreviewUrl(data.publicUrl);
  };

  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).download(`${folderPath}/${fileName}`);
    if (error) { toast.error("Gagal mengunduh file"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/^\d+_/, "");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([`${folderPath}/${fileName}`]);
    if (error) { toast.error("Gagal menghapus file"); return; }
    toast.success("File berhasil dihapus");
    queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId, category.key] });
  };

  const Icon = category.icon;
  const hasFiles = files.length > 0;

  return (
    <>
      <div className="space-y-2">
        {/* Category header with actions */}
        <div className="flex items-center gap-2 py-2">
          <Icon className={`h-4 w-4 shrink-0 ${category.color}`} />
          <span className="text-sm font-medium flex-1 min-w-0">{category.label}</span>
          {hasFiles && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {files.length}
            </Badge>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Uploaded files */}
        {hasFiles && (
          <div className="ml-6 space-y-1">
            {files.map((file) => {
              const displayName = file.name.replace(/^\d+_/, "");
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/40 text-sm"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-xs">{displayName}</span>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(file.name)} title="Lihat">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(file.name)} title="Download">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(file.name)} title="Hapus">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview - {category.label}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(previewUrl) ? (
              <div className="w-full max-h-[70vh] overflow-auto flex items-start justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto object-contain rounded-lg"
                />
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] rounded-lg border"
                style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133%", height: "93vh" }}
                title="File Preview"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export const CreateInvoiceFromJobOrder = ({ jobOrder }: CreateInvoiceFromJobOrderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsOpen(true)}>
        <Receipt className="h-4 w-4" />
        Invoice
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Files - {jobOrder.job_order_number}</DialogTitle>
          </DialogHeader>

          <div className="divide-y divide-border">
            {CATEGORIES.map((cat) => (
              <CategoryRow key={cat.key} jobOrderId={jobOrder.id} category={cat} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
