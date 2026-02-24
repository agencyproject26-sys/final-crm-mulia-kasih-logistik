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
  totalTrackings: number;

  // Quotation stats
  totalQuotations: number;
  activeQuotations: number;

  // Expense stats
  totalExpenses: number;
  monthlyExpenses: number;

  // Truck stats
  totalTrucks: number;
  availableTrucks: number;
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

export type DashboardPeriod = "today" | "week" | "month" | "all";

function getPeriodStart(period: DashboardPeriod): string | null {
  const now = new Date();
  switch (period) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return start.toISOString();
    }
    case "week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.getFullYear(), now.getMonth(), diff);
      return start.toISOString();
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return start.toISOString();
    }
    case "all":
      return null;
  }
}

export function useDashboardStats(period: DashboardPeriod = "all") {
  return useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodStart = getPeriodStart(period);
      
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
        quotationsResult,
        expensesResult,
        trucksResult,
      ] = await Promise.all([
        // Total customers
        supabase.from("customers").select("id", { count: "exact", head: true }).is("deleted_at", null),
        
        // Job orders - apply period filter
        periodStart 
          ? supabase.from("job_orders").select("id, status", { count: "exact" }).is("deleted_at", null).gte("created_at", periodStart)
          : supabase.from("job_orders").select("id, status", { count: "exact" }).is("deleted_at", null),
        
        // Completed this month
        supabase.from("job_orders")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("status", "Selesai")
          .gte("updated_at", startOfMonth),
        
        // Invoices - apply period filter
        periodStart
          ? supabase.from("invoices").select("id, status, total_amount, remaining_amount").is("deleted_at", null).gte("invoice_date", periodStart.split("T")[0])
          : supabase.from("invoices").select("id, status, total_amount, remaining_amount").is("deleted_at", null),
        
        // Invoice DP - apply period filter
        periodStart
          ? supabase.from("invoice_dp").select("id, status, total_amount").is("deleted_at", null).gte("invoice_date", periodStart.split("T")[0])
          : supabase.from("invoice_dp").select("id, status, total_amount").is("deleted_at", null),
        
        // Warehouses
        supabase.from("warehouses").select("id, cbm, quantity, status").is("deleted_at", null),
        
        // Vendors
        supabase.from("vendors").select("id", { count: "exact", head: true }).is("deleted_at", null),
        
        // Trackings - apply period filter
        periodStart
          ? supabase.from("trackings").select("id, status", { count: "exact" }).is("deleted_at", null).gte("created_at", periodStart)
          : supabase.from("trackings").select("id, status", { count: "exact" }).is("deleted_at", null),

        // Quotations - apply period filter
        periodStart
          ? supabase.from("quotations").select("id, status", { count: "exact" }).is("deleted_at", null).gte("created_at", periodStart)
          : supabase.from("quotations").select("id, status", { count: "exact" }).is("deleted_at", null),

        // Expenses - apply period filter
        periodStart
          ? supabase.from("expenses").select("id, amount, expense_date").is("deleted_at", null).gte("expense_date", periodStart.split("T")[0])
          : supabase.from("expenses").select("id, amount, expense_date").is("deleted_at", null),

        // Trucks
        supabase.from("trucks").select("id, status", { count: "exact" }).is("deleted_at", null),
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

      // Process quotations
      const quotations = quotationsResult.data || [];
      const activeQuotations = quotations.filter(q => 
        q.status && !["Ditolak", "Rejected", "Expired"].includes(q.status)
      ).length;

      // Process expenses
      const expenses = expensesResult.data || [];
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyExpenses = expenses
        .filter(e => e.expense_date >= startOfMonth)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      // Process trucks
      const trucks = trucksResult.data || [];
      const availableTrucks = trucks.filter(t => 
        t.status === "Tersedia" || t.status === "Available"
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
        totalTrackings: trackings.length,
        totalQuotations: quotations.length,
        activeQuotations,
        totalExpenses,
        monthlyExpenses,
        totalTrucks: trucks.length,
        availableTrucks,
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
        .is("deleted_at", null)
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
        .is("deleted_at", null)
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
        .select("id, cbm, quantity, status")
        .is("deleted_at", null);

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
