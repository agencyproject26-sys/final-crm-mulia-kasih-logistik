import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  Loader2,
  Package,
  CreditCard,
  Stamp,
  Wrench,
  Clock,
  Timer,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

const BUCKET = "job-order-invoices";

export const INVOICE_CATEGORIES = [
  { key: "penumpukan", label: "Upload Invoice Penumpukan", icon: Package },
  { key: "do", label: "Upload Invoice DO", icon: CreditCard },
  { key: "penumpukan-spjm", label: "Upload Invoice Penumpukan SPJM", icon: Stamp },
  { key: "repair", label: "Upload Invoice Repair", icon: Wrench },
  { key: "perpanjangan-do", label: "Upload Invoice Perpanjangan DO", icon: Clock },
  { key: "perpanjangan-tila", label: "Upload Invoice Perpanjangan Tila", icon: Timer },
  { key: "gerakan", label: "Upload Invoice Gerakan", icon: ArrowUpDown },
  { key: "lain-lain", label: "Upload Invoice Lain-lain", icon: MoreHorizontal },
] as const;

export type InvoiceCategoryKey = typeof INVOICE_CATEGORIES[number]["key"];

interface CategoryFileUploadProps {
  jobOrderId: string;
  category: typeof INVOICE_CATEGORIES[number];
}

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
}

export function CategoryFileUpload({ jobOrderId, category }: CategoryFileUploadProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const folderPath = `${jobOrderId}/${category.key}`;

  const { data: files = [], isLoading } = useQuery({
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
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
      if (error) throw error;

      toast.success(`File berhasil diupload ke ${category.label.replace("Upload ", "")}`);
      queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId, category.key] });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${folderPath}/${fileName}`, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Gagal membuka file");
      return;
    }
    setPreviewUrl(data.signedUrl);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(`${folderPath}/${fileName}`);

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
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${folderPath}/${fileName}`]);

    if (error) {
      toast.error("Gagal menghapus file");
      return;
    }

    toast.success("File berhasil dihapus");
    queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId, category.key] });
  };

  const Icon = category.icon;

  return (
    <div className="space-y-2">
      {/* Upload row */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2 w-full justify-start"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <Icon className="h-4 w-4" />
          <span className="text-sm">{category.label}</span>
          {files.length > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
              {files.length}
            </span>
          )}
        </Button>
      </div>

      {/* File list */}
      {files.length > 0 && (
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleView(file.name)}
                    title="Lihat"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDownload(file.name)}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(file.name)}
                    title="Hapus"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview - {category.label.replace("Upload ", "")}</DialogTitle>
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
    </div>
  );
}

interface JobOrderInvoiceUploadsProps {
  jobOrderId: string;
}

export function JobOrderInvoiceUploads({ jobOrderId }: JobOrderInvoiceUploadsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
        Upload Invoice
      </h3>
      <div className="space-y-2">
        {INVOICE_CATEGORIES.map((cat) => (
          <CategoryFileUpload
            key={cat.key}
            jobOrderId={jobOrderId}
            category={cat}
          />
        ))}
      </div>
    </div>
  );
}
