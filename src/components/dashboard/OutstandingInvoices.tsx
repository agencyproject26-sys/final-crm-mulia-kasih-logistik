import { AlertCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

const invoices: Invoice[] = [
  { id: "INV-2024-089", customer: "PT Maju Bersama", amount: 45000000, dueDate: "15 Jan 2026", daysOverdue: 3 },
  { id: "INV-2024-082", customer: "CV Sejahtera", amount: 28500000, dueDate: "12 Jan 2026", daysOverdue: 6 },
  { id: "INV-2024-078", customer: "PT Global Trade", amount: 67000000, dueDate: "10 Jan 2026", daysOverdue: 8 },
  { id: "INV-2024-075", customer: "PT Indo Cargo", amount: 32000000, dueDate: "08 Jan 2026", daysOverdue: 10 },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function OutstandingInvoices() {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amount, 0);

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
        <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary">
          Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="divide-y divide-border">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{invoice.id}</p>
                <span className={cn(
                  "status-badge",
                  invoice.daysOverdue > 7 ? "status-badge-destructive" : "status-badge-warning"
                )}>
                  <Clock className="h-3 w-3 mr-1" />
                  {invoice.daysOverdue} hari
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{invoice.customer}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{formatRupiah(invoice.amount)}</p>
              <p className="text-xs text-muted-foreground">Jatuh tempo: {invoice.dueDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
