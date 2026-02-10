import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { JobOrder, JobOrderInput, useJobOrders } from "@/hooks/useJobOrders";
import { CustomerCombobox } from "./CustomerCombobox";
import { SearchableSelect, SelectOption } from "./SearchableSelect";

const formSchema = z.object({
  job_order_number: z.string().min(1, "Nomor Job Order wajib diisi"),
  eta_kapal: z.date().nullable().optional(),
  bl_number: z.string().optional(),
  no_invoice: z.string().optional(),
  aju: z.string().optional(),
  party: z.string().optional(),
  exp_do: z.date().nullable().optional(),
  status_do: z.string().optional(),
  pembayaran_do: z.string().optional(),
  status: z.string().optional(),
  lokasi: z.string().optional(),
  tujuan: z.string().optional(),
  respond_bc: z.string().optional(),
  status_bl: z.string().optional(),
  customer_id: z.string().optional(),
  customer_name: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: JobOrderInput) => void;
  jobOrder?: JobOrder | null;
  isLoading?: boolean;
}

// Options for searchable selects
const statusDoOptions: SelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "released", label: "Released" },
  { value: "on_hold", label: "On Hold" },
  { value: "expired", label: "Expired" },
];

const pembayaranDoOptions: SelectOption[] = [
  { value: "belum_lunas", label: "Belum Lunas" },
  { value: "lunas", label: "Lunas" },
  { value: "dp", label: "DP" },
];

const respondBcOptions: SelectOption[] = [
  { value: "green", label: "Green (Jalur Hijau)" },
  { value: "yellow", label: "Yellow (Jalur Kuning)" },
  { value: "red", label: "Red (Jalur Merah)" },
  { value: "pending", label: "Pending" },
];

const statusBlOptions: SelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "surrendered", label: "Surrendered" },
  { value: "telex_release", label: "Telex Release" },
];

const statusOptions: SelectOption[] = [
  { value: "original", label: "Original" },
  { value: "lc", label: "LC" },
  { value: "sea_waybill", label: "Sea Waybill" },
];

