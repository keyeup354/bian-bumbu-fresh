import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { AuthProvider } from "@/hooks/useAuth";
import AddressGate from "@/components/AddressGate";
import OAuthConsent from "@/pages/OAuthConsent";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ShopRoutes = () => {
  const [hasAddress, setHasAddress] = useState<boolean | null>(null);

  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    setHasAddress(!!savedAddress);
  }, []);

  if (hasAddress === null) {
    return null; // Loading state
  }

  if (!hasAddress) {
    return <AddressGate onSubmit={() => setHasAddress(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<ShopRoutes />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
