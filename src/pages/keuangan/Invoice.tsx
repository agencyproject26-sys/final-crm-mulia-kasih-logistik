import { MainLayout } from "@/components/layout/MainLayout";
import { InvoicePageContent } from "@/components/invoice/InvoicePageContent";
import { useInvoices } from "@/hooks/useInvoices";

export default function InvoicePage() {
  return (
    <MainLayout title="INVOICE" subtitle="Kelola invoice pelanggan">
      <InvoicePageContent pageTitle="INVOICE" useInvoiceHook={useInvoices} />
    </MainLayout>
  );
}
