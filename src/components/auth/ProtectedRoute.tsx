import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import PendingApproval from "@/pages/PendingApproval";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, signOut } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);

  const checkApproval = useCallback(async () => {
    if (!user) {
      setIsCheckingApproval(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsCheckingApproval(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=my-roles`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await res.json();
      if (res.ok) {
        // Admin is always approved
        if (result.isAdmin) {
          setApprovalStatus("approved");
        } else {
          setApprovalStatus(result.approval_status || "pending");
        }
      } else {
        setApprovalStatus("pending");
      }
    } catch (err) {
      console.error("Check approval error:", err);
      setApprovalStatus("pending");
    } finally {
      setIsCheckingApproval(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkApproval();
    } else {
      setIsCheckingApproval(false);
    }
  }, [user, checkApproval]);

  if (isLoading || isCheckingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (approvalStatus && approvalStatus !== "approved") {
    return (
      <PendingApproval
        status={approvalStatus as "pending" | "rejected"}
        onSignOut={signOut}
      />
    );
  }

  return <>{children}</>;
}
