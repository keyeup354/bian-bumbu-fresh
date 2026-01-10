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
  healthBenefits?: string;
  nutrition?: string;
  gallery?: string[];
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
    healthBenefits: 'Tomat kaya akan likopen yang merupakan antioksidan kuat untuk mencegah kanker dan penyakit jantung. Membantu menjaga kesehatan kulit, meningkatkan penglihatan, dan menurunkan tekanan darah. Kandungan vitamin C-nya mendukung sistem kekebalan tubuh.',
    nutrition: 'Vitamin C (28% AKG), Vitamin K (12% AKG), Kalium (8% AKG), Likopen 3mg, Serat 1.5g per 100g',
    gallery: [tomatImg, tomatImg, tomatImg, tomatImg],
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
    healthBenefits: 'Bayam adalah superfood yang kaya zat besi untuk mencegah anemia. Mengandung kalsium untuk tulang kuat, vitamin A untuk kesehatan mata, dan antioksidan yang melawan radikal bebas. Sangat baik untuk ibu hamil dan anak-anak dalam masa pertumbuhan.',
    nutrition: 'Zat Besi (36% AKG), Vitamin A (188% AKG), Vitamin K (460% AKG), Kalsium (10% AKG), Folat (49% AKG) per 100g',
    gallery: [bayamImg, bayamImg, bayamImg, bayamImg],
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
    healthBenefits: 'Wortel sangat baik untuk kesehatan mata karena tinggi beta-karoten yang diubah menjadi vitamin A. Membantu menurunkan kolesterol, menjaga kesehatan jantung, dan meningkatkan sistem kekebalan. Serat tinggi membantu pencernaan yang sehat.',
    nutrition: 'Vitamin A (334% AKG), Vitamin K (13% AKG), Vitamin C (9% AKG), Serat 2.8g, Beta-karoten 8.3mg per 100g',
    gallery: [wortelImg, wortelImg, wortelImg, wortelImg],
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
    healthBenefits: 'Kacang panjang membantu mengontrol gula darah karena indeks glikemik rendah. Tinggi serat untuk pencernaan sehat, protein nabati untuk vegetarian, dan vitamin K untuk pembekuan darah yang baik. Juga mengandung folat penting untuk ibu hamil.',
    nutrition: 'Vitamin C (21% AKG), Vitamin K (47% AKG), Folat (15% AKG), Protein 2.5g, Serat 3.4g per 100g',
    gallery: [kacangPanjangImg, kacangPanjangImg, kacangPanjangImg, kacangPanjangImg],
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
    healthBenefits: 'Kubis mengandung senyawa sulforafan yang membantu mencegah kanker. Kaya vitamin C dan K untuk kekebalan tubuh dan kesehatan tulang. Rendah kalori tapi tinggi serat, sangat baik untuk program diet. Mengandung antioksidan yang melawan peradangan.',
    nutrition: 'Vitamin C (61% AKG), Vitamin K (95% AKG), Folat (10% AKG), Serat 2.5g, Kalori 25 per 100g',
    gallery: [kubisImg, kubisImg, kubisImg, kubisImg],
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
    healthBenefits: 'Timun mengandung 95% air sehingga sangat baik untuk hidrasi tubuh. Membantu menurunkan tekanan darah, menjaga kesehatan kulit dari dalam, dan mengurangi peradangan. Kandungan antioksidannya melindungi sel dari kerusakan.',
    nutrition: 'Vitamin K (16% AKG), Vitamin C (4% AKG), Kalium (4% AKG), Air 95%, Kalori 16 per 100g',
    gallery: [timunImg, timunImg, timunImg, timunImg],
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
    healthBenefits: 'Cabai mengandung capsaicin yang membantu membakar lemak dan meningkatkan metabolisme. Kaya vitamin C untuk kekebalan tubuh, membantu meredakan nyeri, dan melancarkan peredaran darah. Juga memiliki efek anti-bakteri alami.',
    nutrition: 'Vitamin C (240% AKG), Vitamin A (32% AKG), Vitamin B6 (24% AKG), Capsaicin 0.1-0.5%, Kalori 40 per 100g',
    gallery: [cabaiImg, cabaiImg, cabaiImg, cabaiImg],
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
    healthBenefits: 'Jahe ampuh meredakan mual dan masuk angin. Memiliki sifat anti-inflamasi untuk meredakan nyeri sendi dan otot. Membantu pencernaan, meningkatkan sirkulasi darah, dan memperkuat sistem imun. Sangat baik dikonsumsi saat cuaca dingin.',
    nutrition: 'Vitamin C (8% AKG), Magnesium (11% AKG), Kalium (9% AKG), Gingerol 1-3%, Kalori 80 per 100g',
    gallery: [jaheImg, jaheImg, jaheImg, jaheImg],
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
    healthBenefits: 'Tahu adalah sumber protein nabati berkualitas tinggi, ideal untuk vegetarian. Mengandung isoflavon yang membantu menjaga kesehatan jantung dan tulang. Rendah kalori tapi mengenyangkan, cocok untuk diet sehat. Juga mengandung kalsium dan zat besi.',
    nutrition: 'Protein 8g, Kalsium (20% AKG), Zat Besi (9% AKG), Isoflavon 20-30mg, Kalori 76 per 100g',
    gallery: [tahuImg, tahuImg, tahuImg, tahuImg],
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
    healthBenefits: 'Tempe adalah superfood Indonesia dengan protein lengkap setara daging. Proses fermentasi meningkatkan penyerapan nutrisi dan mengandung probiotik baik untuk usus. Membantu menurunkan kolesterol, mengontrol gula darah, dan menyediakan vitamin B12 alami.',
    nutrition: 'Protein 19g, Vitamin B12 (4% AKG), Zat Besi (12% AKG), Serat 7g, Kalori 193 per 100g',
    gallery: [tempeImg, tempeImg, tempeImg, tempeImg],
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
    healthBenefits: 'Bawang merah memiliki sifat antibakteri dan antivirus alami. Membantu mengontrol gula darah, menurunkan kolesterol, dan menjaga kesehatan jantung. Mengandung quercetin sebagai antioksidan kuat. Juga membantu melancarkan pencernaan.',
    nutrition: 'Vitamin C (12% AKG), Vitamin B6 (12% AKG), Mangan (10% AKG), Quercetin 30-40mg, Kalori 40 per 100g',
    gallery: [bawangMerahImg, bawangMerahImg, bawangMerahImg, bawangMerahImg],
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
    healthBenefits: 'Bawang putih adalah antibiotik alami yang memperkuat sistem imun. Mengandung allicin yang membantu menurunkan tekanan darah dan kolesterol. Memiliki sifat anti-kanker, membantu detoksifikasi tubuh, dan meningkatkan kesehatan tulang.',
    nutrition: 'Vitamin C (31% AKG), Vitamin B6 (62% AKG), Mangan (23% AKG), Allicin 5-9mg per siung, Kalori 149 per 100g',
    gallery: [bawangPutihImg, bawangPutihImg, bawangPutihImg, bawangPutihImg],
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
