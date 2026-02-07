import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceDPItem {
  id?: string;
  invoice_dp_id?: string;
  description: string;
  amount: number;
}

export interface InvoiceDP {
  id: string;
  invoice_dp_number: string;
  invoice_pib_number: string | null;
  part_number: number;
  invoice_date: string;
  customer_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_city: string | null;
  bl_number: string | null;
  description: string | null;
  total_amount: number;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDPInput {
  invoice_dp_number: string;
  invoice_pib_number?: string | null;
  part_number: number;
  invoice_date: string;
  customer_id?: string | null;
  customer_name: string;
  customer_address?: string | null;
  customer_city?: string | null;
  bl_number?: string | null;
  description?: string | null;
  total_amount: number;
  status?: string | null;
  notes?: string | null;
  items: InvoiceDPItem[];
}

export function useInvoiceDP() {
  const queryClient = useQueryClient();

  const { data: invoicesDP = [], isLoading } = useQuery({
    queryKey: ["invoices_dp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_dp")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InvoiceDP[];
    },
  });

  const getInvoiceDPWithItems = async (id: string) => {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoice_dp")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError) throw invoiceError;

    const { data: items, error: itemsError } = await supabase
      .from("invoice_dp_items")
      .select("*")
      .eq("invoice_dp_id", id);

    if (itemsError) throw itemsError;

    return { ...invoice, items: items || [] };
  };

  const getNextPartNumber = async (invoiceNumber: string) => {
    const { data, error } = await supabase
      .from("invoice_dp")
      .select("part_number")
      .eq("invoice_dp_number", invoiceNumber)
      .order("part_number", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0].part_number + 1 : 1;
  };

  const duplicateAsNextPart = useMutation({
    mutationFn: async (sourceId: string) => {
      // Get source invoice with items
      const { data: sourceInvoice, error: sourceError } = await supabase
        .from("invoice_dp")
        .select("*")
        .eq("id", sourceId)
        .single();

      if (sourceError) throw sourceError;

      // Get next part number for same invoice number
      const nextPart = await getNextPartNumber(sourceInvoice.invoice_dp_number);

      // Get source items
      const { data: sourceItems, error: itemsError } = await supabase
        .from("invoice_dp_items")
        .select("*")
        .eq("invoice_dp_id", sourceId);

      if (itemsError) throw itemsError;

      // Create new invoice with next part number
      const { data: newInvoice, error: createError } = await supabase
        .from("invoice_dp")
        .insert({
          invoice_dp_number: sourceInvoice.invoice_dp_number,
          part_number: nextPart,
          invoice_date: new Date().toISOString().split('T')[0],
          customer_id: sourceInvoice.customer_id,
          customer_name: sourceInvoice.customer_name,
          customer_address: sourceInvoice.customer_address,
          customer_city: sourceInvoice.customer_city,
          bl_number: sourceInvoice.bl_number,
          description: sourceInvoice.description,
          total_amount: sourceInvoice.total_amount,
          status: "draft",
          notes: sourceInvoice.notes,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Duplicate items
      if (sourceItems && sourceItems.length > 0) {
        const newItems = sourceItems.map((item) => ({
          invoice_dp_id: newInvoice.id,
          description: item.description,
          amount: item.amount,
        }));

        const { error: insertItemsError } = await supabase
          .from("invoice_dp_items")
          .insert(newItems);

        if (insertItemsError) throw insertItemsError;
      }

      return newInvoice;
    },
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices_dp"] });
      toast.success(`Invoice DP Part ${newInvoice.part_number} berhasil dibuat`);
    },
    onError: (error) => {
      toast.error("Gagal membuat Part baru: " + error.message);
    },
  });

  const getInvoiceDPByCustomer = async (customerId: string) => {
    const { data, error } = await supabase
      .from("invoice_dp")
      .select("*")
      .eq("customer_id", customerId)
      .order("part_number", { ascending: true });

    if (error) throw error;
    return data as InvoiceDP[];
  };

  const createInvoiceDP = useMutation({
    mutationFn: async (input: InvoiceDPInput) => {
      const { items, ...invoiceData } = input;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoice_dp")
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (items && items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
          invoice_dp_id: invoice.id,
          description: item.description,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_dp_items")
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_dp"] });
      toast.success("Invoice DP berhasil dibuat");
    },
    onError: (error) => {
      toast.error("Gagal membuat Invoice DP: " + error.message);
    },
  });

  const updateInvoiceDP = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: InvoiceDPInput }) => {
      const { items, ...invoiceData } = input;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoice_dp")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Delete existing items and insert new ones
      await supabase.from("invoice_dp_items").delete().eq("invoice_dp_id", id);

      if (items && items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
          invoice_dp_id: id,
          description: item.description,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_dp_items")
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_dp"] });
      toast.success("Invoice DP berhasil diupdate");
    },
    onError: (error) => {
      toast.error("Gagal mengupdate Invoice DP: " + error.message);
    },
  });

  const deleteInvoiceDP = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoice_dp")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices_dp"] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Invoice DP dipindahkan ke Recycle Bin");
    },
    onError: (error) => {
      toast.error("Gagal menghapus Invoice DP: " + error.message);
    },
  });

  return {
    invoicesDP,
    isLoading,
    createInvoiceDP,
    updateInvoiceDP,
    deleteInvoiceDP,
    duplicateAsNextPart,
    getInvoiceDPWithItems,
    getNextPartNumber,
    getInvoiceDPByCustomer,
  };
}
