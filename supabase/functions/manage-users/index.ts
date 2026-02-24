import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const caller = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string };

    // Check if the caller is admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some((r) => r.role === "admin");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ACTION: list-users - List all users with their roles and menu access
    if (action === "list-users") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) {
        console.error("List users error:", listError);
        return new Response(JSON.stringify({ error: listError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: allRoles } = await adminClient.from("user_roles").select("*");
      const { data: allMenuAccess } = await adminClient.from("user_menu_access").select("*");
      const { data: allApprovals } = await adminClient.from("user_approvals").select("*");

      const users = authUsers.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: (allRoles || [])
          .filter((r) => r.user_id === u.id)
          .map((r) => r.role),
        menu_access: (allMenuAccess || [])
          .filter((m) => m.user_id === u.id)
          .map((m) => m.menu_key),
        approval_status: (allApprovals || []).find((a) => a.user_id === u.id)?.status || "pending",
      }));

      console.log(`Listed ${users.length} users for admin ${caller.email}`);
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: assign-role
    if (action === "assign-role") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id, role } = body;

      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id and role required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!["admin", "moderator", "user"].includes(role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: insertError } = await adminClient
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id,role" });

      if (insertError) {
        console.error("Assign role error:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} assigned role '${role}' to user ${user_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: remove-role
    if (action === "remove-role") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id, role } = body;

      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id and role required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: deleteError } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", role);

      if (deleteError) {
        console.error("Remove role error:", deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} removed role '${role}' from user ${user_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: my-roles - Get current user's roles, menu access, and approval status (no admin required)
    if (action === "my-roles") {
      const { data: myRoles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id);

      const { data: myMenuAccess } = await adminClient
        .from("user_menu_access")
        .select("menu_key")
        .eq("user_id", caller.id);

      const { data: myApproval } = await adminClient
        .from("user_approvals")
        .select("status")
        .eq("user_id", caller.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          user_id: caller.id,
          email: caller.email,
          roles: (myRoles || []).map((r) => r.role),
          isAdmin,
          menu_access: (myMenuAccess || []).map((m) => m.menu_key),
          approval_status: myApproval?.status || "pending",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: setup-first-admin - Only works if NO admin exists
    if (action === "setup-first-admin") {
      const { data: existingAdmins } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("role", "admin");

      if (existingAdmins && existingAdmins.length > 0) {
        return new Response(
          JSON.stringify({ error: "Admin sudah ada. Gunakan assign-role untuk menambah admin baru." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Promote the caller to admin
      const { error: setupError } = await adminClient
        .from("user_roles")
        .upsert({ user_id: caller.id, role: "admin" }, { onConflict: "user_id,role" });

      if (setupError) {
        console.error("Setup first admin error:", setupError);
        return new Response(JSON.stringify({ error: setupError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // The trigger will auto-assign all menu access for admin
      console.log(`First admin setup: ${caller.email} (${caller.id})`);
      return new Response(JSON.stringify({ success: true, message: "Anda sekarang adalah admin pertama!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: update-menu-access - Update menu access for a user
    if (action === "update-menu-access") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id, menu_keys } = body;

      if (!user_id || !Array.isArray(menu_keys)) {
        return new Response(JSON.stringify({ error: "user_id and menu_keys[] required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validMenuKeys = ["dashboard", "master-data", "sales-crm", "operasional", "keuangan", "laporan"];
      const filteredKeys = menu_keys.filter((k: string) => validMenuKeys.includes(k));

      // Delete all existing menu access for this user
      const { error: delError } = await adminClient
        .from("user_menu_access")
        .delete()
        .eq("user_id", user_id);

      if (delError) {
        console.error("Delete menu access error:", delError);
        return new Response(JSON.stringify({ error: delError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert new menu access entries
      if (filteredKeys.length > 0) {
        const rows = filteredKeys.map((key: string) => ({ user_id, menu_key: key }));
        const { error: insError } = await adminClient
          .from("user_menu_access")
          .insert(rows);

        if (insError) {
          console.error("Insert menu access error:", insError);
          return new Response(JSON.stringify({ error: insError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      console.log(`Admin ${caller.email} updated menu access for user ${user_id}: [${filteredKeys.join(", ")}]`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: approve-user - Approve a pending user
    if (action === "approve-user") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id } = body;

      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: approveError } = await adminClient
        .from("user_approvals")
        .upsert(
          { user_id, status: "approved", reviewed_by: caller.id, reviewed_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (approveError) {
        console.error("Approve user error:", approveError);
        return new Response(JSON.stringify({ error: approveError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} approved user ${user_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: reject-user - Reject a pending user
    if (action === "reject-user") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id } = body;

      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: rejectError } = await adminClient
        .from("user_approvals")
        .upsert(
          { user_id, status: "rejected", reviewed_by: caller.id, reviewed_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (rejectError) {
        console.error("Reject user error:", rejectError);
        return new Response(JSON.stringify({ error: rejectError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} rejected user ${user_id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: delete-user - Admin deletes a user account
    if (action === "delete-user") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id } = body;

      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent admin from deleting themselves
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Tidak dapat menghapus akun sendiri" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete related data first
      await adminClient.from("user_menu_access").delete().eq("user_id", user_id);
      await adminClient.from("user_roles").delete().eq("user_id", user_id);
      await adminClient.from("user_approvals").delete().eq("user_id", user_id);

      // Delete the auth user
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user_id);

      if (deleteUserError) {
        console.error("Delete user error:", deleteUserError);
        return new Response(JSON.stringify({ error: deleteUserError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} deleted user ${user_id}`);
      return new Response(JSON.stringify({ success: true, message: "Pengguna berhasil dihapus" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: reset-password - Admin resets a user's password
    if (action === "reset-password") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { user_id, new_password } = body;

      if (!user_id || !new_password) {
        return new Response(JSON.stringify({ error: "user_id and new_password required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new_password.length < 6) {
        return new Response(JSON.stringify({ error: "Password minimal 6 karakter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newPassword = new_password;

      const { error: updateError } = await adminClient.auth.admin.updateUserById(user_id, {
        password: newPassword,
      });

      if (updateError) {
        console.error("Reset password error:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Admin ${caller.email} reset password for user ${user_id}`);
      return new Response(JSON.stringify({ success: true, new_password: newPassword }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
