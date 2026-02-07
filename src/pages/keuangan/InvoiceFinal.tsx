import { MainLayout } from "@/components/layout/MainLayout";
import { InvoicePageContent } from "@/components/invoice/InvoicePageContent";
import { useInvoicesFinal } from "@/hooks/useInvoicesFinal";

export default function InvoiceFinalPage() {
  return (
    <MainLayout title="INVOICE FINAL" subtitle="Kelola invoice final">
      <InvoicePageContent pageTitle="INVOICE FINAL" useInvoiceHook={useInvoicesFinal} />
    </MainLayout>
  );
}
