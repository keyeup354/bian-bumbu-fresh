import { Product } from '@/contexts/CartContext';

// Import product images
import tomatImg from '@/assets/products/tomat.jpg';
import bayamImg from '@/assets/products/bayam.jpg';
import tempeImg from '@/assets/products/tempe.jpg';
import tahuImg from '@/assets/products/tahu.jpg';
import bawangMerahImg from '@/assets/products/bawang-merah.jpg';
import bawangPutihImg from '@/assets/products/bawang-putih.jpg';
import cabaiImg from '@/assets/products/cabai.jpg';
import jaheImg from '@/assets/products/jahe.jpg';
import kacangPanjangImg from '@/assets/products/kacang-panjang.jpg';
import timunImg from '@/assets/products/timun.jpg';
import kubisImg from '@/assets/products/kubis.jpg';
import wortelImg from '@/assets/products/wortel.jpg';

export const categories = [
  { id: 'vegetables', name: 'Sayuran Segar', icon: '🥬', description: 'Fresh vegetables daily' },
  { id: 'spices', name: 'Bumbu & Rempah', icon: '🌶️', description: 'Authentic spices' },
  { id: 'protein', name: 'Tahu & Tempe', icon: '🫘', description: 'Fresh tofu & tempeh' },
  { id: 'essentials', name: 'Kebutuhan Dapur', icon: '🧅', description: 'Kitchen essentials' },
];

export interface ExtendedProduct extends Product {
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndsAt?: Date;
  stock?: number;
}

export const products: ExtendedProduct[] = [
  // Vegetables
  {
    id: 'v1',
    name: 'Tomat Merah Segar',
    price: 12000,
    unit: 'per 500g',
    image: tomatImg,
    category: 'vegetables',
    description: 'Tomat merah segar berkualitas tinggi, cocok untuk sambal atau masakan. Dipetik langsung dari kebun pilihan.',
    isFlashSale: true,
    flashSalePrice: 8000,
    flashSaleEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    stock: 50,
  },
  {
    id: 'v2',
    name: 'Bayam Hijau',
    price: 4000,
    unit: 'per ikat',
    image: bayamImg,
    category: 'vegetables',
    description: 'Bayam segar hijau untuk sayur bening atau tumisan. Kaya akan zat besi dan vitamin.',
    stock: 100,
  },
  {
    id: 'v3',
    name: 'Wortel Lokal',
    price: 8000,
    unit: 'per 250g',
    image: wortelImg,
    category: 'vegetables',
    description: 'Wortel manis dan renyah, cocok untuk sup, jus, atau campuran masakan.',
    stock: 80,
  },
  {
    id: 'v4',
    name: 'Kacang Panjang',
    price: 6000,
    unit: 'per ikat',
    image: kacangPanjangImg,
    category: 'vegetables',
    description: 'Kacang panjang segar untuk tumis atau lalapan.',
    isFlashSale: true,
    flashSalePrice: 4500,
    flashSaleEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    stock: 60,
  },
  {
    id: 'v5',
    name: 'Kubis Putih',
    price: 10000,
    unit: 'per kg',
    image: kubisImg,
    category: 'vegetables',
    description: 'Kubis segar untuk asinan, tumisan, atau sayur sop.',
    stock: 40,
  },
  {
    id: 'v6',
    name: 'Timun Segar',
    price: 5000,
    unit: 'per 500g',
    image: timunImg,
    category: 'vegetables',
    description: 'Timun segar dan renyah untuk lalapan atau acar.',
    stock: 70,
  },
  // Spices
  {
    id: 's1',
    name: 'Cabai Merah Keriting',
    price: 45000,
    unit: 'per kg',
    image: cabaiImg,
    category: 'spices',
    description: 'Cabai merah keriting pedas, cocok untuk sambal dan bumbu masakan.',
    isFlashSale: true,
    flashSalePrice: 35000,
    flashSaleEndsAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    stock: 30,
  },
  {
    id: 's2',
    name: 'Jahe Emprit',
    price: 25000,
    unit: 'per 250g',
    image: jaheImg,
    category: 'spices',
    description: 'Jahe emprit segar untuk bumbu masakan dan minuman hangat.',
    stock: 45,
  },
  // Protein
  {
    id: 'p1',
    name: 'Tahu Putih',
    price: 5000,
    unit: 'per 4 pcs',
    image: tahuImg,
    category: 'protein',
    description: 'Tahu putih lembut dan fresh dari pabrik. Cocok untuk goreng, bacem, atau masak sayur.',
    stock: 100,
  },
  {
    id: 'p2',
    name: 'Tempe Segar',
    price: 8000,
    unit: 'per pack',
    image: tempeImg,
    category: 'protein',
    description: 'Tempe segar berkualitas, dibuat dari kedelai pilihan. Kaya protein nabati.',
    isFlashSale: true,
    flashSalePrice: 6000,
    flashSaleEndsAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
    stock: 80,
  },
  // Essentials
  {
    id: 'e1',
    name: 'Bawang Merah',
    price: 35000,
    unit: 'per kg',
    image: bawangMerahImg,
    category: 'essentials',
    description: 'Bawang merah Brebes berkualitas tinggi untuk bumbu dapur.',
    stock: 50,
  },
  {
    id: 'e2',
    name: 'Bawang Putih',
    price: 40000,
    unit: 'per kg',
    image: bawangPutihImg,
    category: 'essentials',
    description: 'Bawang putih tunggal import, aroma kuat dan tahan lama.',
    stock: 60,
  },
];

export const featuredProducts = products.filter(p => p.isFlashSale || products.indexOf(p) < 6);

export const flashSaleProducts = products.filter(p => p.isFlashSale);

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
