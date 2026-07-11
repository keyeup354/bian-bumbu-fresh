import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  isAdmin,
  notAdminResponse,
  notAuthenticatedResponse,
  supabaseForUser,
} from "../supabase-client";

export default defineTool({
  name: "delete_product",
  title: "Delete product",
  description: "Delete a product from the ButuhSayur catalog. Admin only.",
  inputSchema: {
    id: z.string().min(1).describe("Product ID to delete."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Product ${id} deleted successfully.` }],
    };
  },
});
