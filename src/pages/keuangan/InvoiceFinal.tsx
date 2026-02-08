import { MainLayout } from "@/components/layout/MainLayout";
import { InvoicePageContent } from "@/components/invoice/InvoicePageContent";
import { useInvoicesFinal } from "@/hooks/useInvoicesFinal";

const INVOICE_FINAL_DEFAULT_ITEMS = [
  { description: "Invoice Reimbursement", amount: 0 },
  { description: "Invoice", amount: 0 },
];

export default function InvoiceFinalPage() {
  return (
    <MainLayout title="INVOICE FINAL" subtitle="Kelola invoice final">
      <InvoicePageContent
        pageTitle="INVOICE FINAL"
        useInvoiceHook={useInvoicesFinal}
        defaultItems={INVOICE_FINAL_DEFAULT_ITEMS}
        enableFinalIntegration
      />
    </MainLayout>
  );
}
