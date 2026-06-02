import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  description?: string;
}

export interface CartVariant {
  id: string;
  unit: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
  productId: string; // underlying product id (for stock decrement)
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: CartVariant, qty?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const makeCartId = (productId: string, variantId?: string) =>
  variantId ? `${productId}::${variantId}` : productId;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product, variant?: CartVariant, qty: number = 1) => {
    const cartId = makeCartId(product.id, variant?.id);
    const price = variant ? variant.price : product.price;
    const unit = variant ? variant.unit : product.unit;
    setItems(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) {
        return prev.map(item =>
          item.id === cartId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          id: cartId,
          productId: product.id,
          variantId: variant?.id,
          price,
          unit,
          quantity: qty,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setItems(prev => prev.filter(item => item.id !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.id !== cartId));
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === cartId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
