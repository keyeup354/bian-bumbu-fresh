import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

declare const process: { env: Record<string, string | undefined> };

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List available products in the Bian Bumbu catalog (name, price, unit, category, stock).",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Optional category filter, e.g. 'bumbu', 'sayur'."),
    limit: z.number().int().min(1).max(100).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
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
