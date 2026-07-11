import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

declare const process: { env: Record<string, string | undefined> };

export function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${ctx.getToken()}`,
        },
      },
    },
  );
}

export async function isAdmin(ctx: ToolContext): Promise<boolean> {
  if (!ctx.isAuthenticated()) return false;
  const userId = ctx.getUserId();
  if (!userId) return false;

  const supabase = supabaseForUser(ctx);
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.error("Error checking admin role:", error);
    return false;
  }

  return !!data;
}

export function requireAdmin(ctx: ToolContext): Promise<boolean> {
  return isAdmin(ctx);
}

export function notAuthenticatedResponse() {
  return {
    content: [{ type: "text" as const, text: "Not authenticated. Please connect via OAuth first." }],
    isError: true,
  };
}

export function notAdminResponse() {
  return {
    content: [{ type: "text" as const, text: "Admin role required." }],
    isError: true,
  };
}
