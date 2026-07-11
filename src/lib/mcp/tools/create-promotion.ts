import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isAdmin, notAdminResponse, notAuthenticatedResponse, supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "create_promotion",
  title: "Create promotion",
  description: "Create a new promotion in ButuhSayur. Admin only.",
  inputSchema: {
    title: z.string().min(1).describe("Promotion title."),
    description: z.string().optional().describe("Promotion description."),
    discount_percentage: z.number().int().min(0).max(100).optional().describe("Discount percentage."),
    banner_image_url: z.string().url().optional().describe("Banner image URL."),
    is_active: z.boolean().default(true).describe("Whether the promotion is active."),
    starts_at: z.string().optional().describe("Start time (ISO 8601)."),
    ends_at: z.string().optional().describe("End time (ISO 8601)."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("promotions")
      .insert({
        title: input.title,
        description: input.description,
        discount_percentage: input.discount_percentage,
        banner_image_url: input.banner_image_url,
        is_active: input.is_active,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
      })
      .select()
      .single();

    if (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Promotion created: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { promotion: data },
    };
  },
});
