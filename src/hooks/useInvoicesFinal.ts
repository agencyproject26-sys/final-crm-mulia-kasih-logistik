import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";
import type { Invoice, InvoiceInput, InvoiceItem } from "@/hooks/useInvoices";

export const useInvoicesFinal = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["invoices_final"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices_final")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (input: InvoiceInput) => {
      const { items, ...invoiceData } = input;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices_final")
        .insert(invoiceData as any)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_final_items")
          .insert(itemsWithInvoiceId as any);

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_final"] });
      toast.success("Invoice Final berhasil dibuat");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Invoice> & { id: string; items?: InvoiceItem[] }) => {
      const { items, ...invoiceData } = input;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices_final")
        .update(invoiceData as any)
        .eq("id", id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (items) {
        await supabase.from("invoice_final_items").delete().eq("invoice_id", id);

        if (items.length > 0) {
          const itemsWithInvoiceId = items.map(item => ({
            invoice_id: id,
            description: item.description,
            amount: item.amount,
          }));

          const { error: itemsError } = await supabase
            .from("invoice_final_items")
            .insert(itemsWithInvoiceId as any);

          if (itemsError) throw itemsError;
        }
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_final"] });
      toast.success("Invoice Final berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices_final")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_final"] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Invoice Final dipindahkan ke Recycle Bin");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const getInvoiceWithItems = async (id: string): Promise<Invoice | null> => {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices_final")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError) return null;

    const { data: items } = await supabase
      .from("invoice_final_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true });

    return { ...invoice, items: items || [] } as unknown as Invoice;
  };

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceWithItems,
  };
};
