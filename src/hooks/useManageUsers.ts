import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

interface MyRolesInfo {
  user_id: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
}

export function useManageUsers() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [myInfo, setMyInfo] = useState<MyRolesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchMyRoles = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: undefined,
    });

    // Use query params via direct fetch for GET with params
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) return;

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
      setMyInfo(result);
    }
    return result;
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=list-users`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await res.json();
      if (res.ok) {
        setUsers(result.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupFirstAdmin = useCallback(async () => {
    setIsActionLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=setup-first-admin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Admin pertama berhasil dibuat!");
        await fetchMyRoles();
        await fetchUsers();
      } else {
        toast.error(result.error || "Gagal setup admin");
      }
    } catch (err) {
      console.error("Setup first admin error:", err);
      toast.error("Gagal setup admin");
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchMyRoles, fetchUsers]);

  const assignRole = useCallback(
    async (userId: string, role: string) => {
      setIsActionLoading(true);
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return;

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=assign-role`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId, role }),
          }
        );
        const result = await res.json();
        if (res.ok) {
          toast.success(`Role '${role}' berhasil ditambahkan`);
          await fetchUsers();
        } else {
          toast.error(result.error || "Gagal menambah role");
        }
      } catch (err) {
        console.error("Assign role error:", err);
        toast.error("Gagal menambah role");
      } finally {
        setIsActionLoading(false);
      }
    },
    [fetchUsers]
  );

  const removeRole = useCallback(
    async (userId: string, role: string) => {
      setIsActionLoading(true);
      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return;

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users?action=remove-role`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId, role }),
          }
        );
        const result = await res.json();
        if (res.ok) {
          toast.success(`Role '${role}' berhasil dihapus`);
          await fetchUsers();
        } else {
          toast.error(result.error || "Gagal menghapus role");
        }
      } catch (err) {
        console.error("Remove role error:", err);
        toast.error("Gagal menghapus role");
      } finally {
        setIsActionLoading(false);
      }
    },
    [fetchUsers]
  );

  useEffect(() => {
    fetchMyRoles();
  }, [fetchMyRoles]);

  return {
    users,
    myInfo,
    isLoading,
    isActionLoading,
    fetchUsers,
    fetchMyRoles,
    setupFirstAdmin,
    assignRole,
    removeRole,
  };
}
