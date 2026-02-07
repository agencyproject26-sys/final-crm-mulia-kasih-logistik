import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Vendor, VendorInput } from "@/hooks/useVendors";

const vendorSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  contacts: z.array(z.object({
    name: z.string(),
    phone: z.string(),
  })).default([{ name: "", phone: "" }]),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  vendor_type: z.string(),
  services: z.string().optional(),
  npwp: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
  party: z.string().optional(),
  status: z.string(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (data: VendorInput) => void;
  isLoading?: boolean;
}

export function VendorDialog({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  isLoading,
}: VendorDialogProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      company_name: "",
      contacts: [{ name: "", phone: "" }],
      email: "",
      address: "",
      city: "",
      vendor_type: "trucking",
      services: "",
      npwp: "",
      bank_name: "",
      bank_account_number: "",
      bank_account_name: "",
      party: "",
      status: "aktif",
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  useEffect(() => {
    if (vendor) {
      const picNames = vendor.pic_name || [];
      const phones = vendor.phone || [];
      const maxLength = Math.max(picNames.length, phones.length, 1);

      const contacts = Array.from({ length: maxLength }, (_, i) => ({
        name: picNames[i] || "",
        phone: phones[i] || "",
      }));

      form.reset({
        company_name: vendor.company_name,
        contacts: contacts.length > 0 ? contacts : [{ name: "", phone: "" }],
        email: vendor.email || "",
        address: vendor.address || "",
        city: vendor.city || "",
        vendor_type: vendor.vendor_type || "trucking",
        services: vendor.services || "",
        npwp: vendor.npwp || "",
        bank_name: vendor.bank_name || "",
        bank_account_number: vendor.bank_account_number || "",
        bank_account_name: vendor.bank_account_name || "",
        party: vendor.party || "",
        status: vendor.status || "aktif",
      });
    } else {
      form.reset({
        company_name: "",
        contacts: [{ name: "", phone: "" }],
        email: "",
        address: "",
        city: "",
        vendor_type: "trucking",
        services: "",
        npwp: "",
        bank_name: "",
        bank_account_number: "",
        bank_account_name: "",
        party: "",
        status: "aktif",
      });
    }
  }, [vendor, form]);

  const handleSubmit = (values: VendorFormValues) => {
    const picNames = values.contacts
      .map(c => c.name.trim())
      .filter(v => v !== "");
    const phones = values.contacts
      .map(c => c.phone.trim())
      .filter(v => v !== "");

    onSubmit({
      company_name: values.company_name,
      pic_name: picNames.length > 0 ? picNames : null,
      phone: phones.length > 0 ? phones : null,
      email: values.email || null,
      address: values.address || null,
      city: values.city || null,
      vendor_type: values.vendor_type || null,
      services: values.services || null,
      npwp: values.npwp || null,
      bank_name: values.bank_name || null,
      bank_account_number: values.bank_account_number || null,
      bank_account_name: values.bank_account_name || null,
      party: values.party || null,
      status: values.status || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Tambah Vendor"}
          </DialogTitle>
          <DialogDescription>
            {vendor
              ? "Perbarui informasi vendor"
              : "Masukkan data vendor baru"}
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
                      <Input placeholder="PT Vendor Logistik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Vendor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trucking">Trucking</SelectItem>
                        <SelectItem value="shipping">Shipping Line</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="forwarding">Forwarding</SelectItem>
                        <SelectItem value="stevedoring">Stevedoring</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* Paired PIC and Phone Fields */}
              <div className="sm:col-span-2 border rounded-lg p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-foreground">Kontak Perusahaan</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContact({ name: "", phone: "" })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Kontak
                  </Button>
                </div>

                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Nama PIC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="No. Telepon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {contactFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContact(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="vendor@email.com" {...field} />
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
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Jl. Contoh No. 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Layanan yang Disediakan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Contoh: Trucking Jakarta-Surabaya, Container 20ft, 40ft" {...field} />
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
                name="party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama party" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank BCA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rekening</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pemilik Rekening</FormLabel>
                    <FormControl>
                      <Input placeholder="PT Vendor Logistik" {...field} />
                    </FormControl>
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
                {isLoading ? "Menyimpan..." : vendor ? "Perbarui" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
