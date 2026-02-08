import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_MENU_KEYS, MenuKey } from "@/hooks/useMenuAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, LayoutDashboard, Building2, Handshake, Package, Receipt, BarChart3 } from "lucide-react";

interface UserWithMenuAccess {
  id: string;
  email: string;
  roles: string[];
  menu_access: string[];
}

interface MenuAccessManagerProps {
  users: UserWithMenuAccess[];
  onUpdated: () => void;
}

const menuIcons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  "master-data": Building2,
  "sales-crm": Handshake,
  operasional: Package,
  keuangan: Receipt,
  laporan: BarChart3,
};

export function MenuAccessManager({ users, onUpdated }: MenuAccessManagerProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedMenus, setSelectedMenus] = useState<Record<string, MenuKey[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selectedMenus from users data
  useEffect(() => {
    const initial: Record<string, MenuKey[]> = {};
    users.forEach((u) => {
      initial[u.id] = (u.menu_access || []) as MenuKey[];
    });
    setSelectedMenus(initial);
  }, [users]);

  const toggleMenu = (userId: string, menuKey: MenuKey) => {
    setSelectedMenus((prev) => {
      const current = prev[userId] || [];
      const updated = current.includes(menuKey)
        ? current.filter((k) => k !== menuKey)
        : [...current, menuKey];
      return { ...prev, [userId]: updated };
    });
  };

  const saveMenuAccess = async (userId: string) => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=update-menu-access`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            menu_keys: selectedMenus[userId] || [],
          }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Akses menu berhasil diperbarui");
        setEditingUser(null);
        onUpdated();
      } else {
        toast.error(result.error || "Gagal memperbarui akses menu");
      }
    } catch (err) {
      console.error("Save menu access error:", err);
      toast.error("Gagal memperbarui akses menu");
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = (user: UserWithMenuAccess) => user.roles.includes("admin");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Akses Menu per Pengguna
        </CardTitle>
        <CardDescription>
          Atur menu mana saja yang bisa diakses oleh setiap pengguna. Admin memiliki akses ke semua menu secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Email</TableHead>
                {ALL_MENU_KEYS.map((menu) => {
                  const Icon = menuIcons[menu.key];
                  return (
                    <TableHead key={menu.key} className="text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        {Icon && <Icon size={14} />}
                        <span className="text-xs">{menu.label}</span>
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userIsAdmin = isAdmin(user);
                const isEditing = editingUser === user.id;
                const currentMenus = selectedMenus[user.id] || [];

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.email}</span>
                        {userIsAdmin && (
                          <Badge variant="destructive" className="w-fit text-xs mt-1">Admin</Badge>
                        )}
                      </div>
                    </TableCell>
                    {ALL_MENU_KEYS.map((menu) => (
                      <TableCell key={menu.key} className="text-center">
                        {userIsAdmin ? (
                          <Checkbox checked disabled className="mx-auto" />
                        ) : (
                          <Checkbox
                            checked={currentMenus.includes(menu.key)}
                            disabled={!isEditing}
                            onCheckedChange={() => toggleMenu(user.id, menu.key)}
                            className="mx-auto"
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      {userIsAdmin ? (
                        <span className="text-xs text-muted-foreground">Semua akses</span>
                      ) : isEditing ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            onClick={() => saveMenuAccess(user.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Simpan"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(null);
                              // Reset to original
                              setSelectedMenus((prev) => ({
                                ...prev,
                                [user.id]: (user.menu_access || []) as MenuKey[],
                              }));
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user.id)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada pengguna ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
