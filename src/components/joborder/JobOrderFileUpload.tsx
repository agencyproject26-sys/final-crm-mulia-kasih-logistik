import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, Eye, Download, Trash2, FileText, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface JobOrderFileUploadProps {
  jobOrderId: string;
  jobOrderNumber: string;
}

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
}

const BUCKET = "job-order-invoices";

export function JobOrderFileUpload({ jobOrderId, jobOrderNumber }: JobOrderFileUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const folderPath = `${jobOrderId}/`;

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["job-order-files", jobOrderId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(jobOrderId, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []) as StorageFile[];
    },
    enabled: isDialogOpen,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${jobOrderId}/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file);

      if (error) throw error;

      toast.success("File berhasil diupload");
      queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId] });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = (fileName: string) => {
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${jobOrderId}/${fileName}`);
    setPreviewUrl(data.publicUrl);
  };

  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(`${jobOrderId}/${fileName}`);

    if (error) {
      toast.error("Gagal mengunduh file");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${jobOrderId}/${fileName}`]);

    if (error) {
      toast.error("Gagal menghapus file");
      return;
    }

    toast.success("File berhasil dihapus");
    queryClient.invalidateQueries({ queryKey: ["job-order-files", jobOrderId] });
  };

  const fileCount = files.length;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="gap-1"
      >
        <Paperclip className="h-4 w-4" />
        {fileCount > 0 && (
          <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5">
            {fileCount}
          </span>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice Files - {jobOrderNumber}</DialogTitle>
          </DialogHeader>

          {/* Upload */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              variant="outline"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Mengupload..." : "Pilih File & Upload"}
            </Button>
          </div>

          {/* File List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleView(file.name)}
                        title="Lihat"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload(file.name)}
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(file.name)}
                        title="Hapus"
                      >
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
}
