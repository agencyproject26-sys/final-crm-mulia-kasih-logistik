import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ALL_MENU_KEYS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "master-data", label: "Master Data" },
  { key: "sales-crm", label: "Sales & CRM" },
  { key: "operasional", label: "Operasional" },
  { key: "keuangan", label: "Keuangan" },
  { key: "laporan", label: "Laporan" },
] as const;

export type MenuKey = typeof ALL_MENU_KEYS[number]["key"];

export function useMenuAccess() {
  const [menuAccess, setMenuAccess] = useState<MenuKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenuAccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
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
        // Admin gets all menus
        if (result.isAdmin) {
          setMenuAccess(ALL_MENU_KEYS.map((m) => m.key));
        } else {
          setMenuAccess(result.menu_access || []);
        }
      }
    } catch (err) {
      console.error("Fetch menu access error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuAccess();
  }, [fetchMenuAccess]);

  const hasAccess = useCallback(
    (menuKey: MenuKey) => menuAccess.includes(menuKey),
    [menuAccess]
  );

  return { menuAccess, isLoading, hasAccess, refetch: fetchMenuAccess };
}
