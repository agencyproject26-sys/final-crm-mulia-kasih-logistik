import { MainLayout } from "@/components/layout/MainLayout";
import { InvoicePageContent } from "@/components/invoice/InvoicePageContent";
import { useInvoices } from "@/hooks/useInvoices";

const INVOICE_DEFAULT_ITEMS = [
  { description: "Handling Dok Custom", amount: 0 },
  { description: "Pemotongan Quota & Form COO", amount: 300000 },
  { description: "ADM Document", amount: 200000 },
  { description: "Edi / PPJK", amount: 250000 },
];

export default function InvoicePage() {
  return (
    <MainLayout title="INVOICE" subtitle="Kelola invoice pelanggan">
      <InvoicePageContent pageTitle="INVOICE" useInvoiceHook={useInvoices} defaultItems={INVOICE_DEFAULT_ITEMS} />
    </MainLayout>
  );
}
