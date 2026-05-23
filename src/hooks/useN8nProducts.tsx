import { useEffect, useState } from 'react';
import { ExtendedProduct } from '@/data/products';

const GET_PRODUK_URL = 'https://n8n.arry.my.id/webhook/get-produk';

interface RawProduk {
  id?: string | number;
  nama_produk?: string;
  harga?: string | number;
  foto_url?: string;
  deskripsi?: string;
  // tolerate alternate field names
  name?: string;
  price?: string | number;
  image?: string;
  description?: string;
  category?: string;
  unit?: string;
}

const mapProduk = (raw: RawProduk, idx: number): ExtendedProduct => {
  const priceRaw = raw.harga ?? raw.price ?? 0;
  const price = typeof priceRaw === 'string' ? Number(priceRaw.replace(/[^\d]/g, '')) || 0 : Number(priceRaw) || 0;
  return {
    id: String(raw.id ?? `n8n-${idx}`),
    name: raw.nama_produk ?? raw.name ?? 'Produk',
    price,
    unit: raw.unit ?? 'per pack',
    image: raw.foto_url ?? raw.image ?? '/placeholder.svg',
    category: raw.category ?? 'vegetables',
    description: raw.deskripsi ?? raw.description ?? '',
  };
};

export const useN8nProducts = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(GET_PRODUK_URL, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: RawProduk[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.produk)
              ? data.produk
              : [];
        if (!cancelled) setProducts(list.map(mapProduk));
      } catch (e) {
        console.error('Failed to fetch n8n products:', e);
        if (!cancelled) setError(e instanceof Error ? e.message : 'Gagal memuat produk');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, isLoading, error };
};
