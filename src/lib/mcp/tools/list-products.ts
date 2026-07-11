import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-client";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List available products in the ButuhSayur catalog (name, price, unit, category, stock).",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Optional category filter, e.g. 'bumbu', 'sayur'."),
    limit: z.number().int().min(1).max(100).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("products")
      .select("id,name,price,unit,category,stock,in_stock,description")
      .eq("in_stock", true)
      .limit(limit);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
