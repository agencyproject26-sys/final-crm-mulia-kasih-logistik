import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  section: "rates" | "green_line" | "red_line";
  item_no: number;
  description: string;
  lcl_rate: number | null;
  fcl_20_rate: number | null;
  fcl_40_rate: number | null;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  route: string | null;
  status: string | null;
  notes: string[] | null;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
}

export interface QuotationInput {
  quotation_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_address?: string | null;
  route?: string | null;
  status?: string;
  notes?: string[];
  items: {
    section: "rates" | "green_line" | "red_line";
    item_no: number;
    description: string;
    lcl_rate: number | null;
    fcl_20_rate: number | null;
    fcl_40_rate: number | null;
  }[];
}

export const useQuotations = () => {
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading, error } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quotation[];
    },
  });

  const createQuotation = useMutation({
    mutationFn: async (input: QuotationInput) => {
      const { items, ...quotationData } = input;

      // Insert quotation
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .insert(quotationData)
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Insert items
      if (items.length > 0) {
        const itemsWithQuotationId = items.map((item) => ({
          ...item,
          quotation_id: quotation.id,
        }));

        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(itemsWithQuotationId);

        if (itemsError) throw itemsError;
      }

      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Penawaran berhasil dibuat");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateQuotation = useMutation({
    mutationFn: async ({ id, items, ...data }: Partial<QuotationInput> & { id: string; items?: QuotationInput["items"] }) => {
      // Update quotation
      const { error: quotationError } = await supabase
        .from("quotations")
        .update(data)
        .eq("id", id);

      if (quotationError) throw quotationError;

      // Update items if provided
      if (items) {
        // Delete old items
        const { error: deleteError } = await supabase
          .from("quotation_items")
          .delete()
          .eq("quotation_id", id);

        if (deleteError) throw deleteError;

        // Insert new items
        const itemsWithQuotationId = items.map((item) => ({
          ...item,
          quotation_id: id,
        }));

        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(itemsWithQuotationId);

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Penawaran berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteQuotation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quotations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Penawaran berhasil dihapus");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const getQuotationWithItems = async (id: string): Promise<Quotation | null> => {
    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (quotationError) throw quotationError;
    if (!quotation) return null;

    const { data: items, error: itemsError } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .order("item_no", { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...quotation,
      items: items as QuotationItem[],
    } as Quotation;
  };

  const generateQuotationNumber = async (): Promise<string> => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    
    const { count } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true });

    const sequence = String((count || 0) + 1).padStart(4, "0");
    return `Q${year}${month}-${sequence}`;
  };

  return {
    quotations,
    isLoading,
    error,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    getQuotationWithItems,
    generateQuotationNumber,
  };
};
