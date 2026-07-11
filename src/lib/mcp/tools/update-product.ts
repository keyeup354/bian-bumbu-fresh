import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  isAdmin,
  notAdminResponse,
  notAuthenticatedResponse,
  supabaseForUser,
} from "../supabase-client";

export default defineTool({
  name: "update_product",
  title: "Update product",
  description: "Update an existing product in the ButuhSayur catalog. Admin only.",
  inputSchema: {
    id: z.string().min(1).describe("Product ID to update."),
    name: z.string().min(1).optional().describe("New product name."),
    price: z.number().positive().optional().describe("New price in IDR."),
    unit: z.string().min(1).optional().describe("New unit."),
    category: z.string().min(1).optional().describe("New category."),
    description: z.string().optional().describe("New description."),
    stock: z.number().int().min(0).optional().describe("New stock quantity."),
    image_url: z.string().url().optional().describe("New primary image URL."),
    is_featured: z.boolean().optional().describe("Whether to feature this product."),
    is_flash_sale: z.boolean().optional().describe("Whether this is a flash sale product."),
    flash_sale_price: z.number().positive().optional().describe("Flash sale price in IDR."),
    flash_sale_ends_at: z.string().optional().describe("Flash sale end time (ISO 8601)."),
    in_stock: z.boolean().optional().describe("Whether the product is in stock."),
    health_benefits: z.string().optional().describe("Health benefits text."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const { id, ...updates } = input;
    const updateData: Record<string, unknown> = { ...updates };

    if (typeof updates.stock === "number") {
      updateData.in_stock = updates.stock > 0;
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
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
      content: [{ type: "text" as const, text: `Product updated: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { product: data },
    };
  },
});