export const JobOrderDialog = ({
  open,
  onOpenChange,
  onSubmit,
  jobOrder,
  isLoading,
}: JobOrderDialogProps) => {
  const { generateJobOrderNumber } = useJobOrders();
  
  // Track if we've initialized this dialog session
  const hasInitialized = useRef(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_order_number: "",
      eta_kapal: null,
      bl_number: "",
      no_invoice: "",
      aju: "",
      party: "",
      exp_do: null,
      status_do: "pending",
      pembayaran_do: "belum_lunas",
      status: "",
      lokasi: "",
      tujuan: "",
      respond_bc: "",
      status_bl: "pending",
      customer_id: "",
      customer_name: "",
      notes: "",
    },
  });

  // Only reset form when dialog opens (not on every render)
  useEffect(() => {
    if (open && !hasInitialized.current) {
      hasInitialized.current = true;
      if (jobOrder) {
        form.reset({
          job_order_number: jobOrder.job_order_number,
          eta_kapal: jobOrder.eta_kapal ? new Date(jobOrder.eta_kapal) : null,
          bl_number: jobOrder.bl_number || "",
          no_invoice: jobOrder.no_invoice || "",
          aju: jobOrder.aju || "",
          party: jobOrder.party || "",
          exp_do: jobOrder.exp_do ? new Date(jobOrder.exp_do) : null,
          status_do: jobOrder.status_do || "pending",
          pembayaran_do: jobOrder.pembayaran_do || "belum_lunas",
          status: jobOrder.status || "",
          lokasi: jobOrder.lokasi || "",
          tujuan: jobOrder.tujuan || "",
          respond_bc: jobOrder.respond_bc || "",
          status_bl: jobOrder.status_bl || "pending",
          customer_id: jobOrder.customer_id || "",
          customer_name: jobOrder.customer_name || "",
          notes: jobOrder.notes || "",
        });
      } else {
        form.reset({
          job_order_number: generateJobOrderNumber(),
          eta_kapal: null,
          bl_number: "",
          no_invoice: "",
          aju: "",
          party: "",
          exp_do: null,
          status_do: "pending",
          pembayaran_do: "belum_lunas",
          status: "",
          lokasi: "",
          tujuan: "",
          respond_bc: "",
          status_bl: "pending",
          customer_id: "",
          customer_name: "",
          notes: "",
        });
      }
    }
    
    // Reset the flag when dialog closes
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, jobOrder, form, generateJobOrderNumber]);

  const handleCustomerSelect = (customerId: string, customerName: string) => {
    form.setValue("customer_id", customerId);
    form.setValue("customer_name", customerName);
  };

  const handleSubmit = (data: FormData) => {
    const input: JobOrderInput = {
      job_order_number: data.job_order_number,
      eta_kapal: data.eta_kapal ? format(data.eta_kapal, "yyyy-MM-dd") : null,
      bl_number: data.bl_number || null,
      no_invoice: data.no_invoice || null,
      aju: data.aju || null,
      party: data.party || null,
      exp_do: data.exp_do ? format(data.exp_do, "yyyy-MM-dd") : null,
      status_do: data.status_do || null,
      pembayaran_do: data.pembayaran_do || null,
      lokasi: data.lokasi || null,
      tujuan: data.tujuan || null,
      respond_bc: data.respond_bc || null,
      status_bl: data.status_bl || null,
      customer_id: data.customer_id || null,
      customer_name: data.customer_name || null,
      notes: data.notes || null,
      status: data.status || null,
    };
    onSubmit(input);
  };

  const customerId = form.watch("customer_id");
  const customerName = form.watch("customer_name");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {jobOrder ? "Edit Job Order" : "Buat Job Order Baru"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Row 1: BL Number & Customer */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bl_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. BL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Nomor BL" 
                        autoFocus 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <CustomerCombobox
                  value={customerId || ""}
                  customerName={customerName || ""}
                  onSelect={handleCustomerSelect}
                />
              </FormItem>
            </div>

            {/* Row 2: ETA Kapal & No DP */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eta_kapal"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>ETA Kapal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Pilih tanggal"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="no_invoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. DP</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Nomor DP" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: AJU & Party */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aju"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AJU</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Nomor AJU" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Nama Party" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: EXP DO & Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exp_do"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>EXP DO</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Pilih tanggal"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value || ""}
                        options={statusOptions}
                        placeholder="Pilih status"
                        searchPlaceholder="Cari status..."
                        onChange={field.onChange}
                        allowClear={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 5: Status DO & Pembayaran DO */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status_do"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status DO</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value || "pending"}
                        options={statusDoOptions}
                        placeholder="Pilih status"
                        searchPlaceholder="Cari status..."
                        onChange={field.onChange}
                        allowClear={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pembayaran_do"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pembayaran DO</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value || "belum_lunas"}
                        options={pembayaranDoOptions}
                        placeholder="Pilih status pembayaran"
                        searchPlaceholder="Cari..."
                        onChange={field.onChange}
                        allowClear={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 6: Lokasi & Tujuan */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lokasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Lokasi asal" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tujuan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tujuan</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ""}
                        placeholder="Lokasi tujuan" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 7: Respond BC & Status BL */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="respond_bc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respond BC</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value || ""}
                        options={respondBcOptions}
                        placeholder="Pilih respond"
                        searchPlaceholder="Cari respond..."
                        onChange={field.onChange}
                        allowClear={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status_bl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status BL</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value || "pending"}
                        options={statusBlOptions}
                        placeholder="Pilih status"
                        searchPlaceholder="Cari status..."
                        onChange={field.onChange}
                        allowClear={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Catatan tambahan..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : jobOrder ? "Simpan" : "Buat Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
