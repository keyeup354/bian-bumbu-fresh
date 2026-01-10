import { Plus, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, Product } from '@/contexts/CartContext';
import { useState } from 'react';
import { ExtendedProduct } from '@/data/products';
import ProductDetailModal from './ProductDetailModal';

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  
  const currentPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discount = product.isFlashSale && product.flashSalePrice 
    ? Math.round((1 - product.flashSalePrice / product.price) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div 
        className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-primary/30 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Flash Sale Badge */}
          {product.isFlashSale && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}
          
          {isInCart && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {cartItem.quantity} di keranjang
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Eye className="w-4 h-4" />
              Lihat Detail
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{product.unit}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">
                {formatPrice(currentPrice)}
              </span>
              {product.isFlashSale && product.flashSalePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button
              variant="cart"
              size="sm"
              onClick={handleAddToCart}
              className={`rounded-full transition-all ${isAdding ? 'scale-110' : ''}`}
            >
              {isAdding ? (
                <Check className="w-4 h-4" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default ProductCard;
