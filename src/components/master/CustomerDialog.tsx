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
import { Customer, CustomerInput } from "@/hooks/useCustomers";

const customerSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi"),
  contacts: z.array(z.object({ 
    name: z.string(), 
    phone: z.string() 
  })).default([{ name: "", phone: "" }]),
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
      contacts: [{ name: "", phone: "" }],
      email: "",
      address: "",
      city: "",
      npwp: "",
      customer_type: "keduanya",
      status: "aktif",
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  useEffect(() => {
    if (customer) {
      const picNames = customer.pic_name || [];
      const phones = customer.phone || [];
      const maxLength = Math.max(picNames.length, phones.length, 1);
      
      const contacts = Array.from({ length: maxLength }, (_, i) => ({
        name: picNames[i] || "",
        phone: phones[i] || "",
      }));
      
      form.reset({
        company_name: customer.company_name,
        contacts: contacts.length > 0 ? contacts : [{ name: "", phone: "" }],
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
        contacts: [{ name: "", phone: "" }],
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
      npwp: values.npwp || null,
      customer_type: values.customer_type,
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
