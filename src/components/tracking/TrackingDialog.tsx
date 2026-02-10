import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tracking, TrackingInput } from "@/hooks/useTrackings";
import { useVendors } from "@/hooks/useVendors";

const trackingSchema = z.object({
  vendor_id: z.string().optional(),
  company_name: z.string().min(1, "Nama PT wajib diisi"),
  aju: z.string().optional(),
  container_number: z.string().optional(),
  depo_kosongan: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  plate_number: z.string().optional(),
  destination: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  shipping_date: z.date().nullable().optional(),
  lokasi_muat: z.string().optional(),
  container_size: z.string().optional(),
});

type TrackingFormValues = z.infer<typeof trackingSchema>;

interface TrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracking?: Tracking | null;
  onSubmit: (data: TrackingInput) => void;
  isLoading?: boolean;
}

export function TrackingDialog({
  open,
  onOpenChange,
  tracking,
  onSubmit,
  isLoading,
}: TrackingDialogProps) {
  const { data: vendors } = useVendors();

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      vendor_id: "",
      company_name: "",
      aju: "",
      container_number: "",
      depo_kosongan: "",
      driver_name: "",
      driver_phone: "",
      plate_number: "",
      destination: "",
      status: "in_transit",
      notes: "",
      shipping_date: null,
      lokasi_muat: "",
      container_size: "",
    },
  });

  useEffect(() => {
    if (tracking) {
      form.reset({
        vendor_id: tracking.vendor_id || "",
        company_name: tracking.company_name,
        aju: tracking.aju || "",
        container_number: tracking.container_number || "",
        depo_kosongan: tracking.depo_kosongan || "",
        driver_name: tracking.driver_name || "",
        driver_phone: tracking.driver_phone || "",
        plate_number: tracking.plate_number || "",
        destination: tracking.destination || "",
        status: tracking.status || "in_transit",
        notes: tracking.notes || "",
        shipping_date: tracking.shipping_date ? new Date(tracking.shipping_date) : null,
        lokasi_muat: tracking.lokasi_muat || "",
        container_size: tracking.container_size || "",
      });
    } else {
      form.reset({
        vendor_id: "",
        company_name: "",
        aju: "",
        container_number: "",
        depo_kosongan: "",
        driver_name: "",
        driver_phone: "",
        plate_number: "",
        destination: "",
        status: "in_transit",
        notes: "",
        shipping_date: null,
        lokasi_muat: "",
        container_size: "",
      });
    }
  }, [tracking, form]);

  const handleVendorChange = (vendorId: string) => {
    form.setValue("vendor_id", vendorId);
    const selectedVendor = vendors?.find((v) => v.id === vendorId);
    if (selectedVendor) {
      form.setValue("company_name", selectedVendor.company_name);
    }
  };

  const handleSubmit = (values: TrackingFormValues) => {
    const data: TrackingInput = {
      vendor_id: values.vendor_id || null,
      company_name: values.company_name,
      aju: values.aju || null,
      container_number: values.container_number || null,
      depo_kosongan: values.depo_kosongan || null,
      driver_name: values.driver_name || null,
      driver_phone: values.driver_phone || null,
      plate_number: values.plate_number || null,
      destination: values.destination || null,
      status: values.status || "in_transit",
      notes: values.notes || null,
      shipping_date: values.shipping_date ? values.shipping_date.toISOString().split("T")[0] : null,
      lokasi_muat: values.lokasi_muat || null,
      container_size: values.container_size || null,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tracking ? "Edit Tracking" : "Tambah Tracking"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Vendor</FormLabel>
                    <Select
                      onValueChange={handleVendorChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih vendor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors?.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama PT *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama perusahaan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aju"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AJU</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor AJU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="container_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Container</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor container" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depo_kosongan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depo Kosongan</FormLabel>
                    <FormControl>
                      <Input placeholder="Lokasi depo kosongan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Sopir</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama sopir" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Telpon Sopir</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomer Polisi</FormLabel>
                    <FormControl>
                      <Input placeholder="B 1234 ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tujuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Kota/lokasi tujuan" {...field} />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="loading">Loading</SelectItem>
                        <SelectItem value="unloading">Unloading</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pengiriman</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : "Pilih tanggal"}
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
                name="lokasi_muat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Muat</FormLabel>
                    <FormControl>
                      <Input placeholder="Lokasi muat barang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="container_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran Kontainer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih ukuran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="20">20'</SelectItem>
                        <SelectItem value="40">40'</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
