import { forwardRef } from "react";
import { Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { formatCurrency, terbilang } from "@/lib/numberToWords";
import { format } from "date-fns";
import kopSuratNew from "@/assets/kop-surat-mkl-new.jpg";

interface InvoicePreviewProps {
  invoice: Partial<Invoice> & {
    items: InvoiceItem[];
    signer_name?: string;
    dp_items?: { label: string; amount: number; date?: string }[];
    bank_account_name?: string;
    bank_account_number?: string;
    bank_branch?: string;
    reimbursement_remaining?: number | null;
  };
  title?: string;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, title = "INVOICE" }, ref) => {
    const formatDate = (date: string | null | undefined) => {
      if (!date) return "-";
      try {
        return format(new Date(date), "dd-MMM-yy");
      } catch {
        return "-";
      }
    };

    const totalAmount = invoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const downPayment = invoice.down_payment || 0;
    const reimbursementRemaining = invoice.reimbursement_remaining || 0;
    const remainingAmount = totalAmount + reimbursementRemaining - downPayment;

    return (
      <div
        ref={ref}
        className="bg-white p-8 max-w-[210mm] mx-auto text-black"
        style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}
      >
        {/* Header with Kop Surat - Full Width */}
        <div className="mb-4 border-b-2 border-green-700 pb-3">
          <img
            src={kopSuratNew}
            alt="Kop Surat"
            className="w-full h-auto object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* Title */}
        <h2 className="text-center font-bold text-lg mb-4 underline">{title}</h2>

        {/* Customer & Invoice Info */}
        <div className="flex justify-between mb-4">
          <div className="border border-black p-2 w-[55%]">
            <p className="font-bold">{invoice.customer_name || "NAMA PELANGGAN"}</p>
            <p>{invoice.customer_address || "ALAMAT"}</p>
            <p>{invoice.customer_city || "KOTA"}</p>
          </div>
          <div className="border border-black p-2 text-center">
            <p className="text-sm">No. AJU</p>
            <p className="font-bold">{invoice.no_aju || "-"}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="flex gap-2 mb-4">
          <div className="border border-black p-2 flex-1 text-center">
            <p className="text-sm font-bold">Tanggal</p>
            <p>{formatDate(invoice.invoice_date)}</p>
          </div>
          <div className="border border-black p-2 flex-1 text-center">
            <p className="text-sm font-bold">Number Inv.</p>
            <p>{invoice.invoice_number || "-"}</p>
          </div>
          <div className="border border-black p-2 flex-1 text-center">
            <p className="text-sm font-bold">B/L No.</p>
            <p>{invoice.bl_number || "-"}</p>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="border border-black mb-4">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="border-b border-r border-black p-1 w-28 font-bold">PARTY</td>
                <td className="border-b border-black p-1">{invoice.party || "-"}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1 font-bold">FLIGHT / VESSEL</td>
                <td className="border-b border-black p-1">{invoice.flight_vessel || "-"}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1 font-bold">From</td>
                <td className="border-b border-black p-1">{invoice.origin || "-"}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1 font-bold">NO. PEN</td>
                <td className="border-b border-black p-1">{invoice.no_pen || "-"}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1 font-bold">INVOICE NO.</td>
                <td className="border-b border-black p-1">{invoice.invoice_number || "-"}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-black p-1 font-bold">DESCRIPTION</td>
                <td className="border-b border-black p-1">{invoice.description || "-"}</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1 font-bold">DELIVERY</td>
                <td className="p-1">{formatDate(invoice.delivery_date)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Line Items */}
        <table className="w-full border border-black mb-4 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-r border-black p-2 text-left">Description</th>
              <th className="border-b border-black p-2 text-right w-32">(IDR)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index}>
              <td className="border-b border-r border-black p-2">{item.description}</td>
                <td className="border-b border-black p-2 text-right">Rp {item.amount.toLocaleString("id-ID").replace(/,/g, ".")}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="border-b border-r border-black p-2">TOTAL</td>
              <td className="border-b border-black p-2 text-right">Rp {totalAmount.toLocaleString("id-ID").replace(/,/g, ".")}</td>
            </tr>
          </tbody>
        </table>

        {/* Reimbursement Remaining (Sisa Invoice Reimbursement) */}
        {invoice.reimbursement_remaining != null && invoice.reimbursement_remaining !== 0 && (
          <div className="mb-4 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold">SISA INVOICE REIMBURSEMENT :</span>
              <div className="border border-black px-4 py-1">
                <span>Rp {invoice.reimbursement_remaining.toLocaleString("id-ID").replace(/,/g, ".")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Down Payment */}
        {invoice.dp_items && invoice.dp_items.length > 0 ? (
          <div className="mb-4 text-xs">
            {invoice.dp_items.map((dp, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <span className="font-bold">
                  {dp.label}{dp.date ? ` (${formatDate(dp.date)})` : ''} : {formatCurrency(dp.amount)}
                </span>
                <div className="border border-black px-4 py-1">
                  <span>Rp {dp.amount.toLocaleString("id-ID").replace(/,/g, ".")}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mb-1 mt-2 pt-1 border-t border-black">
              <span className="font-bold">TOTAL DP :</span>
              <div className="border border-black px-4 py-1">
                <span>Rp {downPayment.toLocaleString("id-ID").replace(/,/g, ".")}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">SISA INVOICE :</span>
              <div className="border border-black px-4 py-1">
                <span>Rp {remainingAmount.toLocaleString("id-ID").replace(/,/g, ".")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold">DOWN PAYMENT (DP) : NO DP</span>
              <div className="border border-black px-4 py-1">
                <span>Rp 0</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">SISA INVOICE :</span>
              <div className="border border-black px-4 py-1">
                <span>Rp {remainingAmount.toLocaleString("id-ID").replace(/,/g, ".")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terbilang */}
        <div className="mb-4">
          <p className="font-bold text-red-600 text-xs">TERBILANG : {terbilang(remainingAmount)}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-between mb-4">
          <div className="text-xs">
            <p className="font-bold">Enclosure :</p>
            <p>All cheques be crossed and made payable to MULIA KASIH LOGISTIK</p>
            <p>Interest at 1%per month will be charged on overdue account.</p>
            <p>Any complaints/disputes regarding this invoice should be lodged within</p>
            <p>1 days from date of invoice.</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm">PT. MULIA KASIH LOGISTIK</p>
            <div className="h-28 flex items-center justify-center">
              {/* Space for materai + tanda tangan */}
              <div className="w-[25mm] h-[25mm] border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs">
                MATERAI
              </div>
            </div>
            <p className="font-bold mt-2 border-t border-black pt-1">{invoice.signer_name || "RUDY SURIYANTO"}</p>
          </div>
        </div>

        {/* Bank Account */}
        <div className="border-2 border-black p-2 text-center text-sm">
          <p className="font-bold">Acc.</p>
          <p className="font-bold">{invoice.bank_account_name || "PT. MULIA KASIH LOGISTIK"}</p>
          <p className="font-bold">{invoice.bank_account_number || "6910492436"} / {invoice.bank_branch || "BANK BCA CAB. YOS SUDARSO"}</p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
