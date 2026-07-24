import { createContext, useContext, useMemo, useState } from 'react';

export const CartContext = createContext(null);

/**
 * Minimal cart state for Week 1 so "Add to cart" has somewhere real to go.
 * The roadmap's full Cart → Shipping → Payment → Confirmation flow is an
 * XState machine due in a later week — this intentionally stays simple
 * (a quantity map) so it's easy to swap out without touching every caller.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState({}); // { [productId]: quantity }

  const addItem = (id) => setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeItem = (id) =>
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const count = useMemo(() => Object.values(items).reduce((a, b) => a + b, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, count }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

