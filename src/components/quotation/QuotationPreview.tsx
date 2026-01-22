import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phone, Mail, Globe } from "lucide-react";
import logoMkl from "@/assets/logo-mkl.png";

interface RateItem {
  no: number;
  description: string;
  lclRate: number | null;
  fcl20Rate: number | null;
  fcl40Rate: number | null;
}

interface QuotationPreviewProps {
  customerName: string;
  customerAddress: string;
  route: string;
  rates: RateItem[];
  greenLine: RateItem[];
  redLine: RateItem[];
  notes: string[];
}

const formatRupiah = (value: number | null): string => {
  if (value === null) return "-";
  return `IDR ${value.toLocaleString("id-ID")}`;
};

function PreviewTable({ 
  title, 
  titleClass, 
  items 
}: { 
  title: string; 
  titleClass: string; 
  items: RateItem[];
}) {
  return (
    <div className="mb-4">
      <h3 className={`font-bold text-sm mb-2 ${titleClass}`}>{title}</h3>
      <Table className="border">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10 text-xs py-1 h-auto">No</TableHead>
            <TableHead className="text-xs py-1 h-auto">Description</TableHead>
            <TableHead className="text-right text-xs py-1 h-auto w-24">1-5 CBM (LCL)</TableHead>
            <TableHead className="text-right text-xs py-1 h-auto w-24">20'</TableHead>
            <TableHead className="text-right text-xs py-1 h-auto w-24">40'</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.no}>
              <TableCell className="text-xs py-1">{item.no}</TableCell>
              <TableCell className="text-xs py-1">{item.description}</TableCell>
              <TableCell className="text-right text-xs py-1">{formatRupiah(item.lclRate)}</TableCell>
              <TableCell className="text-right text-xs py-1">{formatRupiah(item.fcl20Rate)}</TableCell>
              <TableCell className="text-right text-xs py-1">{formatRupiah(item.fcl40Rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Company letterhead info - fixed/permanent
const COMPANY_INFO = {
  name: "PT. Mulia Kasih Logistik",
  address: "Kawasan Berikat Nusantara (KBN) Jl. Pontianak Blok C 02/09A, Marunda, Cilincing, Jakarta Utara - 14120",
  phone: "(021) 38874030",
  email: "rudy@mkl-jakarta.com / info@mkl-jakarta.com",
  website: "www.mkl-jakarta.com",
};

export function QuotationPreview({
  customerName,
  customerAddress,
  route,
  rates,
  greenLine,
  redLine,
  notes,
}: QuotationPreviewProps) {
  return (
    <Card className="p-6 bg-white text-black max-w-4xl mx-auto shadow-lg">
      {/* Letterhead - Fixed */}
      <div className="border-b-2 border-primary pb-4 mb-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <img 
            src={logoMkl} 
            alt="PT. Mulia Kasih Logistik" 
            className="h-16 w-auto object-contain"
          />
          
          {/* Company Info */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary mb-1">
              {COMPANY_INFO.name}
            </h1>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {COMPANY_INFO.address}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {COMPANY_INFO.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {COMPANY_INFO.email}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {COMPANY_INFO.website}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wide">Penawaran Harga</h2>
        <p className="text-sm text-muted-foreground">Quotation</p>
      </div>

      {/* Customer Info */}
      <div className="mb-6 text-sm space-y-1 bg-muted/30 p-3 rounded-lg">
        {customerName && (
          <p><span className="font-medium">Kepada Yth:</span> {customerName}</p>
        )}
        {customerAddress && (
          <p><span className="font-medium">Alamat:</span> {customerAddress}</p>
        )}
        {route && (
          <p><span className="font-medium">Rute:</span> {route}</p>
        )}
      </div>

      {/* Rate Tables */}
      <PreviewTable title="RATES" titleClass="text-primary" items={rates} />
      <PreviewTable title="GREEN LINE" titleClass="text-success" items={greenLine} />
      <PreviewTable title="RED LINE" titleClass="text-destructive" items={redLine} />

      {/* Notes */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-sm mb-2">Catatan:</h4>
        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
          {notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>

      {/* Signatures */}
      <div className="mt-8 pt-4 flex justify-between text-sm">
        <div className="text-center">
          <p className="mb-16">Menyetujui,</p>
          <p className="font-medium border-t pt-2 min-w-32">
            {customerName || "___________________"}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-16">Dengan Hormat,</p>
          <p className="font-bold border-t pt-2">{COMPANY_INFO.name}</p>
        </div>
      </div>
    </Card>
  );
}

// Export company info for use in PDF generation
export { COMPANY_INFO };
