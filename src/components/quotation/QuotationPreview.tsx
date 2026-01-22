import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="mb-6">
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
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-primary">PT MULIA KASIH LOGISTIK</h1>
        <p className="text-sm text-muted-foreground">PENAWARAN HARGA / QUOTATION</p>
      </div>

      {/* Customer Info */}
      <div className="mb-6 text-sm space-y-1">
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
      <div className="mt-6 pt-4 border-t">
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
          <p className="font-bold border-t pt-2">PT MULIA KASIH LOGISTIK</p>
        </div>
      </div>
    </Card>
  );
}
