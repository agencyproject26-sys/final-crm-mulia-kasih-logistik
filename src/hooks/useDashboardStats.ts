import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  // Customer stats
  totalCustomers: number;
  
  // Job Order stats
  activeOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  completedThisMonth: number;
  
  // Invoice stats
  outstandingAmount: number;
  outstandingCount: number;
  monthlyRevenue: number;
  
  // Invoice DP stats
  totalInvoiceDPAmount: number;
  paidInvoiceDPAmount: number;
  
  // Warehouse stats
  totalWarehouseItems: number;
  totalCBM: number;
  
  // Vendor stats
  totalVendors: number;
  
  // Tracking stats
  activeTrackings: number;
}

export interface RecentOrder {
  id: string;
  job_order_number: string;
  customer_name: string | null;
  lokasi: string | null;
  tujuan: string | null;
  status: string | null;
  created_at: string;
}

export interface OutstandingInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  remaining_amount: number;
  invoice_date: string;
  status: string | null;
}

export interface WarehouseData {
  totalItems: number;
  totalCBM: number;
  activeItems: number;
  inactiveItems: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Fetch all data in parallel
      const [
        customersResult,
        jobOrdersResult,
        completedThisMonthResult,
        invoicesResult,
        invoiceDPResult,
        warehousesResult,
        vendorsResult,
        trackingsResult,
      ] = await Promise.all([
        // Total customers
        supabase.from("customers").select("id", { count: "exact", head: true }),
        
        // Job orders with different statuses
        supabase.from("job_orders").select("id, status", { count: "exact" }),
        
        // Completed this month
        supabase.from("job_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "Selesai")
          .gte("updated_at", startOfMonth),
        
        // Invoices
        supabase.from("invoices").select("id, status, total_amount, remaining_amount"),
        
        // Invoice DP
        supabase.from("invoice_dp").select("id, status, total_amount"),
        
        // Warehouses
        supabase.from("warehouses").select("id, cbm, quantity, status"),
        
        // Vendors
        supabase.from("vendors").select("id", { count: "exact", head: true }),
        
        // Trackings
        supabase.from("trackings").select("id, status", { count: "exact" }),
      ]);

      // Process job orders
      const jobOrders = jobOrdersResult.data || [];
      const activeOrders = jobOrders.filter(jo => 
        jo.status && !["Selesai", "Cancelled", "Dibatalkan"].includes(jo.status)
      ).length;
      const inProgressOrders = jobOrders.filter(jo => 
        jo.status === "Proses" || jo.status === "In Progress"
      ).length;
      const completedOrders = jobOrders.filter(jo => 
        jo.status === "Selesai"
      ).length;

      // Process invoices
      const invoices = invoicesResult.data || [];
      const outstandingInvoices = invoices.filter(inv => 
        inv.status !== "Lunas" && inv.remaining_amount > 0
      );
      const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + (inv.remaining_amount || 0), 0);
      const monthlyRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      // Process Invoice DP
      const invoiceDPs = invoiceDPResult.data || [];
      const totalInvoiceDPAmount = invoiceDPs.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const paidInvoiceDPAmount = invoiceDPs
        .filter(inv => inv.status === "Lunas")
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

      // Process warehouses
      const warehouses = warehousesResult.data || [];
      const totalCBM = warehouses.reduce((sum, w) => sum + (w.cbm || 0), 0);

      // Process trackings
      const trackings = trackingsResult.data || [];
      const activeTrackings = trackings.filter(t => 
        t.status && !["Selesai", "Completed"].includes(t.status)
      ).length;

      return {
        totalCustomers: customersResult.count || 0,
        activeOrders,
        inProgressOrders,
        completedOrders,
        completedThisMonth: completedThisMonthResult.count || 0,
        outstandingAmount,
        outstandingCount: outstandingInvoices.length,
        monthlyRevenue,
        totalInvoiceDPAmount,
        paidInvoiceDPAmount,
        totalWarehouseItems: warehouses.length,
        totalCBM,
        totalVendors: vendorsResult.count || 0,
        activeTrackings,
      };
    },
  });
}

export function useRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: ["recent-orders", limit],
    queryFn: async (): Promise<RecentOrder[]> => {
      const { data, error } = await supabase
        .from("job_orders")
        .select("id, job_order_number, customer_name, lokasi, tujuan, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useOutstandingInvoices(limit: number = 5) {
  return useQuery({
    queryKey: ["outstanding-invoices", limit],
    queryFn: async (): Promise<OutstandingInvoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, customer_name, remaining_amount, invoice_date, status")
        .neq("status", "Lunas")
        .gt("remaining_amount", 0)
        .order("invoice_date", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useWarehouseStats() {
  return useQuery({
    queryKey: ["warehouse-stats"],
    queryFn: async (): Promise<WarehouseData> => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("id, cbm, quantity, status");

      if (error) throw error;
      
      const warehouses = data || [];
      const activeItems = warehouses.filter(w => w.status === "Aktif" || w.status === "Active").length;
      const inactiveItems = warehouses.length - activeItems;
      const totalCBM = warehouses.reduce((sum, w) => sum + (w.cbm || 0), 0);

      return {
        totalItems: warehouses.length,
        totalCBM,
        activeItems,
        inactiveItems,
      };
    },
  });
}
