import { forwardRef } from "react";
import { InvoiceDP, InvoiceDPItem } from "@/hooks/useInvoiceDP";
import { terbilang } from "@/lib/numberToWords";
import kopSuratNew from "@/assets/kop-surat-mkl-new.jpg";

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
        className="bg-white text-black w-[210mm] h-[297mm] mx-auto overflow-hidden"
        style={{ 
          fontFamily: "Arial, sans-serif", 
          fontSize: "11px",
          padding: "8mm 10mm 10mm 10mm",
          boxSizing: "border-box",
        }}
      >
        {/* Header with Kop Surat - Professional Size */}
        <div className="mb-4 border-b-2 border-green-700 pb-3">
          <img
            src={kopSuratNew}
            alt="Kop Surat"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "22mm" }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-base font-bold tracking-wide" style={{ fontSize: "14px" }}>
            INVOICE DOWN PAYMENT
          </h1>
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold mt-1">
            Part {invoice.part_number}
          </div>
        </div>

        {/* Customer Info and Invoice Details - Compact Grid */}
        <div className="flex justify-between mb-3 pb-2 border-b border-gray-300">
          <div className="flex-1">
            <table className="text-xs" style={{ fontSize: "10px" }}>
              <tbody>
                <tr>
                  <td className="pr-2 text-gray-600">Kepada</td>
                  <td className="font-semibold">: {invoice.customer_name}</td>
                </tr>
                {invoice.customer_address && (
                  <tr>
                    <td className="pr-2 text-gray-600">Alamat</td>
                    <td>: {invoice.customer_address}</td>
                  </tr>
                )}
                {invoice.customer_city && (
                  <tr>
                    <td className="pr-2 text-gray-600">Kota</td>
                    <td>: {invoice.customer_city}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-right">
            <table className="text-xs ml-auto" style={{ fontSize: "10px" }}>
              <tbody>
                <tr>
                  <td className="pr-2 text-gray-600">Tanggal</td>
                  <td className="font-semibold">: {formatDate(invoice.invoice_date)}</td>
                </tr>
                <tr>
                  <td className="pr-2 text-gray-600">No. Invoice</td>
                  <td className="font-semibold">: {invoice.invoice_dp_number}</td>
                </tr>
                {invoice.bl_number && (
                  <tr>
                    <td className="pr-2 text-gray-600">BL No.</td>
                    <td>: {invoice.bl_number}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table - Compact */}
        <table className="w-full border-collapse mb-3" style={{ fontSize: "10px" }}>
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">
                Deskripsi
              </th>
              <th className="border border-gray-400 px-2 py-1.5 text-right w-32 font-semibold">
                Jumlah (IDR)
              </th>
              <th className="border border-gray-400 px-2 py-1.5 text-right w-24 font-semibold">
                (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.description && (
              <tr>
                <td
                  colSpan={3}
                  className="border border-gray-300 px-2 py-1.5 font-semibold bg-blue-50 text-blue-800"
                  style={{ fontSize: "10px" }}
                >
                  DP (Down Payment) {invoice.description}
                </td>
              </tr>
            )}
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-2 py-1.5">
                  {item.description}
                </td>
                <td className="border border-gray-300 px-2 py-1.5 text-right">
                  {formatRupiah(item.amount)}
                </td>
                <td className="border border-gray-300 px-2 py-1.5 text-right text-gray-400">
                  -
                </td>
              </tr>
            ))}
            {/* Add empty rows if needed to maintain consistent layout */}
            {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, index) => (
              <tr key={`empty-${index}`} className="bg-white">
                <td className="border border-gray-300 px-2 py-1.5">&nbsp;</td>
                <td className="border border-gray-300 px-2 py-1.5">&nbsp;</td>
                <td className="border border-gray-300 px-2 py-1.5">&nbsp;</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-800 text-white">
              <td className="border border-gray-400 px-2 py-2">TOTAL</td>
              <td className="border border-gray-400 px-2 py-2 text-right">
                {formatRupiah(invoice.total_amount)}
              </td>
              <td className="border border-gray-400 px-2 py-2 text-right">-</td>
            </tr>
          </tbody>
        </table>

        {/* Terbilang - Compact */}
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded" style={{ fontSize: "10px" }}>
          <p>
            <span className="font-semibold text-green-800">TERBILANG:</span>{" "}
            <span className="italic">{terbilang(invoice.total_amount)}</span>
          </p>
        </div>

        {/* Note - Compact */}
        <div className="mb-4 p-2 border border-yellow-300 rounded bg-yellow-50" style={{ fontSize: "9px" }}>
          <p className="font-semibold text-yellow-800 mb-1">Catatan:</p>
          <p className="text-gray-700 leading-tight">
            DP IMPORT NANTI DI KALKULASI DENGAN INVOICE TAGIHAN, KARENA DP HANYA
            BERSIFAT SEMENTARA BISA KURANG ATAUPUN LEBIH AKTUAL NANTI TERLAMPIR
            DI INVOICE TAGIHAN.
          </p>
        </div>

        {/* Bank Info & Signature Section - Compact */}
        <div className="flex justify-between items-start">
          {/* Bank Info */}
          <div className="p-2 bg-gray-100 rounded border border-gray-200" style={{ fontSize: "9px" }}>
            <p className="font-semibold text-gray-700 mb-1">Transfer ke:</p>
            <p className="font-bold">BANK BCA</p>
            <p>No. Rek: 6910492436</p>
            <p>A/N: RUDY SURIYANTO</p>
          </div>

          {/* Signature */}
          <div className="text-center" style={{ fontSize: "10px" }}>
            <p className="text-gray-600 mb-1">Hormat Kami,</p>
            <div className="h-12"></div>
            <p className="font-bold border-t border-gray-400 pt-1 px-4">
              PT MULIA KASIH LOGISTIK
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-200 text-center text-gray-500" style={{ fontSize: "8px" }}>
          <p>Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah.</p>
        </div>
      </div>
    );
  }
);

InvoiceDPPreview.displayName = "InvoiceDPPreview";
