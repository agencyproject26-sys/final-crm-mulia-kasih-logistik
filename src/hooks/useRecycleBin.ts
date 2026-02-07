import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RecycleBinItem {
  id: string;
  table_name: string;
  display_name: string;
  description: string;
  deleted_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  customers: "Pelanggan",
  vendors: "Vendor",
  trucks: "Truk",
  job_orders: "Job Order",
  invoices: "Invoice",
  invoice_dp: "Invoice DP",
  expenses: "Pengeluaran",
  quotations: "Penawaran",
  trackings: "Tracking",
  warehouses: "Gudang",
};

const TABLES = Object.keys(TABLE_LABELS);

type SupabaseTable = "customers" | "vendors" | "trucks" | "job_orders" | "invoices" | "invoice_dp" | "expenses" | "quotations" | "trackings" | "warehouses";

function getDisplayName(tableName: string, row: any): string {
  switch (tableName) {
    case "customers":
      return row.company_name || "-";
    case "vendors":
      return row.company_name || "-";
    case "trucks":
      return `${row.plate_number || ""} - ${row.truck_type || ""}`;
    case "job_orders":
      return row.job_order_number || "-";
    case "invoices":
      return row.invoice_number || "-";
    case "invoice_dp":
      return row.invoice_dp_number || "-";
    case "expenses":
      return row.description || "-";
    case "quotations":
      return row.quotation_number || "-";
    case "trackings":
      return row.company_name || "-";
    case "warehouses":
      return row.customer_name || "-";
    default:
      return "-";
  }
}

function getDescription(tableName: string, row: any): string {
  switch (tableName) {
    case "customers":
      return row.city || row.email || "-";
    case "vendors":
      return row.city || row.services || "-";
    case "trucks":
      return row.driver_name || "-";
    case "job_orders":
      return row.customer_name || "-";
    case "invoices":
      return `${row.customer_name || ""} - Rp ${Number(row.total_amount || 0).toLocaleString("id-ID")}`;
    case "invoice_dp":
      return `${row.customer_name || ""} - Rp ${Number(row.total_amount || 0).toLocaleString("id-ID")}`;
    case "expenses":
      return `${row.category || ""} - Rp ${Number(row.amount || 0).toLocaleString("id-ID")}`;
    case "quotations":
      return row.customer_name || "-";
    case "trackings":
      return row.container_number || row.destination || "-";
    case "warehouses":
      return row.description || "-";
    default:
      return "-";
  }
}

export function useRecycleBin() {
  return useQuery({
    queryKey: ["recycle-bin"],
    queryFn: async () => {
      const allItems: RecycleBinItem[] = [];

      for (const tableName of TABLES) {
        const { data, error } = await supabase
          .from(tableName as SupabaseTable)
          .select("*")
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false });

        if (error) {
          console.error(`Error fetching deleted ${tableName}:`, error);
          continue;
        }

        if (data) {
          for (const row of data) {
            allItems.push({
              id: row.id,
              table_name: tableName,
              display_name: getDisplayName(tableName, row),
              description: getDescription(tableName, row),
              deleted_at: row.deleted_at,
            });
          }
        }
      }

      // Sort all items by deleted_at descending
      allItems.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

      return allItems;
    },
  });
}

export function useRestoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tableName }: { id: string; tableName: string }) => {
      const { error } = await supabase
        .from(tableName as SupabaseTable)
        .update({ deleted_at: null } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const label = TABLE_LABELS[variables.tableName] || variables.tableName;
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      // Invalidate the source table queries
      queryClient.invalidateQueries({ queryKey: [variables.tableName] });
      // Also handle special query keys
      if (variables.tableName === "invoice_dp") {
        queryClient.invalidateQueries({ queryKey: ["invoices_dp"] });
      }
      toast.success(`${label} berhasil dipulihkan`);
    },
    onError: (error) => {
      toast.error("Gagal memulihkan: " + (error as Error).message);
    },
  });
}

export function usePermanentDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tableName }: { id: string; tableName: string }) => {
      const { error } = await supabase
        .from(tableName as SupabaseTable)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const label = TABLE_LABELS[variables.tableName] || variables.tableName;
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success(`${label} dihapus permanen`);
    },
    onError: (error) => {
      toast.error("Gagal menghapus: " + (error as Error).message);
    },
  });
}

export function useEmptyRecycleBin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: RecycleBinItem[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from(item.table_name as SupabaseTable)
          .delete()
          .eq("id", item.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Recycle Bin berhasil dikosongkan");
    },
    onError: (error) => {
      toast.error("Gagal mengosongkan: " + (error as Error).message);
    },
  });
}

export { TABLE_LABELS };
