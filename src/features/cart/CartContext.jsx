import { createContext, useContext, useEffect, useState } from 'react';
import { addToCart, removeFromCart, loadCart, saveCart } from '../../lib/cart.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // The first render is always the empty cart; storage is read after mount so the
  // prerendered page hydrates without a mismatch. `loaded` tells "empty" from "not read yet".
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setLoaded(true);
  }, []);

  function update(next) {
    setCart(next);
    saveCart(next);
  }

  const value = {
    cart,
    loaded,
    open,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    add: (id, qty) => update(addToCart(cart, id, qty)),
    remove: (id) => update(removeFromCart(cart, id)),
    clear: () => update([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
