import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Leaf, Thermometer, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { ExtendedProduct } from '@/data/products';
import ProductGallery from './ProductGallery';

interface ProductDetailModalProps {
  product: ExtendedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const cartItem = items.find(item => item.id === product.id);
  const currentPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discount = product.isFlashSale && product.flashSalePrice 
    ? Math.round((1 - product.flashSalePrice / product.price) * 100) 
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Get storage tips based on category
  const getStorageTips = () => {
    switch (product.category) {
      case 'vegetables':
        return {
          icon: Thermometer,
          tips: [
            'Simpan di kulkas pada suhu 1-4°C dalam wadah berlubang atau kantong plastik berlubang',
            'Cuci hanya saat akan digunakan untuk mencegah kelembaban berlebih',
            'Pisahkan dari buah-buahan karena gas etilen dapat mempercepat pembusukan',
            'Optimal dikonsumsi dalam 3-5 hari setelah pembelian',
          ]
        };
      case 'spices':
        return {
          icon: Thermometer,
          tips: [
            'Simpan di tempat kering dan sejuk, hindari sinar matahari langsung',
            'Untuk cabai: bisa disimpan di freezer hingga 3 bulan',
            'Untuk jahe: bungkus dengan tissue dan simpan di kulkas',
            'Pastikan kondisi kering sebelum disimpan untuk mencegah jamur',
          ]
        };
      case 'protein':
        return {
          icon: Thermometer,
          tips: [
            'Simpan di kulkas dan konsumsi dalam 3-4 hari',
            'Rendam dalam air bersih dan ganti air setiap hari',
            'Untuk penyimpanan lebih lama, potong dan bekukan',
            'Hindari menyimpan bersama makanan berbau tajam',
          ]
        };
      case 'essentials':
        return {
          icon: Thermometer,
          tips: [
            'Simpan di tempat kering, gelap, dan berventilasi baik',
            'Hindari menyimpan di kulkas kecuali sudah dipotong',
            'Gantung dalam jaring untuk sirkulasi udara optimal',
            'Tahan hingga 2-4 minggu jika disimpan dengan benar',
          ]
        };
      default:
        return {
          icon: Thermometer,
          tips: ['Simpan di tempat sejuk dan kering']
        };
    }
  };

  const storageTips = getStorageTips();
  const galleryImages = product.gallery || [product.image, product.image, product.image];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image Gallery */}
          <div className="p-4 md:p-6 bg-muted/30">
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <div className="p-4 md:p-6 flex flex-col">
            {/* Header */}
            <div className="mb-4">
              {product.isFlashSale && (
                <Badge className="bg-destructive text-destructive-foreground mb-2">
                  🔥 Flash Sale -{discount}%
                </Badge>
              )}
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                {product.name}
              </h2>
              <p className="text-muted-foreground">{product.unit}</p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {product.isFlashSale && product.flashSalePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {cartItem && (
                <p className="text-sm text-primary mt-1">
                  ✓ {cartItem.quantity} sudah di keranjang
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Tabs for Details */}
            <Tabs defaultValue="health" className="flex-1 mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  <span className="hidden sm:inline">Manfaat Kesehatan</span>
                  <span className="sm:hidden">Manfaat</span>
                </TabsTrigger>
                <TabsTrigger value="storage" className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span className="hidden sm:inline">Penyimpanan</span>
                  <span className="sm:hidden">Simpan</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="health" className="mt-4 space-y-3">
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Manfaat untuk Tubuh
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.healthBenefits || 'Sayuran segar yang kaya akan vitamin dan mineral penting untuk kesehatan tubuh.'}
                  </p>
                </div>
                
                {product.nutrition && (
                  <div className="bg-secondary/50 rounded-xl p-4 border border-secondary">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      Kandungan Gizi
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.nutrition}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="storage" className="mt-4">
                <div className="bg-accent/50 rounded-xl p-4 border border-accent">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <storageTips.icon className="w-4 h-4 text-primary" />
                    Tips Penyimpanan
                  </h4>
                  <ul className="space-y-2">
                    {storageTips.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-foreground">Jumlah:</span>
              <div className="flex items-center border border-border rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={decreaseQuantity}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  onClick={increaseQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                = {formatPrice(currentPrice * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="cart"
              size="lg"
              className={`w-full rounded-full text-lg py-6 transition-all ${isAdding ? 'scale-105' : ''}`}
              onClick={handleAddToCart}
            >
              {isAdding ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Ditambahkan!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Tambah ke Keranjang
                </>
              )}
            </Button>

            {/* Stock Info */}
            {product.stock && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                Stok tersedia: {product.stock} {product.unit}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
