import { createContext, useContext, useEffect, useState } from 'react';

export const WishlistContext = createContext(null);

function readStored() {
  try {
    const raw = window.localStorage.getItem('cadence-wishlist');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(readStored);

  useEffect(() => {
    window.localStorage.setItem('cadence-wishlist', JSON.stringify([...wishlist]));
  }, [wishlist]);

  const toggle = (id) =>
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isWishlisted = (id) => wishlist.has(id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

