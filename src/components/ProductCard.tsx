import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, Product } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-primary/30">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {isInCart && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            {cartItem.quantity} di keranjang
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{product.unit}</p>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
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
  );
};

export default ProductCard;
