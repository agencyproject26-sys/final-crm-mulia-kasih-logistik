import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, ShieldAlert } from "lucide-react";
import logoMkl from "@/assets/logo-mkl.png";

interface PendingApprovalProps {
  status: "pending" | "rejected";
  onSignOut: () => void;
}

export default function PendingApproval({ status, onSignOut }: PendingApprovalProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logoMkl}
              alt="PT. Mulia Kasih Logistik"
              className="h-20 w-auto object-contain"
            />
          </div>
          {status === "pending" ? (
            <>
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Menunggu Persetujuan</CardTitle>
              <CardDescription className="text-base mt-2">
                Akun Anda telah terdaftar dan sedang menunggu persetujuan dari administrator.
                Anda akan mendapatkan akses setelah akun disetujui.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-2">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">Akses Ditolak</CardTitle>
              <CardDescription className="text-base mt-2">
                Maaf, akun Anda telah ditolak oleh administrator.
                Silakan hubungi administrator untuk informasi lebih lanjut.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" onClick={onSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
