import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  isAdmin,
  notAdminResponse,
  notAuthenticatedResponse,
  supabaseForUser,
} from "../supabase-client";

export default defineTool({
  name: "update_stock",
  title: "Update stock",
  description: "Set the stock quantity for a product. Admin only.",
  inputSchema: {
    id: z.string().min(1).describe("Product ID."),
    new_stock: z.number().int().min(0).describe("New stock quantity."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ id, new_stock }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("products")
      .update({ stock: new_stock, in_stock: new_stock > 0 })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Stock updated: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { product: data },
    };
  },
});
