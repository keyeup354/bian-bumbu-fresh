import { Product } from '@/contexts/CartContext';

export const categories = [
  { id: 'vegetables', name: 'Sayuran Segar', icon: '🥬', description: 'Fresh vegetables daily' },
  { id: 'spices', name: 'Bumbu & Rempah', icon: '🌶️', description: 'Authentic spices' },
  { id: 'protein', name: 'Tahu & Tempe', icon: '🫘', description: 'Fresh tofu & tempeh' },
  { id: 'essentials', name: 'Kebutuhan Dapur', icon: '🧅', description: 'Kitchen essentials' },
];

export interface ProductVariant {
  id: string;
  unit: string;
  price: number;
}

export interface ExtendedProduct extends Product {
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndsAt?: Date;
  stock?: number;
  healthBenefits?: string;
  nutrition?: string;
  gallery?: string[];
  variants?: ProductVariant[];
}

// Catalog data is now stored in Supabase (table: products) and loaded via
// `useProducts()` from `src/contexts/ProductsContext`.

export const promotions = [
  {
    id: 'promo1',
    title: 'Flash Sale Sayuran',
    description: 'Diskon hingga 30% untuk semua sayuran segar!',
    discountPercentage: 30,
    isActive: true,
  },
  {
    id: 'promo2',
    title: 'Gratis Ongkir',
    description: 'Gratis ongkir untuk pembelian minimal Rp 50.000',
    isActive: true,
  },
  {
    id: 'promo3',
    title: 'Paket Hemat Bumbu',
    description: 'Beli 3 gratis 1 untuk semua bumbu dapur',
    isActive: true,
  },
];
