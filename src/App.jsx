import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { InventoryProvider } from './context/InventoryContext';
import { SiteHeader } from './components/SiteHeader';
import { CatalogPage } from './pages/CatalogPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(module => ({ default: module.ProductDetailsPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <InventoryProvider>
          <WishlistProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-[--color-bg] text-[--color-ink]">
                <SiteHeader />
                <Suspense fallback={<div className="p-8 text-center text-[--color-ink-muted]">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                  </Routes>
                </Suspense>
                <Toaster richColors position="bottom-right" />
              </div>
            </ErrorBoundary>
          </WishlistProvider>
        </InventoryProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
