import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, TruckInput } from "@/hooks/useTrucks";

const formSchema = z.object({
  truck_id: z.string().min(1, "ID Truk wajib diisi"),
  plate_number: z.string().min(1, "Nomor Polisi wajib diisi"),
  truck_type: z.string().min(1, "Tipe Truk wajib diisi"),
  capacity: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  status: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TruckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TruckInput) => void;
  truck?: Truck | null;
  isLoading?: boolean;
}

export const TruckDialog = ({
  open,
  onOpenChange,
  onSubmit,
  truck,
  isLoading,
}: TruckDialogProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      truck_id: "",
      plate_number: "",
      truck_type: "",
      capacity: "",
      driver_name: "",
      driver_phone: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (truck) {
      form.reset({
        truck_id: truck.truck_id,
        plate_number: truck.plate_number,
        truck_type: truck.truck_type,
        capacity: truck.capacity || "",
        driver_name: truck.driver_name || "",
        driver_phone: truck.driver_phone || "",
        status: truck.status || "active",
      });
    } else {
      form.reset({
        truck_id: "",
        plate_number: "",
        truck_type: "",
        capacity: "",
        driver_name: "",
        driver_phone: "",
        status: "active",
      });
    }
  }, [truck, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      truck_id: data.truck_id,
      plate_number: data.plate_number,
      truck_type: data.truck_type,
      capacity: data.capacity || null,
      driver_name: data.driver_name || null,
      driver_phone: data.driver_phone || null,
      status: data.status || "active",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {truck ? "Edit Truk & Driver" : "Tambah Truk & Driver"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="truck_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Truk *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: TRK-001" {...field} />
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
                  <FormLabel>Nomor Polisi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: B 1234 ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="truck_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Truk *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe truk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tronton">Tronton</SelectItem>
                      <SelectItem value="Trailer">Trailer</SelectItem>
                      <SelectItem value="Wingbox">Wingbox</SelectItem>
                      <SelectItem value="Fuso">Fuso</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="CDE">CDE</SelectItem>
                      <SelectItem value="Pickup">Pickup</SelectItem>
                      <SelectItem value="Container">Container</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasitas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 20 Ton" {...field} />
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
                  <FormLabel>Nama Driver</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama driver" {...field} />
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
                  <FormLabel>No. Telepon Driver</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 081234567890" {...field} />
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
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
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
                {isLoading ? "Menyimpan..." : truck ? "Simpan Perubahan" : "Tambah Truk"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
