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
  pic_names: z.array(z.object({ value: z.string() })).default([{ value: "" }]),
  phones: z.array(z.object({ value: z.string() })).default([{ value: "" }]),
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
      pic_names: [{ value: "" }],
      phones: [{ value: "" }],
      email: "",
      address: "",
      city: "",
      npwp: "",
      customer_type: "keduanya",
      status: "aktif",
    },
  });

  const { fields: picFields, append: appendPic, remove: removePic } = useFieldArray({
    control: form.control,
    name: "pic_names",
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  useEffect(() => {
    if (customer) {
      const picNames = customer.pic_name && customer.pic_name.length > 0 
        ? customer.pic_name.map(p => ({ value: p || "" }))
        : [{ value: "" }];
      const phones = customer.phone && customer.phone.length > 0 
        ? customer.phone.map(p => ({ value: p || "" }))
        : [{ value: "" }];
      
      form.reset({
        company_name: customer.company_name,
        pic_names: picNames,
        phones: phones,
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
        pic_names: [{ value: "" }],
        phones: [{ value: "" }],
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
    const picNames = values.pic_names
      .map(p => p.value.trim())
      .filter(v => v !== "");
    const phones = values.phones
      .map(p => p.value.trim())
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

              {/* Dynamic PIC Fields */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Nama PIC</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPic({ value: "" })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah PIC
                  </Button>
                </div>
                {picFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`pic_names.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Nama PIC ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {picFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePic(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Phone Fields */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>No. Telepon</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPhone({ value: "" })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Telepon
                  </Button>
                </div>
                {phoneFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`phones.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`No. Telepon ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {phoneFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
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
