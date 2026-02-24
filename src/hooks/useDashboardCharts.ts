import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export interface ShipmentChartData {
  month: string;
  totalOrders: number;
  selesai: number;
  proses: number;
  baru: number;
}

export interface FinanceChartData {
  month: string;
  pendapatan: number;
  pengeluaran: number;
  laba: number;
}

export interface TruckUtilData {
  id: string;
  plate: string;
  driver: string;
  type: string;
  status: string;
  activeJobCount: number;
}

export function useShipmentChartData() {
  return useQuery({
    queryKey: ["shipment-chart"],
    queryFn: async (): Promise<ShipmentChartData[]> => {
      const now = new Date();
      const year = now.getFullYear();
      const startOfYear = `${year}-01-01T00:00:00.000Z`;

      const { data, error } = await supabase
        .from("job_orders")
        .select("created_at, status")
        .is("deleted_at", null)
        .gte("created_at", startOfYear);

      if (error) throw error;

      const monthlyData: ShipmentChartData[] = MONTH_LABELS.map((label) => ({
        month: label,
        totalOrders: 0,
        selesai: 0,
        proses: 0,
        baru: 0,
      }));

      (data || []).forEach((jo) => {
        const monthIdx = new Date(jo.created_at).getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          monthlyData[monthIdx].totalOrders++;
          if (jo.status === "Selesai") monthlyData[monthIdx].selesai++;
          else if (jo.status === "Proses" || jo.status === "In Progress") monthlyData[monthIdx].proses++;
          else monthlyData[monthIdx].baru++;
        }
      });

      return monthlyData;
    },
  });
}

export function useFinanceChartData() {
  return useQuery({
    queryKey: ["finance-chart"],
    queryFn: async (): Promise<FinanceChartData[]> => {
      const now = new Date();
      const year = now.getFullYear();
      const startDate = `${year}-01-01`;

      const [invoicesRes, expensesRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("invoice_date, total_amount")
          .is("deleted_at", null)
          .gte("invoice_date", startDate),
        supabase
          .from("expenses")
          .select("expense_date, amount")
          .is("deleted_at", null)
          .gte("expense_date", startDate),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (expensesRes.error) throw expensesRes.error;

      const monthlyData: FinanceChartData[] = MONTH_LABELS.map((label) => ({
        month: label,
        pendapatan: 0,
        pengeluaran: 0,
        laba: 0,
      }));

      (invoicesRes.data || []).forEach((inv) => {
        const monthIdx = new Date(inv.invoice_date).getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          monthlyData[monthIdx].pendapatan += inv.total_amount || 0;
        }
      });

      (expensesRes.data || []).forEach((exp) => {
        const monthIdx = new Date(exp.expense_date).getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          monthlyData[monthIdx].pengeluaran += exp.amount || 0;
        }
      });

      monthlyData.forEach((m) => {
        m.laba = m.pendapatan - m.pengeluaran;
      });

      return monthlyData;
    },
  });
}

export function useTruckUtilData() {
  return useQuery({
    queryKey: ["truck-utilization"],
    queryFn: async (): Promise<TruckUtilData[]> => {
      const { data: trucks, error } = await supabase
        .from("trucks")
        .select("id, plate_number, driver_name, truck_type, status")
        .is("deleted_at", null)
        .order("plate_number");

      if (error) throw error;

      return (trucks || []).map((t) => ({
        id: t.id,
        plate: t.plate_number,
        driver: t.driver_name || "-",
        type: t.truck_type,
        status: t.status || "active",
        activeJobCount: 0,
      }));
    },
  });
}
