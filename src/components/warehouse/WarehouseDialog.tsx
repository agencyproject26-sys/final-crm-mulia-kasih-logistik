import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Warehouse, WarehouseInput } from "@/hooks/useWarehouses";
import { useCustomers } from "@/hooks/useCustomers";

const warehouseSchema = z.object({
  customer_id: z.string().optional(),
  customer_name: z.string().min(1, "Nama pelanggan wajib diisi"),
  cbm: z.string().optional(),
  description: z.string().optional(),
  handling_in_out: z.string().optional(),
  daily_notes: z.string().optional(),
  quantity: z.string().optional(),
  unit_price: z.string().optional(),
  party: z.string().optional(),
  administration: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
  onSubmit: (data: WarehouseInput) => void;
  isLoading?: boolean;
}

export function WarehouseDialog({
  open,
  onOpenChange,
  warehouse,
  onSubmit,
  isLoading,
}: WarehouseDialogProps) {
  const { data: customers } = useCustomers();

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      customer_id: "",
      customer_name: "",
      cbm: "",
      description: "",
      handling_in_out: "",
      daily_notes: "",
      quantity: "",
      unit_price: "",
      party: "",
      administration: "",
      status: "active",
      notes: "",
    },
  });

  useEffect(() => {
    if (warehouse) {
      form.reset({
        customer_id: warehouse.customer_id || "",
        customer_name: warehouse.customer_name,
        cbm: warehouse.cbm?.toString() || "",
        description: warehouse.description || "",
        handling_in_out: warehouse.handling_in_out || "",
        daily_notes: warehouse.daily_notes || "",
        quantity: warehouse.quantity?.toString() || "",
        unit_price: warehouse.unit_price?.toString() || "",
        party: warehouse.party || "",
        administration: warehouse.administration || "",
        status: warehouse.status || "active",
        notes: warehouse.notes || "",
      });
    } else {
      form.reset({
        customer_id: "",
        customer_name: "",
        cbm: "",
        description: "",
        handling_in_out: "",
        daily_notes: "",
        quantity: "",
        unit_price: "",
        party: "",
        administration: "",
        status: "active",
        notes: "",
      });
    }
  }, [warehouse, form]);

  const handleCustomerChange = (customerId: string) => {
    form.setValue("customer_id", customerId);
    const selectedCustomer = customers?.find((c) => c.id === customerId);
    if (selectedCustomer) {
      form.setValue("customer_name", selectedCustomer.company_name);
    }
  };

  const handleSubmit = (values: WarehouseFormValues) => {
    const data: WarehouseInput = {
      customer_id: values.customer_id || null,
      customer_name: values.customer_name,
      cbm: values.cbm ? parseFloat(values.cbm) : null,
      description: values.description || null,
      handling_in_out: values.handling_in_out || null,
      daily_notes: values.daily_notes || null,
      quantity: values.quantity ? parseFloat(values.quantity) : null,
      unit_price: values.unit_price ? parseFloat(values.unit_price) : null,
      party: values.party || null,
      administration: values.administration || null,
      status: values.status || "active",
      notes: values.notes || null,
    };
    onSubmit(data);
  };

  const quantity = parseFloat(form.watch("quantity") || "0");
  const unitPrice = parseFloat(form.watch("unit_price") || "0");
  const totalAmount = quantity * unitPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? "Edit Data Gudang" : "Tambah Data Gudang"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Pelanggan</FormLabel>
                    <Select
                      onValueChange={handleCustomerChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
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

              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pelanggan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama pelanggan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cbm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CBM</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Deskripsi barang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="handling_in_out"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handling In/Out</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">IN</SelectItem>
                        <SelectItem value="out">OUT</SelectItem>
                        <SelectItem value="in_out">IN/OUT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daily_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan Harian</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan harian" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Satuan</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="0" {...field} />
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
                      <Input placeholder="Party" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="administration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan administrasi" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <div className="w-full p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
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
