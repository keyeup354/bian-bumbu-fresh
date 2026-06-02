import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { products as seedProducts, ExtendedProduct } from '@/data/products';

const STORAGE_KEY = 'bb_products_v1';

export interface AdminProduct extends ExtendedProduct {
  inStock?: boolean;
}

interface ProductsContextType {
  products: AdminProduct[];
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  setInStock: (id: string, inStock: boolean) => void;
  decrementStock: (entries: { productId: string; quantity: number }[]) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const loadInitial = (): AdminProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminProduct[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load products from storage', e);
  }
  return seedProducts.map((p) => ({ ...p, inStock: true }));
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<AdminProduct[]>(() => loadInitial());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to persist products', e);
    }
  }, [products]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addProduct = useCallback((product: AdminProduct) => {
    setProducts((prev) => [{ ...product, inStock: product.inStock ?? true }, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setInStock = useCallback((id: string, inStock: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock } : p)));
  }, []);

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, setInStock }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
};
