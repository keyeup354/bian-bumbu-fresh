import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  isAdmin,
  notAdminResponse,
  notAuthenticatedResponse,
  supabaseForUser,
} from "../supabase-client";

export default defineTool({
  name: "create_product",
  title: "Create product",
  description: "Create a new product in the ButuhSayur catalog. Admin only.",
  inputSchema: {
    name: z.string().min(1).describe("Product name, e.g. 'Bayam Merah'."),
    price: z.number().positive().describe("Price in IDR."),
    unit: z.string().min(1).default("pack").describe("Unit, e.g. 'pack', 'kg', 'ikat'."),
    category: z.string().min(1).describe("Category, e.g. 'vegetables', 'bumbu', 'fruit'."),
    description: z.string().optional().describe("Product description."),
    stock: z.number().int().min(0).default(100).describe("Initial stock quantity."),
    image_url: z.string().url().optional().describe("Primary image URL."),
    is_featured: z.boolean().default(false).describe("Whether to feature this product."),
    is_flash_sale: z.boolean().default(false).describe("Whether this is a flash sale product."),
    flash_sale_price: z.number().positive().optional().describe("Flash sale price in IDR."),
    flash_sale_ends_at: z.string().optional().describe("Flash sale end time (ISO 8601)."),
    health_benefits: z.string().optional().describe("Health benefits text."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticatedResponse();
    if (!(await isAdmin(ctx))) return notAdminResponse();

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        price: input.price,
        unit: input.unit,
        category: input.category,
        description: input.description,
        stock: input.stock,
        image_url: input.image_url,
        is_featured: input.is_featured,
        is_flash_sale: input.is_flash_sale,
        flash_sale_price: input.flash_sale_price,
        flash_sale_ends_at: input.flash_sale_ends_at,
        health_benefits: input.health_benefits,
        in_stock: input.stock > 0,
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
      content: [{ type: "text" as const, text: `Product created: ${JSON.stringify(data, null, 2)}` }],
      structuredContent: { product: data },
    };
  },
});
