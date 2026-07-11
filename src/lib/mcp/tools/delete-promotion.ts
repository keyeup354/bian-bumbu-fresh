import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "delete_promotion",
  title: "Delete promotion",
  description: "Delete a promotion from ButuhSayur. Admin only.",
  inputSchema: {
    id: z.string().uuid().describe("Promotion UUID to delete."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Promotion ${id} deleted successfully.` }],
    };
  },
});
