import { AlertCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOutstandingInvoices } from "@/hooks/useDashboardStats";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function OutstandingInvoices() {
  const { data: invoices, isLoading } = useOutstandingInvoices(5);

  const totalOutstanding = invoices?.reduce((sum, inv) => sum + (inv.remaining_amount || 0), 0) || 0;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Invoice Outstanding</h3>
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-destructive">{formatRupiah(totalOutstanding)}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary" asChild>
          <Link to="/keuangan/invoice">
            Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices && invoices.length > 0 ? (
          invoices.map((invoice) => {
            const daysOverdue = differenceInDays(new Date(), new Date(invoice.invoice_date));
            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{invoice.invoice_number}</p>
                    {daysOverdue > 0 && (
                      <span className={cn(
                        "status-badge",
                        daysOverdue > 30 ? "status-badge-destructive" : "status-badge-warning"
                      )}>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysOverdue} hari
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatRupiah(invoice.remaining_amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Tgl: {format(new Date(invoice.invoice_date), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Tidak ada invoice outstanding
          </div>
        )}
      </div>
    </div>
  );
}
