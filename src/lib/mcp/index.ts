import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import createProductTool from "./tools/create-product";
import updateProductTool from "./tools/update-product";
import deleteProductTool from "./tools/delete-product";
import updateStockTool from "./tools/update-stock";
import listOrdersTool from "./tools/list-orders";
import getOrderTool from "./tools/get-order";
import updateOrderStatusTool from "./tools/update-order-status";
import listPromotionsTool from "./tools/list-promotions";
import createPromotionTool from "./tools/create-promotion";
import updatePromotionTool from "./tools/update-promotion";
import deletePromotionTool from "./tools/delete-promotion";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "butuhsayur-mcp",
  title: "ButuhSayur MCP",
  version: "0.2.0",
  instructions:
    "Tools for the ButuhSayur online store. Use catalog tools to browse products. Admin tools (create/update/delete products, manage stock, orders, and promotions) require an authenticated user with the admin role. Delivery is limited to Bandung.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listProductsTool,
    getProductTool,
    createProductTool,
    updateProductTool,
    deleteProductTool,
    updateStockTool,
    listOrdersTool,
    getOrderTool,
    updateOrderStatusTool,
    listPromotionsTool,
    createPromotionTool,
    updatePromotionTool,
    deletePromotionTool,
  ],
});
