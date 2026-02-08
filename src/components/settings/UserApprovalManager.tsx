import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserCheck, UserX, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface UserWithApproval {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
  approval_status: string;
}

interface UserApprovalManagerProps {
  users: UserWithApproval[];
  onUpdated: () => void;
}

export function UserApprovalManager({ users, onUpdated }: UserApprovalManagerProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (userId: string, action: "approve-user" | "reject-user") => {
    setLoadingAction(`${userId}-${action}`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(
          action === "approve-user"
            ? "Akun berhasil disetujui"
            : "Akun berhasil ditolak"
        );
        onUpdated();
      } else {
        toast.error(result.error || "Gagal memproses");
      }
    } catch (err) {
      console.error("Approval action error:", err);
      toast.error("Gagal memproses");
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu
          </Badge>
        );
    }
  };

  const pendingUsers = users.filter((u) => u.approval_status === "pending");
  const otherUsers = users.filter((u) => u.approval_status !== "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          Persetujuan Akun
          {pendingUsers.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingUsers.length} menunggu
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Kelola persetujuan akun baru. Akun yang belum disetujui tidak dapat mengakses sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Pending users first */}
              {pendingUsers.map((user) => (
                <TableRow key={user.id} className="bg-amber-500/5">
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleAction(user.id, "approve-user")}
                        disabled={loadingAction !== null}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {loadingAction === `${user.id}-approve-user` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(user.id, "reject-user")}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === `${user.id}-reject-user` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Tolak
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {/* Other users */}
              {otherUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      {user.approval_status === "rejected" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(user.id, "approve-user")}
                          disabled={loadingAction !== null}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {loadingAction === `${user.id}-approve-user` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Setujui
                            </>
                          )}
                        </Button>
                      )}
                      {user.approval_status === "approved" && !user.roles.includes("admin") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(user.id, "reject-user")}
                          disabled={loadingAction !== null}
                        >
                          {loadingAction === `${user.id}-reject-user` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Cabut Akses
                            </>
                          )}
                        </Button>
                      )}
                      {user.roles.includes("admin") && (
                        <span className="text-xs text-muted-foreground">Admin</span>
                      )}
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
      </CardContent>
    </Card>
  );
}
