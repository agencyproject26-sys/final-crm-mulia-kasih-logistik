import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errorHandler";

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  no_aju: string | null;
  bl_number: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_city: string | null;
  party: string | null;
  flight_vessel: string | null;
  origin: string | null;
  no_pen: string | null;
  description: string | null;
  delivery_date: string | null;
  subtotal: number;
  down_payment: number;
  total_amount: number;
  remaining_amount: number;
  status: string | null;
  notes: string | null;
  job_order_id: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export type InvoiceInput = Omit<Invoice, "id" | "created_at" | "updated_at"> & {
  items: InvoiceItem[];
};

export const useInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (input: InvoiceInput) => {
      const { items, ...invoiceData } = input;
      
      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert line items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice berhasil dibuat");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Invoice> & { id: string; items?: InvoiceItem[] }) => {
      const { items, ...invoiceData } = input;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update items if provided
      if (items) {
        // Delete old items
        await supabase.from("invoice_items").delete().eq("invoice_id", id);

        // Insert new items
        if (items.length > 0) {
          const itemsWithInvoiceId = items.map(item => ({
            invoice_id: id,
            description: item.description,
            amount: item.amount,
          }));

          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsWithInvoiceId);

          if (itemsError) throw itemsError;
        }
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Invoice dipindahkan ke Recycle Bin");
    },
    onError: (error: Error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const getInvoiceWithItems = async (id: string): Promise<Invoice | null> => {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError) return null;

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true });

    return { ...invoice, items: items || [] } as Invoice;
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
