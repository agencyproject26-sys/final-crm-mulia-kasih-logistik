import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import logoMkl from "@/assets/logo-mkl.png";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung karakter spesial"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async () => {
    if (mode === "login") {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0]?.message || "Data tidak valid");
        return;
      }
    } else {
      const validation = registerSchema.safeParse({ email, password, confirmPassword });
      if (!validation.success) {
        toast.error(validation.error.errors[0]?.message || "Data tidak valid");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email atau password salah");
          } else {
            toast.error("Gagal masuk: " + error.message);
          }
          return;
        }
        toast.success("Berhasil masuk!");
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Email sudah terdaftar. Silakan login.");
          } else {
            toast.error("Gagal mendaftar: " + error.message);
          }
          return;
        }
        toast.success("Pendaftaran berhasil! Menunggu persetujuan admin.");
        setMode("login");
        resetForm();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logoMkl}
              alt="PT. Mulia Kasih Logistik"
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Mulia Kasih Logistik</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Masuk untuk mengakses sistem"
              : "Daftar akun baru"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="auth-email" className="text-base font-semibold">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="rounded-xl h-12"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="auth-password" className="text-base font-semibold">Password</Label>
            <Input
              id="auth-password"
              type="password"
              placeholder={
                mode === "register"
                  ? "Min 8 karakter, huruf besar, kecil, angka, spesial"
                  : "••••••••"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "login") handleSubmit();
              }}
              className="rounded-xl h-12"
            />
            {mode === "register" && (
              <p className="text-sm text-muted-foreground">
                Password harus minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter spesial.
              </p>
            )}
          </div>

          {/* Konfirmasi Password (hanya di mode register) */}
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm-password" className="text-base font-semibold">
                Konfirmasi Password
              </Label>
              <Input
                id="auth-confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className="rounded-xl h-12"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full h-12 rounded-xl text-base"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : mode === "login" ? (
              "Masuk"
            ) : (
              "Daftar"
            )}
          </Button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => {
                    setMode("register");
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => {
                    setMode("login");
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
