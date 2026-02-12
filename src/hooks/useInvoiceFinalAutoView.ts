import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InvoiceFinalAutoEntry {
  invoice_number: string;
  customer_name: string;
  customer_address: string | null;
  customer_city: string | null;
  customer_id: string | null;
  invoice_date: string;
  no_aju: string | null;
  bl_number: string | null;
  party: string | null;
  flight_vessel: string | null;
  origin: string | null;
  no_pen: string | null;
  no_invoice: string | null;
  description: string | null;
  delivery_date: string | null;
  reimbursement_id: string | null;
  reimbursement_total: number;
  invoice_id: string | null;
  invoice_total: number;
  combined_total: number;
  down_payment: number;
  remaining_amount: number;
  dp_items: { label: string; amount: number; date?: string }[];
}

export const useInvoiceFinalAutoView = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["invoice_final_auto_view"],
    queryFn: async () => {
      // Fetch all reimbursements
      const { data: reimbursements } = await supabase
        .from("invoices_reimbursement")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      // Fetch all invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      const reimbMap = new Map<string, any>();
      const invoiceMap = new Map<string, any>();

      (reimbursements || []).forEach((r) => {
        const key = r.invoice_number?.trim();
        if (key) reimbMap.set(key, r);
      });

      (invoices || []).forEach((inv) => {
        const key = inv.invoice_number?.trim();
        if (key) invoiceMap.set(key, inv);
      });

      // Combine unique invoice numbers
      const allNumbers = new Set<string>([
        ...reimbMap.keys(),
        ...invoiceMap.keys(),
      ]);

      const results: InvoiceFinalAutoEntry[] = [];

      for (const invNumber of allNumbers) {
        const reimb = reimbMap.get(invNumber);
        const inv = invoiceMap.get(invNumber);
        const source = reimb || inv;

        const reimbTotal = reimb ? Number(reimb.total_amount) || 0 : 0;
        const invTotal = inv ? Number(inv.total_amount) || 0 : 0;
        const combinedTotal = reimbTotal + invTotal;

        // Get DP from invoice
        let dpTotal = 0;
        let dpItems: { label: string; amount: number; date?: string }[] = [];

        if (inv) {
          const savedDp = inv.dp_items as { label: string; amount: number; date?: string }[] | null;
          if (savedDp && Array.isArray(savedDp) && savedDp.length > 0) {
            dpItems = savedDp.map((dp, i) => ({
              label: dp.label || `DP ${i + 1}`,
              amount: Number(dp.amount) || 0,
              date: dp.date || inv.invoice_date || "",
            }));
          } else if (Number(inv.down_payment) > 0) {
            dpItems = [{ label: "DP 1", amount: Number(inv.down_payment), date: inv.invoice_date || "" }];
          }
          dpTotal = dpItems.reduce((sum, dp) => sum + dp.amount, 0);
        }

        const remainingAmount = combinedTotal - dpTotal;

        results.push({
          invoice_number: invNumber,
          customer_name: source.customer_name || "-",
          customer_address: source.customer_address || null,
          customer_city: source.customer_city || null,
          customer_id: source.customer_id || null,
          invoice_date: source.invoice_date || source.created_at,
          no_aju: source.no_aju || null,
          bl_number: source.bl_number || null,
          party: source.party || null,
          flight_vessel: source.flight_vessel || null,
          origin: source.origin || null,
          no_pen: source.no_pen || null,
          no_invoice: source.no_invoice || null,
          description: source.description || null,
          delivery_date: source.delivery_date || null,
          reimbursement_id: reimb?.id || null,
          reimbursement_total: reimbTotal,
          invoice_id: inv?.id || null,
          invoice_total: invTotal,
          combined_total: combinedTotal,
          down_payment: dpTotal,
          remaining_amount: remainingAmount,
          dp_items: dpItems,
        });
      }

      return results;
    },
  });

  const getDetailedItems = async (entry: InvoiceFinalAutoEntry) => {
    const items: { description: string; amount: number }[] = [];
    let dpItems = entry.dp_items;

    // Fetch reimbursement items
    if (entry.reimbursement_id) {
      const { data: reimbItems } = await supabase
        .from("invoice_reimbursement_items")
        .select("*")
        .eq("invoice_id", entry.reimbursement_id)
        .order("created_at", { ascending: true });

      if (reimbItems && reimbItems.length > 0) {
        reimbItems.forEach((item) => {
          items.push({
            description: `Reimbursement - ${item.description}`,
            amount: Number(item.amount) || 0,
          });
        });
      } else {
        items.push({ description: "Invoice Reimbursement", amount: entry.reimbursement_total });
      }
    }

    // Fetch invoice items
    if (entry.invoice_id) {
      const { data: invItems } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", entry.invoice_id)
        .order("created_at", { ascending: true });

      if (invItems && invItems.length > 0) {
        invItems.forEach((item) => {
          items.push({
            description: `Invoice - ${item.description}`,
            amount: Number(item.amount) || 0,
          });
        });
      } else {
        items.push({ description: "Invoice", amount: entry.invoice_total });
      }
    }

    return { items, dpItems };
  };

  return {
    entries,
    isLoading,
    getDetailedItems,
  };
};
