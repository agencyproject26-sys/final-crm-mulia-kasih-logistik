import { MainLayout } from "@/components/layout/MainLayout";
import { InvoicePageContent } from "@/components/invoice/InvoicePageContent";
import { useInvoicesReimbursement } from "@/hooks/useInvoicesReimbursement";

export default function InvoiceReimbursementPage() {
  return (
    <MainLayout title="INVOICE REIMBURSEMENT" subtitle="Kelola invoice reimbursement">
      <InvoicePageContent pageTitle="INVOICE REIMBURSEMENT" useInvoiceHook={useInvoicesReimbursement} showSeparateCostItems />
    </MainLayout>
  );
}
