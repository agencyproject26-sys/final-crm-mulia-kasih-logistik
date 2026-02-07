import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface Vendor {
  id: string;
  company_name: string;
  pic_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  vendor_type: string | null;
  services: string | null;
  npwp: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  party: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export type VendorInput = Omit<Vendor, "id" | "created_at" | "updated_at">;

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Vendor[];
    },
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: VendorInput) => {
      const { data, error } = await supabase
        .from("vendors")
        .insert(vendor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendor }: Partial<Vendor> & { id: string }) => {
      const { data, error } = await supabase
        .from("vendors")
        .update(vendor)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendors")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Vendor dipindahkan ke Recycle Bin");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}
