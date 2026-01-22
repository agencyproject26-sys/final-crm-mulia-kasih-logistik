import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface Tracking {
  id: string;
  vendor_id: string | null;
  company_name: string;
  aju: string | null;
  container_number: string | null;
  depo_kosongan: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  plate_number: string | null;
  destination: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendors?: {
    company_name: string;
  } | null;
}

export type TrackingInput = Omit<Tracking, "id" | "created_at" | "updated_at" | "vendors">;

export function useTrackings() {
  return useQuery({
    queryKey: ["trackings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trackings")
        .select(`
          *,
          vendors (
            company_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tracking[];
    },
  });
}

export function useCreateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tracking: TrackingInput) => {
      const { data, error } = await supabase
        .from("trackings")
        .insert(tracking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackings"] });
      toast.success("Tracking berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tracking }: Partial<Tracking> & { id: string }) => {
      const { vendors, ...trackingData } = tracking as Tracking;
      const { data, error } = await supabase
        .from("trackings")
        .update(trackingData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackings"] });
      toast.success("Tracking berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}

export function useDeleteTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trackings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackings"] });
      toast.success("Tracking berhasil dihapus");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });
}
