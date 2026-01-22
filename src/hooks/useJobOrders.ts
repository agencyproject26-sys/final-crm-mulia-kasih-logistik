import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface JobOrder {
  id: string;
  job_order_number: string;
  eta_kapal: string | null;
  bl_number: string | null;
  no_invoice: string | null;
  aju: string | null;
  party: string | null;
  exp_do: string | null;
  status_do: string | null;
  pembayaran_do: string | null;
  lokasi: string | null;
  tujuan: string | null;
  respond_bc: string | null;
  status_bl: string | null;
  customer_id: string | null;
  customer_name: string | null;
  notes: string | null;
  status: string | null;
  total_invoice_amount: number | null;
  total_paid_amount: number | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
}

export type JobOrderInput = Omit<JobOrder, "id" | "created_at" | "updated_at" | "total_invoice_amount" | "total_paid_amount" | "payment_status">;

export const useJobOrders = () => {
  const queryClient = useQueryClient();

  const { data: jobOrders = [], isLoading, error } = useQuery({
    queryKey: ["job_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobOrder[];
    },
  });

  const createJobOrder = useMutation({
    mutationFn: async (input: JobOrderInput) => {
      const { data, error } = await supabase
        .from("job_orders")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_orders"] });
      toast.success("Job Order berhasil dibuat");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateJobOrder = useMutation({
    mutationFn: async ({ id, ...input }: Partial<JobOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_orders")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_orders"] });
      toast.success("Job Order berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteJobOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_orders"] });
      toast.success("Job Order berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const generateJobOrderNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `JO${year}${month}-${random}`;
  };

  return {
    jobOrders,
    isLoading,
    error,
    createJobOrder,
    updateJobOrder,
    deleteJobOrder,
    generateJobOrderNumber,
  };
};
