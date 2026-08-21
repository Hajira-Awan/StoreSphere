import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FocusTrap from 'focus-trap-react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { QuantitySelector } from './QuantitySelector';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function CartDrawer({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, clearCart, count, subtotal } = useCart();
  const cartItems = Object.values(items);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap focusTrapOptions={{ 
      initialFocus: false, 
      returnFocusOnDeactivate: true,
      fallbackFocus: () => document.body
    }}>
      <div>
        <div 
          className="fixed inset-0 bg-[--color-bg]/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div 
          className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[--color-surface] border-l border-[--color-line] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[--color-line]">
            <h2 className="font-serif text-xl text-[--color-ink] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Your Cart ({count})
            </h2>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 -mr-2 text-[--color-ink-muted] hover:text-[--color-ink] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[--color-ink-muted] gap-4">
                <ShoppingBag className="w-12 h-12 opacity-20" />
                <p>Your cart is empty.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[--color-accent] text-white rounded-md text-sm font-medium hover:bg-[--color-accent-strong] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-accent]"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4">
                  <div className="w-20 h-20 shrink-0 rounded-md border border-[--color-line] overflow-hidden bg-[--color-surface-hover]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-[--color-ink] truncate">{product.name}</h3>
                      <p className="font-mono text-sm font-semibold">{formatPrice(product.price)}</p>
                    </div>
                    <p className="text-xs text-[--color-ink-faint]">{product.brand}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <QuantitySelector 
                        quantity={quantity} 
                        onChange={(newQty) => updateQuantity(product.id, newQty)} 
                      />
                      <button
                        onClick={() => removeItem(product.id)}
                        aria-label={`Remove ${product.name} from cart`}
                        className="p-1.5 text-[--color-ink-muted] hover:text-red-500 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-[--color-line] p-4 sm:p-6 bg-[--color-surface-hover]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[--color-ink-muted]">Subtotal</span>
                <span className="font-mono text-lg font-semibold text-[--color-ink]">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-[--color-ink-faint] mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3 bg-[--color-accent] text-white rounded-md font-medium text-center shadow-md hover:bg-[--color-accent-strong] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-accent]"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FocusTrap>
  );
}
