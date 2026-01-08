import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Share2, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import CartSlideout from '@/components/CartSlideout';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { products, ExtendedProduct } from '@/data/products';
import ProductCard from '@/components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id) as ExtendedProduct | undefined;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8">Maaf, produk yang Anda cari tidak tersedia.</p>
          <Link to="/products">
            <Button>Kembali ke Produk</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = product.isFlashSale && product.flashSalePrice 
    ? product.flashSalePrice 
    : product.price;

  const discountPercentage = product.isFlashSale && product.flashSalePrice
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
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        unit: product.unit,
        image: product.image,
        category: product.category,
        description: product.description,
      });
    }
    setIsCartOpen(true);
  };

  // Related products (same category, excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSlideout />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Flash Sale Badge */}
            {product.isFlashSale && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-terracotta text-white px-3 py-1.5 text-sm font-bold animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  FLASH SALE -{discountPercentage}%
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">
                {product.category === 'vegetables' && '🥬 Sayuran'}
                {product.category === 'spices' && '🌶️ Bumbu & Rempah'}
                {product.category === 'protein' && '🫘 Tahu & Tempe'}
                {product.category === 'essentials' && '🧅 Kebutuhan Dapur'}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground">{product.unit}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl md:text-4xl font-bold text-primary">
                {formatPrice(displayPrice)}
              </span>
              {product.isFlashSale && product.flashSalePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock Info */}
            {product.stock && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.stock > 20 ? 'bg-green-500' : 'bg-terracotta'}`} />
                <span className="text-sm text-muted-foreground">
                  Stok: {product.stock} tersedia
                </span>
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-2">Deskripsi Produk</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Jumlah:</span>
              <div className="flex items-center gap-2 bg-muted rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">
                = {formatPrice(displayPrice * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="cart"
              size="xl"
              className="w-full rounded-xl"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Tambah ke Keranjang
            </Button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <span className="text-2xl mb-1 block">🥬</span>
                <span className="text-xs text-muted-foreground">Selalu Segar</span>
              </div>
              <div className="text-center">
                <span className="text-2xl mb-1 block">🚚</span>
                <span className="text-xs text-muted-foreground">Antar Cepat</span>
              </div>
              <div className="text-center">
                <span className="text-2xl mb-1 block">💯</span>
                <span className="text-xs text-muted-foreground">Kualitas Terjamin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
