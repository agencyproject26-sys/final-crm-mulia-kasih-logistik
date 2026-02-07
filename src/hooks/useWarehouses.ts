import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface Warehouse {
  id: string;
  customer_id: string | null;
  customer_name: string;
  cbm: number | null;
  description: string | null;
  handling_in_out: string | null;
  daily_notes: string | null;
  quantity: number | null;
  unit_price: number | null;
  party: string | null;
  administration: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    company_name: string;
  } | null;
}

export type WarehouseInput = Omit<Warehouse, "id" | "created_at" | "updated_at" | "customers">;

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select(`
          *,
          customers (
            company_name
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Warehouse[];
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouse: WarehouseInput) => {
      const { data, error } = await supabase
        .from("warehouses")
        .insert(warehouse)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Data gudang berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...warehouse }: Partial<Warehouse> & { id: string }) => {
      const { customers, ...warehouseData } = warehouse as Warehouse;
      const { data, error } = await supabase
        .from("warehouses")
        .update(warehouseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Data gudang berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("warehouses")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Data gudang dipindahkan ke Recycle Bin");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}
