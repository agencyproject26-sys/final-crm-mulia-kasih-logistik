import { forwardRef } from "react";
import { InvoiceDP, InvoiceDPItem } from "@/hooks/useInvoiceDP";
import { terbilang } from "@/lib/numberToWords";
import kopSuratFull from "@/assets/kop-surat-mkl-full.jpg";

interface InvoiceDPPreviewProps {
  invoice: InvoiceDP & { items?: InvoiceDPItem[] };
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export const InvoiceDPPreview = forwardRef<HTMLDivElement, InvoiceDPPreviewProps>(
  ({ invoice }, ref) => {
    const items = invoice.items || [];

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto"
        style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}
      >
        {/* Header with Kop Surat */}
        <div className="mb-6">
          <img
            src={kopSuratFull}
            alt="Kop Surat"
            className="w-full h-auto"
            crossOrigin="anonymous"
          />
        </div>

        {/* Customer Info and Invoice Details */}
        <div className="flex justify-between mb-6">
          <div className="flex-1">
            <p className="font-bold">{invoice.customer_name}</p>
            {invoice.customer_address && <p>{invoice.customer_address}</p>}
            {invoice.customer_city && <p>{invoice.customer_city}</p>}
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(invoice.invoice_date)}
            </p>
            <p className="mt-2">
              <span className="font-semibold">No Invoice DP:</span>{" "}
              {invoice.invoice_dp_number}
            </p>
            {invoice.bl_number && (
              <p className="mt-2">
                <span className="font-semibold">BL/ No.:</span>{" "}
                {invoice.bl_number}
              </p>
            )}
          </div>
        </div>

        {/* Part Badge */}
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            Part {invoice.part_number}
          </span>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">
                Description
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right w-40">
                (IDR)
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right w-32">
                (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.description && (
              <tr>
                <td
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50"
                >
                  DP (down payment) {invoice.description}
                </td>
              </tr>
            )}
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-2">
                  {item.description}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatRupiah(item.amount)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  -
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-100">
              <td className="border border-gray-300 px-3 py-2">TOTAL :</td>
              <td className="border border-gray-300 px-3 py-2 text-right">
                {formatRupiah(invoice.total_amount)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-right">-</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
          <p>
            <span className="font-semibold">TERBILANG:</span>{" "}
            {terbilang(invoice.total_amount)}
          </p>
        </div>

        {/* Note */}
        <div className="mb-8 p-4 border border-gray-300 rounded bg-yellow-50">
          <p className="font-semibold mb-2">Note:</p>
          <p className="text-sm italic text-gray-700">
            PT. MULIA KASIH LOGISTIK
          </p>
          <p className="text-sm mt-2">
            DP IMPORT NANTI DI KALKULASI DENGAN INVOICE TAGIHAN, KARENA DP HANYA
            BERSIFAT SEMENTARA BISA KURANG ATAUPUN LEBIH AKTUAL NANTI TERLAMPIR
            DI INVOICE TAGIHAN.
          </p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-end">
          <div className="text-center">
            <p className="font-semibold mb-16">Acc.</p>
            <p className="font-bold">PT MULIA KASIH LOGISTIK</p>
            <p className="text-sm mt-2">6910492436/ BANK BCA RUDY SURIYANTO</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceDPPreview.displayName = "InvoiceDPPreview";
