import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Cart, CartItem, Product } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
}

const defaultCart: Cart = {
  id: 0,
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : defaultCart;
  });

  const saveCart = (newCart: Cart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const calculateTotals = (items: CartItem[]): Cart => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { ...cart, items, totalItems, totalAmount };
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cart.items.find(item => item.productId === product.id);
    
    let newItems: CartItem[];
    if (existingItem) {
      newItems = cart.items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.unitPrice }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productBrand: product.brand,
        productImageUrl: product.imageUrl,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      };
      newItems = [...cart.items, newItem];
    }
    
    saveCart(calculateTotals(newItems));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const newItems = cart.items.map(item =>
      item.id === itemId
        ? { ...item, quantity, subtotal: quantity * item.unitPrice }
        : item
    );
    
    saveCart(calculateTotals(newItems));
  };

  const removeFromCart = (itemId: number) => {
    const newItems = cart.items.filter(item => item.id !== itemId);
    saveCart(calculateTotals(newItems));
  };

  const clearCart = () => {
    saveCart(defaultCart);
  };

  const isInCart = (productId: number) => {
    return cart.items.some(item => item.productId === productId);
  };

  const getItemQuantity = (productId: number) => {
    const item = cart.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
