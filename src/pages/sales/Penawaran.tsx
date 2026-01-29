import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Send, Download, Search, FileDown, Loader2, MoreHorizontal, Pencil, Trash2, Eye, Check, ChevronsUpDown, UserPlus, X, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateQuotationPdf } from "@/lib/quotationPdf";
import { toast } from "sonner";
import { useQuotations, QuotationInput } from "@/hooks/useQuotations";
import { useCustomers } from "@/hooks/useCustomers";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { QuotationPreview } from "@/components/quotation/QuotationPreview";

interface RateItem {
  no: number;
  description: string;
  lclRate: number | null;
  fcl20Rate: number | null;
  fcl40Rate: number | null;
}

interface QuotationForm {
  customerId: string | null;
  customerName: string;
  customerAddress: string;
  route: string;
  rates: RateItem[];
  greenLine: RateItem[];
  redLine: RateItem[];
  notes: string[];
}

const defaultRates: RateItem[] = [
  { no: 1, description: "TRUCKING (FCL) (Tanjung Priok - Bandung)", lclRate: 3000000, fcl20Rate: 4400000, fcl40Rate: 4500000 },
  { no: 2, description: "THC / DELIVERY ORDER (DO)", lclRate: null, fcl20Rate: null, fcl40Rate: null },
  { no: 3, description: "LIFT OFF/LIFT ON", lclRate: null, fcl20Rate: null, fcl40Rate: null },
  { no: 4, description: "REPAIR", lclRate: null, fcl20Rate: null, fcl40Rate: null },
  { no: 5, description: "PENUMPUKAN", lclRate: null, fcl20Rate: null, fcl40Rate: null },
  { no: 6, description: "Next CBM", lclRate: 100000, fcl20Rate: null, fcl40Rate: null },
  { no: 7, description: "BIAYA BONGKAR", lclRate: 100000, fcl20Rate: 100000, fcl40Rate: 100000 },
  { no: 8, description: "KAWALAN", lclRate: 100000, fcl20Rate: 100000, fcl40Rate: 100000 },
];

const defaultGreenLine: RateItem[] = [
  { no: 1, description: "TRANSFER EDI / PPJK", lclRate: 250000, fcl20Rate: 250000, fcl40Rate: 250000 },
  { no: 2, description: "CUSTOMS CLEARANCE", lclRate: null, fcl20Rate: 1000000, fcl40Rate: 1000000 },
  { no: 3, description: "CUSTOMS CLEARANCE LCL 1 - 3 CBM", lclRate: 800000, fcl20Rate: null, fcl40Rate: null },
  { no: 4, description: "NEXT", lclRate: 100000, fcl20Rate: null, fcl40Rate: null },
  { no: 5, description: "ADM", lclRate: 200000, fcl20Rate: 200000, fcl40Rate: 200000 },
  { no: 6, description: "Pemotongan Quota, Analising Poin, SKEP", lclRate: 300000, fcl20Rate: 300000, fcl40Rate: 300000 },
];

const defaultRedLine: RateItem[] = [
  { no: 1, description: "TRANSFER EDI / PPJK", lclRate: 250000, fcl20Rate: 250000, fcl40Rate: 250000 },
  { no: 2, description: "Periksa Fisik / Behandle (FCL)", lclRate: null, fcl20Rate: 1000000, fcl40Rate: 1000000 },
  { no: 3, description: "Periksa Fisik / Behandle (LCL) 1-3 CBM", lclRate: 800000, fcl20Rate: null, fcl40Rate: null },
  { no: 4, description: "Handling Customs Clearance", lclRate: 800000, fcl20Rate: 1000000, fcl40Rate: 1000000 },
  { no: 5, description: "NEXT CBM", lclRate: 100000, fcl20Rate: null, fcl40Rate: null },
  { no: 6, description: "Pemotongan Quota, Analising Poin, SKEP", lclRate: 300000, fcl20Rate: 300000, fcl40Rate: 300000 },
  { no: 7, description: "PJM Dokument / Pemeriksaan Dokumen jalur merah", lclRate: 800000, fcl20Rate: 800000, fcl40Rate: 800000 },
  { no: 8, description: "ADM", lclRate: 200000, fcl20Rate: 200000, fcl40Rate: 200000 },
];

