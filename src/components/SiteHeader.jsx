import { Link } from 'react-router-dom';
import { Disc3, Sun, Moon, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../hooks/useCart';
import { CartDrawer } from './CartDrawer';
import { ConnectionStatus } from './ConnectionStatus';

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="border-b border-[--color-line] bg-[--color-bg]/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[--color-ink]">
          <Disc3 className="w-6 h-6 text-[--color-accent]" strokeWidth={1.5} />
          <span className="font-serif text-lg tracking-tight">StoreSphere</span>
        </Link>
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-md text-[--color-ink-muted] hover:bg-[--color-surface-hover]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
            className="relative p-2 rounded-md text-[--color-ink-muted] hover:bg-[--color-surface-hover]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                  min-w-[16px] h-4 px-1 rounded-full bg-[--color-accent] text-white text-[10px] font-medium"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
