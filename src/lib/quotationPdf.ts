import jsPDF from "jspdf";

interface RateItem {
  no: number;
  description: string;
  lclRate: number | null;
  fcl20Rate: number | null;
  fcl40Rate: number | null;
}

interface QuotationData {
  quotationNumber?: string;
  customerName: string;
  customerAddress: string;
  route: string;
  rates: RateItem[];
  greenLine: RateItem[];
  redLine: RateItem[];
  notes: string[];
}

// Company letterhead info - fixed/permanent
const COMPANY_INFO = {
  name: "PT. Mulia Kasih Logistik",
  address: "Kawasan Berikat Nusantara (KBN) Jl. Pontianak Blok C 02/09A, Marunda, Cilincing, Jakarta Utara - 14120",
  phone: "(021) 38874030",
  email: "rudy@mkl-jakarta.com / info@mkl-jakarta.com",
  website: "www.mkl-jakarta.com",
};

const formatRupiah = (value: number | null): string => {
  if (value === null) return "-";
  return `IDR ${value.toLocaleString("id-ID")}`;
};

export const generateQuotationPdf = (data: QuotationData): void => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // ===== LETTERHEAD (Fixed) =====
  // Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // Primary blue color
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

  // ===== DOCUMENT TITLE =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("PENAWARAN HARGA", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Quotation", pageWidth / 2, y, { align: "center" });
  y += 8;

  // Quotation Number
  if (data.quotationNumber) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`No: ${data.quotationNumber}`, pageWidth / 2, y, { align: "center" });
    y += 8;
  } else {
    y += 2;
  }

  // ===== CUSTOMER INFO =====
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  if (data.customerName) {
    doc.setFont("helvetica", "bold");
    doc.text("Kepada Yth:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.customerName, margin + 25, y);
    y += 5;
  }
  if (data.customerAddress) {
    doc.setFont("helvetica", "bold");
    doc.text("Alamat:", margin, y);
    doc.setFont("helvetica", "normal");
    const addrLines = doc.splitTextToSize(data.customerAddress, pageWidth - margin * 2 - 25);
    doc.text(addrLines, margin + 25, y);
    y += addrLines.length * 5;
  }
  if (data.route) {
    doc.setFont("helvetica", "bold");
    doc.text("Rute:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.route, margin + 25, y);
    y += 5;
  }
  y += 5;

  // Helper function to draw table
  const drawTable = (
    title: string,
    titleColor: { r: number; g: number; b: number },
    items: RateItem[],
    startY: number
  ): number => {
    const colWidths = [10, 80, 30, 30, 30];
    const rowHeight = 7;
    let currentY = startY;

    // Title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text(title, margin, currentY);
    currentY += 6;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    let x = margin;
    doc.text("No", x + 2, currentY + 5);
    x += colWidths[0];
    doc.text("Description", x + 2, currentY + 5);
    x += colWidths[1];
    doc.text("1-5 CBM (LCL)", x + 2, currentY + 5);
    x += colWidths[2];
    doc.text("20'", x + 2, currentY + 5);
    x += colWidths[3];
    doc.text("40'", x + 2, currentY + 5);

    currentY += rowHeight;

    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
      }

      // Draw border
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight);

      x = margin;
      doc.text(String(item.no), x + 2, currentY + 5);
      x += colWidths[0];

      // Truncate description if too long
      const desc = item.description.length > 45 ? item.description.substring(0, 42) + "..." : item.description;
      doc.text(desc, x + 2, currentY + 5);
      x += colWidths[1];

      doc.text(formatRupiah(item.lclRate), x + 2, currentY + 5);
      x += colWidths[2];
      doc.text(formatRupiah(item.fcl20Rate), x + 2, currentY + 5);
      x += colWidths[3];
      doc.text(formatRupiah(item.fcl40Rate), x + 2, currentY + 5);

      currentY += rowHeight;
    });

    return currentY + 6;
  };

  // Draw RATES table
  y = drawTable("RATES", { r: 30, g: 58, b: 138 }, data.rates, y);

  // Check for page break
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Draw GREEN LINE table
  y = drawTable("GREEN LINE", { r: 34, g: 197, b: 94 }, data.greenLine, y);

  // Check for page break
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Draw RED LINE table
  y = drawTable("RED LINE", { r: 220, g: 38, b: 38 }, data.redLine, y);

  // Notes section
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 3;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Catatan:", margin, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  data.notes.forEach((note) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const lines = doc.splitTextToSize(`• ${note}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4;
  });

  // Signature section
  y += 12;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  // Left signature
  doc.text("Menyetujui,", margin, y);
  doc.text(data.customerName || "___________________", margin, y + 25);

  // Right signature
  doc.text("Dengan Hormat,", pageWidth - margin - 55, y);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, pageWidth - margin - 55, y + 25);

  // Save PDF with quotation number in filename
  const quotationPart = data.quotationNumber ? `_${data.quotationNumber.replace(/[/\\:*?"<>|]/g, "_")}` : "";
  const customerPart = data.customerName ? `_${data.customerName.replace(/\s+/g, "_")}` : "";
  const fileName = `Penawaran${quotationPart}${customerPart}.pdf`;
  doc.save(fileName);
};
