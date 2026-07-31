import { createContext, useMemo, useEffect, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import { cartMachine } from '../machines/cartMachine';
import { toast } from 'sonner';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, send] = useMachine(cartMachine);

  // Derive cart state properties from context
  const items = state.context.items;
  
  const count = useMemo(
    () => Object.values(items).reduce((acc, curr) => acc + curr.quantity, 0),
    [items]
  );
  
  const subtotal = useMemo(
    () => Object.values(items).reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0),
    [items]
  );

  // Dispatch functions to match existing API (mostly)
  const addItem = useCallback((product, quantity = 1) => {
    send({ type: 'ADD_ITEM', product, quantity });
    toast.success(`${quantity} ${product.name} added to cart`);
  }, [send]);

  const removeItem = useCallback((productId) => {
    send({ type: 'REMOVE_ITEM', productId });
    toast.info('Item removed from cart');
  }, [send]);
  
  const updateQuantity = useCallback((productId, quantity) => {
    send({ type: 'UPDATE_QUANTITY', productId, quantity });
    // In React 18 / XState 5, we can check the context after the render, or rely on useEffect.
    // However, the cleanest approach is to just use a useEffect to listen to lastError.
  }, [send]);
  
  const clearCart = useCallback(() => {
    send({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  }, [send]);

  // Watch for validation errors from the state machine
  useEffect(() => {
    if (state.context.lastError) {
      toast.error(state.context.lastError);
      // We could clear the error by sending a CLEAR_ERROR event, 
      // but for simplicity, we just display it when it changes.
    }
  }, [state.context.lastError, state.value]); // Added state.value in case it changes, but really we want to react to transition

  const value = useMemo(
    () => ({ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      count, 
      subtotal 
    }),
    [items, count, subtotal, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

