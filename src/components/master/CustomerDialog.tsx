import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Customer, CustomerInput } from "@/hooks/useCustomers";

const customerSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  pic_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  npwp: z.string().optional(),
  customer_type: z.enum(["eksportir", "importir", "keduanya"]),
  status: z.enum(["aktif", "tidak_aktif"]),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSubmit: (data: CustomerInput) => void;
  isLoading?: boolean;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSubmit,
  isLoading,
}: CustomerDialogProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      company_name: "",
      pic_name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      npwp: "",
      customer_type: "keduanya",
      status: "aktif",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        company_name: customer.company_name,
        pic_name: customer.pic_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        npwp: customer.npwp || "",
        customer_type: customer.customer_type,
        status: customer.status,
      });
    } else {
      form.reset({
        company_name: "",
        pic_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        npwp: "",
        customer_type: "keduanya",
        status: "aktif",
      });
    }
  }, [customer, form]);

  const handleSubmit = (values: CustomerFormValues) => {
    onSubmit({
      company_name: values.company_name,
      pic_name: values.pic_name || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      city: values.city || null,
      npwp: values.npwp || null,
      customer_type: values.customer_type,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Perbarui informasi pelanggan"
              : "Masukkan data pelanggan baru"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nama Perusahaan *</FormLabel>
                    <FormControl>
                      <Input placeholder="PT Contoh Perusahaan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pic_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama PIC</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama kontak person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@perusahaan.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="npwp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NPWP</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000.0-000.000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat lengkap perusahaan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Pelanggan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="eksportir">Eksportir</SelectItem>
                        <SelectItem value="importir">Importir</SelectItem>
                        <SelectItem value="keduanya">Keduanya</SelectItem>
                      </SelectContent>
                    </Select>
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
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : customer ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