const defaultNotes = [
  "Pajak Import, SPTNP (BM, PDRI, ADM BANK) dibayarkan oleh Importir.",
  "Penumpukan, Gerakan Behandle, Repair, Lift Off, Delivery Order, DLL (Ditagihkan sesuai Kwitansi/Invoice Pihak Ketiga).",
  "Dokumen dan barang harus sesuai (apabila dokumen dan barang tidak sesuai akan menjadi tanggung jawab pemilik barang).",
  "Apabila ada biaya Undertable atau biaya yang timbul sehubungan dengan penentuan Harga/Jenis/Tarif pos dan tentang kelengkapan dokumen akan dinegosiasikan terlebih dahulu sesuai kesepakatan dan menjadi beban Pemilik barang / Importer.",
];

interface RateTableProps {
  title: string;
  titleColor: string;
  items: RateItem[];
  onUpdate: (index: number, field: keyof RateItem, value: number | null | string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

function RateTable({ title, titleColor, items, onUpdate, onAddRow, onRemoveRow }: RateTableProps) {
  const handleValueChange = (index: number, field: keyof RateItem, value: string) => {
    if (field === "description") {
      onUpdate(index, field, value);
    } else {
      const numValue = value === "" || value === "-" ? null : parseInt(value.replace(/\D/g, ""), 10);
      onUpdate(index, field, numValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg ${titleColor}`}>{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAddRow}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Baris
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-right w-32">1-5 CBM (LCL)</TableHead>
            <TableHead className="text-right w-32">20'</TableHead>
            <TableHead className="text-right w-32">40'</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${title}-${index}`}>
              <TableCell className="font-medium">{item.no}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleValueChange(index, "description", e.target.value)}
                  placeholder="Masukkan deskripsi..."
                  className="h-8"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="text"
                  value={item.lclRate === null ? "-" : item.lclRate.toLocaleString("id-ID")}
                  onChange={(e) => handleValueChange(index, "lclRate", e.target.value)}
                  className="text-right h-8 w-28"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="text"
                  value={item.fcl20Rate === null ? "-" : item.fcl20Rate.toLocaleString("id-ID")}
                  onChange={(e) => handleValueChange(index, "fcl20Rate", e.target.value)}
                  className="text-right h-8 w-28"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="text"
                  value={item.fcl40Rate === null ? "-" : item.fcl40Rate.toLocaleString("id-ID")}
                  onChange={(e) => handleValueChange(index, "fcl40Rate", e.target.value)}
                  className="text-right h-8 w-28"
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveRow(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Penawaran() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  
  const { quotations, isLoading, createQuotation, updateQuotation, deleteQuotation, getQuotationWithItems, generateQuotationNumber } = useQuotations();
  const { data: customers = [] } = useCustomers();

  const [formData, setFormData] = useState<QuotationForm>({
    customerId: null,
    customerName: "",
    customerAddress: "",
    route: "Tanjung Priok - Bandung",
    rates: [...defaultRates],
    greenLine: [...defaultGreenLine],
    redLine: [...defaultRedLine],
    notes: [...defaultNotes],
  });

  const resetForm = () => {
    setFormData({
      customerId: null,
      customerName: "",
      customerAddress: "",
      route: "Tanjung Priok - Bandung",
      rates: [...defaultRates],
      greenLine: [...defaultGreenLine],
      redLine: [...defaultRedLine],
      notes: [...defaultNotes],
    });
    setEditingId(null);
  };

  const convertDbItemsToRateItems = (
    items: { section: string; item_no: number; description: string; lcl_rate: number | null; fcl_20_rate: number | null; fcl_40_rate: number | null }[],
    section: string,
    defaultItems: RateItem[]
  ): RateItem[] => {
    const sectionItems = items.filter((item) => item.section === section);
    if (sectionItems.length === 0) return [...defaultItems];
    
    return sectionItems.map((item) => ({
      no: item.item_no,
      description: item.description,
      lclRate: item.lcl_rate,
      fcl20Rate: item.fcl_20_rate,
      fcl40Rate: item.fcl_40_rate,
    }));
  };

  const handleView = async (quotationId: string) => {
    try {
      const quotation = await getQuotationWithItems(quotationId);
      if (!quotation) {
        toast.error("Penawaran tidak ditemukan");
        return;
      }

      const items = quotation.items || [];
      
      setFormData({
        customerId: quotation.customer_id || null,
        customerName: quotation.customer_name,
        customerAddress: quotation.customer_address || "",
        route: quotation.route || "Tanjung Priok - Bandung",
        rates: convertDbItemsToRateItems(items, "rates", defaultRates),
        greenLine: convertDbItemsToRateItems(items, "green_line", defaultGreenLine),
        redLine: convertDbItemsToRateItems(items, "red_line", defaultRedLine),
        notes: quotation.notes || [...defaultNotes],
      });
      
      setPreviewId(quotationId);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Gagal memuat data penawaran");
    }
  };

  const handleEditFromPreview = () => {
    if (previewId) {
      setIsPreviewOpen(false);
      setEditingId(previewId);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteFromPreview = () => {
    if (previewId) {
      setIsPreviewOpen(false);
      setDeleteId(previewId);
    }
  };

  const handleSendQuotation = async () => {
    if (!previewId) return;
    
    try {
      await updateQuotation.mutateAsync({
        id: previewId,
        status: "sent",
      });
      toast.success("Penawaran berhasil dikirim");
      setIsPreviewOpen(false);
      setPreviewId(null);
    } catch (error) {
      console.error("Error sending quotation:", error);
      toast.error("Gagal mengirim penawaran");
    }
  };

  const handleEdit = async (quotationId: string) => {
    try {
      const quotation = await getQuotationWithItems(quotationId);
      if (!quotation) {
        toast.error("Penawaran tidak ditemukan");
        return;
      }

      const items = quotation.items || [];
      
      setFormData({
        customerId: quotation.customer_id || null,
        customerName: quotation.customer_name,
        customerAddress: quotation.customer_address || "",
        route: quotation.route || "Tanjung Priok - Bandung",
        rates: convertDbItemsToRateItems(items, "rates", defaultRates),
        greenLine: convertDbItemsToRateItems(items, "green_line", defaultGreenLine),
        redLine: convertDbItemsToRateItems(items, "red_line", defaultRedLine),
        notes: quotation.notes || [...defaultNotes],
      });
      
      setEditingId(quotationId);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error loading quotation:", error);
      toast.error("Gagal memuat data penawaran");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await deleteQuotation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting quotation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "manual") {
      setFormData((prev) => ({
        ...prev,
        customerId: null,
        customerName: "",
        customerAddress: "",
      }));
      return;
    }

    const customer = customers?.find((c) => c.id === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.company_name,
        customerAddress: [customer.address, customer.city].filter(Boolean).join(", "),
      }));
    }
  };

  const handleRatesUpdate = (index: number, field: keyof RateItem, value: number | null | string) => {
    setFormData((prev) => {
      const newRates = [...prev.rates];
      newRates[index] = { ...newRates[index], [field]: value };
      return { ...prev, rates: newRates };
    });
  };

  const handleGreenLineUpdate = (index: number, field: keyof RateItem, value: number | null | string) => {
    setFormData((prev) => {
      const newGreenLine = [...prev.greenLine];
      newGreenLine[index] = { ...newGreenLine[index], [field]: value };
      return { ...prev, greenLine: newGreenLine };
    });
  };

  const handleRedLineUpdate = (index: number, field: keyof RateItem, value: number | null | string) => {
    setFormData((prev) => {
      const newRedLine = [...prev.redLine];
      newRedLine[index] = { ...newRedLine[index], [field]: value };
      return { ...prev, redLine: newRedLine };
    });
  };

  const addRateRow = (section: "rates" | "greenLine" | "redLine") => {
    setFormData((prev) => {
      const sectionItems = prev[section];
      const newNo = sectionItems.length > 0 ? Math.max(...sectionItems.map(i => i.no)) + 1 : 1;
      const newItem: RateItem = {
        no: newNo,
        description: "",
        lclRate: null,
        fcl20Rate: null,
        fcl40Rate: null,
      };
      return { ...prev, [section]: [...sectionItems, newItem] };
    });
  };

  const removeRateRow = (section: "rates" | "greenLine" | "redLine", index: number) => {
    setFormData((prev) => {
      const sectionItems = prev[section];
      if (sectionItems.length <= 1) {
        toast.error("Minimal harus ada 1 baris");
        return prev;
      }
      const newItems = sectionItems.filter((_, i) => i !== index).map((item, i) => ({
        ...item,
        no: i + 1,
      }));
      return { ...prev, [section]: newItems };
    });
  };

  const convertRateItemsToDbItems = (items: RateItem[], section: "rates" | "green_line" | "red_line") => {
    return items.map((item) => ({
      section,
      item_no: item.no,
      description: item.description,
      lcl_rate: item.lclRate,
      fcl_20_rate: item.fcl20Rate,
      fcl_40_rate: item.fcl40Rate,
    }));
  };

  const handleSave = async (status: string = "draft") => {
    if (!formData.customerName.trim()) {
      toast.error("Nama pelanggan wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const items = [
        ...convertRateItemsToDbItems(formData.rates, "rates"),
        ...convertRateItemsToDbItems(formData.greenLine, "green_line"),
        ...convertRateItemsToDbItems(formData.redLine, "red_line"),
      ];

      if (editingId) {
        // Update existing quotation
        await updateQuotation.mutateAsync({
          id: editingId,
          customer_id: formData.customerId,
          customer_name: formData.customerName,
          customer_address: formData.customerAddress || null,
          route: formData.route || null,
          status,
          notes: formData.notes,
          items,
        });
      } else {
        // Create new quotation
        const quotationNumber = await generateQuotationNumber();
        
        const input: QuotationInput = {
          quotation_number: quotationNumber,
          customer_id: formData.customerId,
          customer_name: formData.customerName,
          customer_address: formData.customerAddress || null,
          route: formData.route || null,
          status,
          notes: formData.notes,
          items,
        };

        await createQuotation.mutateAsync(input);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving quotation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      q.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.quotation_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group quotations by customer name
  const groupedByCustomer = useMemo(() => {
    const groups: Record<string, typeof filteredQuotations> = {};
    
    filteredQuotations.forEach((quotation) => {
      const customerName = quotation.customer_name?.trim() || "Pelanggan Tidak Diketahui";
      if (!groups[customerName]) {
        groups[customerName] = [];
      }
      groups[customerName].push(quotation);
    });

    // Sort customer names alphabetically, but put "Pelanggan Tidak Diketahui" at the end
    const sortedCustomers = Object.keys(groups).sort((a, b) => {
      if (a === "Pelanggan Tidak Diketahui") return 1;
      if (b === "Pelanggan Tidak Diketahui") return -1;
      return a.localeCompare(b, "id");
    });

    return { groups, sortedCustomers };
  }, [filteredQuotations]);

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-info/10 text-info",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    draft: "Draft",
    sent: "Terkirim",
    approved: "Disetujui",
    rejected: "Ditolak",
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: localeId });
    } catch {
      return dateString;
    }
  };

  return (
    <MainLayout title="Penawaran" subtitle="Kelola penawaran harga">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari penawaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Penawaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Penawaran" : "Buat Penawaran Baru"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Perbarui data penawaran yang sudah ada" : "Buat penawaran harga baru untuk pelanggan"}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6 py-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Pilih Pelanggan</Label>
                  <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerPopoverOpen}
                        className="w-full justify-between bg-background"
                      >
                        {formData.customerId
                          ? customers.find((c) => c.id === formData.customerId)?.company_name
                          : formData.customerName
                            ? `Manual: ${formData.customerName}`
                            : "Pilih pelanggan atau input manual..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 z-50" align="start">
                      <Command>
                        <CommandInput placeholder="Cari pelanggan..." />
                        <CommandList>
                          <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                          <CommandGroup heading="Opsi">
                            <CommandItem
                              value="manual-input"
                              onSelect={() => {
                                handleCustomerSelect("manual");
                                setCustomerPopoverOpen(false);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Input Manual
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup heading="Pelanggan Tersimpan">
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.company_name}
                                onSelect={() => {
                                  handleCustomerSelect(customer.id);
                                  setCustomerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.customerId === customer.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{customer.company_name}</span>
                                  {customer.city && (
                                    <span className="text-xs text-muted-foreground">{customer.city}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Pelanggan *</Label>
                    <Input
                      id="customerName"
                      placeholder="Masukkan nama pelanggan"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, customerName: e.target.value }))
                      }
                      disabled={!!formData.customerId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route">Rute</Label>
                    <Input
                      id="route"
                      placeholder="Contoh: Tanjung Priok - Bandung"
                      value={formData.route}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, route: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Alamat</Label>
                  <Textarea
                    id="customerAddress"
                    placeholder="Masukkan alamat pelanggan"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customerAddress: e.target.value }))
                    }
                    disabled={!!formData.customerId}
                  />
                </div>

