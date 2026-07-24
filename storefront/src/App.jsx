import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SiteHeader } from './components/SiteHeader';
import { CatalogPage } from './pages/CatalogPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-[--color-bg] text-[--color-ink]">
              <SiteHeader />
              <CatalogPage />
            </div>
          </ErrorBoundary>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
