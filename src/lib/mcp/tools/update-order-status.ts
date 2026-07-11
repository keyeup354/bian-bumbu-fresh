import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "update_order_status",
  title: "Update order status",
  description: "Change the status of an order. Admin only.",
  inputSchema: {
    id: z.string().uuid().describe("Order UUID."),
    status: z.enum(["pending", "processing", "completed", "cancelled"]).describe("New status."),
    notes: z.string().optional().describe("Optional notes to append."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ id, status, notes }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const updateData: Record<string, unknown> = { status };
    if (notes) {
      const { data: existing } = await supabase.from("orders").select("notes").eq("id", id).maybeSingle();
      const existingNotes = existing?.notes ?? "";
      updateData.notes = existingNotes ? `${existingNotes}\n${notes}` : notes;
    }

    const { data, error } = await supabase.from("orders").update(updateData).eq("id", id).select().single();
    if (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Order status updated: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { order: data },
    };
  },
});