                {/* Rates Section */}
                <RateTable
                  title="RATES"
                  titleColor="text-primary"
                  items={formData.rates}
                  onUpdate={handleRatesUpdate}
                  onAddRow={() => addRateRow("rates")}
                  onRemoveRow={(index) => removeRateRow("rates", index)}
                />

                {/* Green Line Section */}
                <RateTable
                  title="GREEN LINE"
                  titleColor="text-success"
                  items={formData.greenLine}
                  onUpdate={handleGreenLineUpdate}
                  onAddRow={() => addRateRow("greenLine")}
                  onRemoveRow={(index) => removeRateRow("greenLine", index)}
                />

                {/* Red Line Section */}
                <RateTable
                  title="RED LINE"
                  titleColor="text-destructive"
                  items={formData.redLine}
                  onUpdate={handleRedLineUpdate}
                  onAddRow={() => addRateRow("redLine")}
                  onRemoveRow={(index) => removeRateRow("redLine", index)}
                />

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {formData.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                    Batal
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={isSaving}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      generateQuotationPdf(formData);
                      toast.success("PDF berhasil di-export");
                    }}
                    disabled={isSaving}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSave("draft")}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Simpan Draft
                  </Button>
                  <Button 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => handleSave("sent")}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Kirim Penawaran
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredQuotations.length === 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada penawaran</h3>
            <p className="text-muted-foreground">Klik "Tambah Penawaran" untuk membuat penawaran baru</p>
          </div>
        </div>
      )}

      {/* Quotations List - Grouped by Customer */}
      {!isLoading && filteredQuotations.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <Accordion type="multiple" defaultValue={groupedByCustomer.sortedCustomers} className="p-4 space-y-2">
            {groupedByCustomer.sortedCustomers.map((customerName) => (
              <AccordionItem 
                key={customerName} 
                value={customerName}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {groupedByCustomer.groups[customerName].length} penawaran
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="table-header">
                          <TableHead>No. Penawaran</TableHead>
                          <TableHead>Rute</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByCustomer.groups[customerName].map((quotation) => (
                          <TableRow 
                            key={quotation.id} 
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleView(quotation.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{quotation.quotation_number}</span>
                              </div>
                            </TableCell>
                            <TableCell>{quotation.route || "-"}</TableCell>
                            <TableCell>{formatDate(quotation.created_at)}</TableCell>
                            <TableCell>
                              <Badge className={statusStyles[quotation.status || "draft"]}>
                                {statusLabels[quotation.status || "draft"]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleView(quotation.id)}>
                                    <Eye className="h-4 w-4 mr-2" /> Lihat
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleEdit(quotation.id)}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onSelect={() => setDeleteId(quotation.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredQuotations.length} penawaran dari {groupedByCustomer.sortedCustomers.length} pelanggan
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penawaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penawaran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => {
        setIsPreviewOpen(open);
        if (!open) setPreviewId(null);
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview Penawaran</DialogTitle>
            <DialogDescription>
              Pratinjau dokumen penawaran sebelum di-export ke PDF
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-220px)]">
            <QuotationPreview
              customerName={formData.customerName}
              customerAddress={formData.customerAddress}
              route={formData.route}
              rates={formData.rates}
              greenLine={formData.greenLine}
              redLine={formData.redLine}
              notes={formData.notes}
            />
          </ScrollArea>
          <div className="flex flex-wrap justify-between gap-3 pt-4 border-t">
            <div className="flex gap-2">
              {previewId && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleEditFromPreview}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDeleteFromPreview}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setIsPreviewOpen(false);
                setPreviewId(null);
              }}>
                Tutup
              </Button>
              <Button 
                onClick={() => {
                  generateQuotationPdf(formData);
                  toast.success("PDF berhasil di-export");
                }}
                variant="outline"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              {previewId && (
                <Button 
                  onClick={handleSendQuotation}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Penawaran
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
