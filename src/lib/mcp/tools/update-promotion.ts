import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "update_promotion",
  title: "Update promotion",
  description: "Update an existing promotion in ButuhSayur. Admin only.",
  inputSchema: {
    id: z.string().uuid().describe("Promotion UUID."),
    title: z.string().min(1).optional().describe("New title."),
    description: z.string().optional().describe("New description."),
    discount_percentage: z.number().int().min(0).max(100).optional().describe("New discount percentage."),
    banner_image_url: z.string().url().optional().describe("New banner image URL."),
    is_active: z.boolean().optional().describe("New active status."),
    starts_at: z.string().optional().describe("New start time (ISO 8601)."),
    ends_at: z.string().optional().describe("New end time (ISO 8601)."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const { id, ...updates } = input;
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("promotions")
      .update(updates)
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
      content: [{ type: "text" as const, text: `Promotion updated: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { promotion: data },
    };
  },
});
