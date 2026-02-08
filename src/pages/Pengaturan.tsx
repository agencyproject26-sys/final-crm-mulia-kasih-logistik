import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManageUsers } from "@/hooks/useManageUsers";
import { MenuAccessManager } from "@/components/settings/MenuAccessManager";
import { Shield, ShieldCheck, UserPlus, Users, Crown, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function Pengaturan() {
  const {
    users,
    myInfo,
    isLoading,
    isActionLoading,
    fetchUsers,
    setupFirstAdmin,
    assignRole,
    removeRole,
  } = useManageUsers();

  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);

  useEffect(() => {
    if (myInfo?.isAdmin && !hasLoadedUsers) {
      fetchUsers();
      setHasLoadedUsers(true);
    }
  }, [myInfo?.isAdmin, hasLoadedUsers, fetchUsers]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />;
      case "moderator":
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const noAdminExists = myInfo && !myInfo.isAdmin && myInfo.roles.length > 0;

  return (
    <MainLayout title="Pengaturan" subtitle="Konfigurasi sistem dan manajemen pengguna">
      <div className="space-y-6">
        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Informasi Akun Saya
            </CardTitle>
            <CardDescription>Status dan role akun Anda saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            {myInfo ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{myInfo.email}</p>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <div className="flex gap-2 flex-wrap">
                    {myInfo.roles.length > 0 ? (
                      myInfo.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="flex items-center gap-1">
                          {getRoleIcon(role)}
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Tidak ada role</Badge>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Status Admin</p>
                  {myInfo.isAdmin ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Administrator</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Bukan Admin</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat informasi akun...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup First Admin - only show if no admin exists */}
        {myInfo && !myInfo.isAdmin && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Crown className="h-5 w-5" />
                Setup Admin Pertama
              </CardTitle>
              <CardDescription>
                Sistem belum memiliki administrator. Klik tombol di bawah untuk menjadikan akun Anda sebagai admin pertama.
                Setelah menjadi admin, Anda bisa mengelola role pengguna lainnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={setupFirstAdmin}
                disabled={isActionLoading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                Jadikan Saya Admin Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User Management - Admin Only */}
        {myInfo?.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Manajemen Pengguna
              </CardTitle>
              <CardDescription>
                Kelola role dan hak akses pengguna sistem. Hanya admin yang dapat mengakses fitur ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Memuat data pengguna...
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role Saat Ini</TableHead>
                        <TableHead>Terdaftar</TableHead>
                        <TableHead>Login Terakhir</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap">
                              {user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant={getRoleBadgeVariant(role)}
                                    className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                      if (role !== "user") {
                                        removeRole(user.id, role);
                                      }
                                    }}
                                    title={role !== "user" ? `Klik untuk hapus role ${role}` : "Role default"}
                                  >
                                    {getRoleIcon(role)}
                                    {role}
                                    {role !== "user" && " ×"}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline">Tidak ada</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(user.created_at), "dd MMM yyyy", { locale: localeId })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.last_sign_in_at
                              ? format(new Date(user.last_sign_in_at), "dd MMM yyyy HH:mm", { locale: localeId })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={selectedRole[user.id] || ""}
                                onValueChange={(val) =>
                                  setSelectedRole((prev) => ({ ...prev, [user.id]: val }))
                                }
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!selectedRole[user.id] || isActionLoading}
                                onClick={() => {
                                  if (selectedRole[user.id]) {
                                    assignRole(user.id, selectedRole[user.id]);
                                    setSelectedRole((prev) => ({ ...prev, [user.id]: "" }));
                                  }
                                }}
                              >
                                {isActionLoading ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <UserPlus className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Tidak ada pengguna ditemukan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Menu Access Management - Admin Only */}
        {myInfo?.isAdmin && (
          <MenuAccessManager
            users={users}
            onUpdated={() => fetchUsers()}
          />
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Informasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Sistem</p>
                <p className="font-semibold">MKL Flow Hub</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Versi</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Role Tersedia</p>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant="destructive" className="text-xs">Admin</Badge>
                  <Badge variant="default" className="text-xs">Moderator</Badge>
                  <Badge variant="secondary" className="text-xs">User</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
