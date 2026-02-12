import { MainLayout } from "@/components/layout/MainLayout";
import { InvoiceFinalAutoViewContent } from "@/components/invoice/InvoiceFinalAutoView";

export default function InvoiceFinalPage() {
  return (
    <MainLayout title="INVOICE FINAL" subtitle="Tampilan otomatis gabungan Invoice Reimbursement & Invoice">
      <InvoiceFinalAutoViewContent />
    </MainLayout>
  );
}
