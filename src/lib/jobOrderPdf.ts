import jsPDF from "jspdf";
import { JobOrder } from "@/hooks/useJobOrders";

// Company letterhead info - fixed/permanent
const COMPANY_INFO = {
  name: "PT. Mulia Kasih Logistik",
  address: "Kawasan Berikat Nusantara (KBN) Jl. Pontianak Blok C 02/09A, Marunda, Cilincing, Jakarta Utara - 14120",
  phone: "(021) 38874030",
  email: "rudy@mkl-jakarta.com / info@mkl-jakarta.com",
  website: "www.mkl-jakarta.com",
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const drawLetterhead = (doc: jsPDF, margin: number, pageWidth: number): number => {
  let y = 15;

  // Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(COMPANY_INFO.name, margin, y);
  y += 6;

  // Address
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const addressLines = doc.splitTextToSize(COMPANY_INFO.address, pageWidth - margin * 2);
  doc.text(addressLines, margin, y);
  y += addressLines.length * 3.5;

  // Contact Info
  doc.setFontSize(8);
  doc.text(`Phone: ${COMPANY_INFO.phone}`, margin, y);
  y += 4;
  doc.text(`E-mail: ${COMPANY_INFO.email}`, margin, y);
  y += 4;
  doc.text(`Web: ${COMPANY_INFO.website}`, margin, y);
  y += 6;

  // Letterhead separator line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  return y;
};

const drawInfoRow = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number = 35
): void => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`: ${value}`, x + labelWidth, y);
};

export type InvoiceType = "penumpukan" | "do" | "behandle";

interface InvoiceConfig {
  title: string;
  subtitle: string;
  color: { r: number; g: number; b: number };
}

const invoiceConfigs: Record<InvoiceType, InvoiceConfig> = {
  penumpukan: {
    title: "INVOICE PENUMPUKAN",
    subtitle: "Biaya Penumpukan Container",
    color: { r: 30, g: 58, b: 138 },
  },
  do: {
    title: "INVOICE DO",
    subtitle: "Delivery Order",
    color: { r: 34, g: 139, b: 34 },
  },
  behandle: {
    title: "INVOICE BEHANDLE",
    subtitle: "Biaya Behandle / Pemeriksaan",
    color: { r: 220, g: 38, b: 38 },
  },
};

export const generateJobOrderInvoicePdf = (
  jobOrder: JobOrder,
  invoiceType: InvoiceType
): void => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const config = invoiceConfigs[invoiceType];

  // Draw letterhead
  let y = drawLetterhead(doc, margin, pageWidth);

  // Invoice Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.color.r, config.color.g, config.color.b);
  doc.text(config.title, pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(config.subtitle, pageWidth / 2, y, { align: "center" });
  y += 12;

  // Invoice Info Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 3, 3, "FD");
  y += 8;

  const col1X = margin + 5;
  const col2X = pageWidth / 2 + 5;
  const rowHeight = 7;

  // Left column
  drawInfoRow(doc, "No. Job Order", jobOrder.job_order_number, col1X, y);
  drawInfoRow(doc, "No. Invoice", jobOrder.no_invoice || "-", col2X, y);
  y += rowHeight;

  drawInfoRow(doc, "BL Number", jobOrder.bl_number || "-", col1X, y);
  drawInfoRow(doc, "AJU", jobOrder.aju || "-", col2X, y);
  y += rowHeight;

  drawInfoRow(doc, "Party", jobOrder.party || "-", col1X, y);
  drawInfoRow(doc, "ETA Kapal", formatDate(jobOrder.eta_kapal), col2X, y);
  y += rowHeight;

  drawInfoRow(doc, "Lokasi", jobOrder.lokasi || "-", col1X, y);
  drawInfoRow(doc, "Tujuan", jobOrder.tujuan || "-", col2X, y);
  y += rowHeight;

  drawInfoRow(doc, "Status DO", jobOrder.status_do || "-", col1X, y);
  drawInfoRow(doc, "Pembayaran DO", jobOrder.pembayaran_do || "-", col2X, y);
  y += rowHeight;

  drawInfoRow(doc, "Exp DO", formatDate(jobOrder.exp_do), col1X, y);
  drawInfoRow(doc, "Status BL", jobOrder.status_bl || "-", col2X, y);
  y += 15;

  // Customer Info
  if (jobOrder.customer_name) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Customer:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(jobOrder.customer_name, margin + 25, y);
    y += 7;
  }

  // Respond BC
  if (jobOrder.respond_bc) {
    doc.setFont("helvetica", "bold");
    doc.text("Respond BC:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(jobOrder.respond_bc, margin + 25, y);
    y += 7;
  }

  // Notes
  if (jobOrder.notes) {
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Catatan:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(jobOrder.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4;
  }

  // Footer/Signature area
  y = Math.max(y + 20, 220);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  // Date
  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Jakarta, ${today}`, pageWidth - margin - 50, y);
  y += 25;

  // Signature
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, pageWidth - margin - 50, y);

  // Save PDF
  const fileName = `${config.title.replace(/\s+/g, "_")}_${jobOrder.job_order_number}.pdf`;
  doc.save(fileName);
};
