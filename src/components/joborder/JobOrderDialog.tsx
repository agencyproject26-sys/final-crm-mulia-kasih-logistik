import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { JobOrder, JobOrderInput, useJobOrders } from "@/hooks/useJobOrders";

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

export const JobOrderDialog = ({
  open,
  onOpenChange,
  onSubmit,
  jobOrder,
  isLoading,
}: JobOrderDialogProps) => {
  const { data: customers = [] } = useCustomers();
  const { generateJobOrderNumber } = useJobOrders();

  // Radix Select tidak nyaman dengan value string kosong; pakai sentinel agar form stabil.
  const NONE = "__none__";

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
      lokasi: "",
      tujuan: "",
      respond_bc: "",
      status_bl: "pending",
      customer_id: "",
      customer_name: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
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
  }, [open, jobOrder, form, generateJobOrderNumber]);

  const handleCustomerChange = (customerId: string) => {
    if (customerId === NONE) {
      form.setValue("customer_id", "");
      form.setValue("customer_name", "");
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue("customer_id", customerId);
      form.setValue("customer_name", customer.company_name);
    }
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
      status: "active",
    };
    onSubmit(input);
  };

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
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bl_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. BL</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        placeholder="Nomor BL" 
                        autoFocus 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={handleCustomerChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Tidak ada</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2 */}
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
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        placeholder="Nomor DP" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aju"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AJU</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        placeholder="Nama Party" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4 */}
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
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status_do"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status DO</FormLabel>
                    <Select 
                      value={field.value || "pending"} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="released">Released</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      value={field.value || "belum_lunas"} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                        <SelectItem value="lunas">Lunas</SelectItem>
                        <SelectItem value="dp">DP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lokasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                        value={field.value ?? ""} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        placeholder="Lokasi tujuan" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="respond_bc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respond BC</FormLabel>
                    <Select 
                      value={field.value || NONE} 
                      onValueChange={(val) => field.onChange(val === NONE ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih respond" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Belum dipilih</SelectItem>
                        <SelectItem value="green">Green (Jalur Hijau)</SelectItem>
                        <SelectItem value="yellow">Yellow (Jalur Kuning)</SelectItem>
                        <SelectItem value="red">Red (Jalur Merah)</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      value={field.value || NONE} 
                      onValueChange={(val) => field.onChange(val === NONE ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Belum dipilih</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="surrendered">Surrendered</SelectItem>
                        <SelectItem value="telex_release">Telex Release</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
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
