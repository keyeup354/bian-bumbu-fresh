import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "get_order",
  title: "Get order",
  description: "Fetch full details for a single order by its ID. Admin only.",
  inputSchema: {
    id: z.string().uuid().describe("Order UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    if (!data) {
      return {
        content: [{ type: "text", text: "Order not found" }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { order: data },
    };
  },
});
