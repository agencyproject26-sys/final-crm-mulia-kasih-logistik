import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface Truck {
  id: string;
  truck_id: string;
  plate_number: string;
  truck_type: string;
  capacity: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export type TruckInput = Omit<Truck, "id" | "created_at" | "updated_at">;

export const useTrucks = () => {
  const queryClient = useQueryClient();

  const { data: trucks = [], isLoading, error } = useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trucks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Truck[];
    },
  });

  const createTruck = useMutation({
    mutationFn: async (truck: TruckInput) => {
      const { data, error } = await supabase
        .from("trucks")
        .insert(truck)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      toast.success("Truk berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateTruck = useMutation({
    mutationFn: async ({ id, ...truck }: Partial<Truck> & { id: string }) => {
      const { data, error } = await supabase
        .from("trucks")
        .update(truck)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      toast.success("Truk berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteTruck = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trucks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      toast.success("Truk berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  return {
    trucks,
    isLoading,
    error,
    createTruck,
    updateTruck,
    deleteTruck,
  };
};
