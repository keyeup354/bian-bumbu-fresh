import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";

export default defineMcp({
  name: "butuhsayur-mcp",
  title: "Bian Bumbu MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Bian Bumbu online store. Use `list_products` to browse the catalog and `get_product` to fetch details for a specific product by ID. Delivery is limited to Bandung.",
  tools: [listProductsTool, getProductTool],
});
