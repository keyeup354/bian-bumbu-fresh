import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "list_orders",
  title: "List orders",
  description: "List customer orders in ButuhSayur. Admin only.",
  inputSchema: {
    status: z.enum(["pending", "processing", "completed", "cancelled"]).optional().describe("Filter by status."),
    limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of orders."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(limit);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
