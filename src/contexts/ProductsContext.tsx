import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProduct, ProductVariant } from '@/data/products';

export interface AdminProduct extends ExtendedProduct {
  inStock?: boolean;
}

// Raw DB row shape (only fields we care about)
interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  category: string;
  image_url: string | null;
  stock: number;
  in_stock: boolean;
  is_flash_sale: boolean | null;
  flash_sale_price: number | null;
  flash_sale_ends_at: string | null;
  media_urls: string[] | null;
  health_benefits: string | null;
  variants: ProductVariant[] | null;
}

const rowToProduct = (r: ProductRow): AdminProduct => ({
  id: r.id,
  name: r.name,
  description: r.description || '',
  price: Number(r.price) || 0,
  unit: r.unit,
  category: r.category,
  image: r.image_url || '',
  stock: r.stock ?? 0,
  inStock: r.in_stock !== false,
  isFlashSale: !!r.is_flash_sale,
  flashSalePrice: r.flash_sale_price ?? undefined,
  flashSaleEndsAt: r.flash_sale_ends_at ? new Date(r.flash_sale_ends_at) : undefined,
  gallery: r.media_urls && r.media_urls.length > 0 ? r.media_urls : (r.image_url ? [r.image_url] : []),
  healthBenefits: r.health_benefits || '',
  variants: Array.isArray(r.variants) ? r.variants : [],
});

const productToRow = (p: Partial<AdminProduct>) => ({
  ...(p.id ? { id: p.id } : {}),
  name: p.name ?? '',
  description: p.description ?? '',
  price: Number(p.price) || 0,
  unit: p.unit ?? 'pack',
  category: p.category ?? 'vegetables',
  image_url: p.image || null,
  stock: Number(p.stock) || 0,
  in_stock: p.inStock !== false,
  is_flash_sale: !!p.isFlashSale,
  flash_sale_price: p.flashSalePrice ?? null,
  media_urls: p.gallery ?? [],
  health_benefits: p.healthBenefits ?? '',
  variants: p.variants ?? [],
});

interface ProductsContextType {
  products: AdminProduct[];
  isLoading: boolean;
  addProduct: (product: AdminProduct) => Promise<void>;
  updateProduct: (id: string, patch: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setInStock: (id: string, inStock: boolean) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } else {
        setProducts((data as unknown as ProductRow[]).map(rowToProduct));
      }
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          setProducts((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = rowToProduct(payload.new as ProductRow);
              if (prev.some((p) => p.id === row.id)) return prev;
              return [...prev, row];
            }
            if (payload.eventType === 'UPDATE') {
              const row = rowToProduct(payload.new as ProductRow);
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as { id?: string })?.id;
              return prev.filter((p) => p.id !== oldId);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = useCallback(async (product: AdminProduct) => {
    const row = productToRow(product);
    const { error } = await supabase.from('products').insert(row as never);
    if (error) {
      console.error('addProduct error:', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, patch: Partial<AdminProduct>) => {
    const row = productToRow({ ...patch, id });
    const { id: _omit, ...updateData } = row;
    const { error } = await supabase.from('products').update(updateData as never).eq('id', id);
    if (error) {
      console.error('updateProduct error:', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('deleteProduct error:', error);
      throw error;
    }
  }, []);

  const setInStock = useCallback(async (id: string, inStock: boolean) => {
    const { error } = await supabase.from('products').update({ in_stock: inStock }).eq('id', id);
    if (error) {
      console.error('setInStock error:', error);
      throw error;
    }
  }, []);

  return (
    <ProductsContext.Provider
      value={{ products, isLoading, addProduct, updateProduct, deleteProduct, setInStock }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
};
