import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCustomers, useCreateCustomer, Customer } from "@/hooks/useCustomers";

interface CustomerComboboxProps {
  value: string;
  customerName: string;
  onSelect: (customerId: string, customerName: string) => void;
}

export function CustomerCombobox({
  value,
  customerName,
  onSelect,
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: customers = [] } = useCustomers();
  const createCustomer = useCreateCustomer();

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const searchLower = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.company_name.toLowerCase().includes(searchLower) ||
        c.pic_name?.some(p => p?.toLowerCase().includes(searchLower))
    );
  }, [customers, search]);

  // Check if search matches any existing customer exactly
  const exactMatch = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return customers.some(
      (c) => c.company_name.toLowerCase() === searchLower
    );
  }, [customers, search]);

  const handleSelect = (customer: Customer) => {
    onSelect(customer.id, customer.company_name);
    setOpen(false);
    setSearch("");
  };

  const handleManualInput = () => {
    // Just use the typed name without creating a customer record
    onSelect("", search.trim());
    setOpen(false);
    setSearch("");
  };

  const handleCreateNewCustomer = async () => {
    if (!search.trim()) return;
    
    try {
      const newCustomer = await createCustomer.mutateAsync({
        company_name: search.trim(),
        pic_name: null,
        phone: null,
        email: null,
        address: null,
        city: null,
        npwp: null,
        customer_type: "importir",
        status: "aktif",
      });
      
      onSelect(newCustomer.id, newCustomer.company_name);
      setOpen(false);
      setSearch("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClear = () => {
    onSelect("", "");
    setOpen(false);
    setSearch("");
  };

  // Display value
  const displayValue = customerName || "Pilih atau ketik customer...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !customerName && "text-muted-foreground"
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari atau ketik nama customer..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-2 text-center text-sm text-muted-foreground">
                Tidak ditemukan customer "{search}"
              </div>
            </CommandEmpty>
            
            {/* Existing customers */}
            {filteredCustomers.length > 0 && (
              <CommandGroup heading="Customer Terdaftar">
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => handleSelect(customer)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.company_name}</span>
                      {customer.pic_name && customer.pic_name.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          PIC: {customer.pic_name.join(", ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Actions when searching */}
            {search.trim() && !exactMatch && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Opsi Lainnya">
                  <CommandItem onSelect={handleManualInput}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Gunakan "{search}" (tanpa simpan)</span>
                  </CommandItem>
                  <CommandItem 
                    onSelect={handleCreateNewCustomer}
                    disabled={createCustomer.isPending}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>
                      {createCustomer.isPending 
                        ? "Menyimpan..." 
                        : `Buat customer baru "${search}"`}
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {/* Clear option */}
            {(value || customerName) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleClear}>
                    <span className="text-muted-foreground">Hapus pilihan</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
