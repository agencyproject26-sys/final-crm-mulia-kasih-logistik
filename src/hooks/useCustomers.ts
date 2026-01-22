import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";
export interface Customer {
  id: string;
  company_name: string;
  pic_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  npwp: string | null;
  customer_type: "eksportir" | "importir" | "keduanya";
  status: "aktif" | "tidak_aktif";
  created_at: string;
  updated_at: string;
}

export type CustomerInput = Omit<Customer, "id" | "created_at" | "updated_at">;

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: CustomerInput) => {
      const { data, error } = await supabase
        .from("customers")
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Pelanggan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...customer }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(customer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Pelanggan berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Pelanggan berhasil dihapus");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}
