import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, SlidersHorizontal, AlertTriangle, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { CatalogFilters } from '../components/CatalogFilters';
import { ToggleGroup } from '../components/ui/ToggleGroup';
import { Button } from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const DEFAULT_FILTERS = {
  q: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  sort: 'relevance',
  page: 1,
  pageSize: 12,
};

function RequestError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 text-center py-20 border border-[--color-line] rounded-lg"
    >
      <AlertTriangle className="w-8 h-8 text-[--color-accent]" aria-hidden="true" />
      <div>
        <p className="font-medium text-[--color-ink]">Couldn't load products</p>
        <p className="text-sm text-[--color-ink-muted] mt-1">{message}</p>
      </div>
      <Button size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function CatalogPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('grid');
  const [categories, setCategories] = useState(['All']);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const { status, data, error } = useProducts(filters);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((body) => setCategories(body.categories))
      .catch(() => setCategories(['All']));
  }, []);

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 'page' in patch ? patch.page : 1 }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count += 1;
    if (filters.minPrice) count += 1;
    if (filters.maxPrice) count += 1;
    if (filters.inStockOnly) count += 1;
    return count;
  }, [filters]);

  const handleRetry = () => setRetryKey((k) => k + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[--color-accent] font-medium">
          Catalog
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[--color-ink] mt-1">
          Every deck, driver, and amp we carry
        </h1>
        <p className="text-sm text-[--color-ink-muted] mt-2 max-w-2xl">
          {data ? `${data.total} products` : 'Loading the collection…'} — filter by category,
          price, or availability.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={filters.q} onChange={(q) => updateFilters({ q })} />
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            size="md"
            className="sm:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="mobile-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <ToggleGroup
            label="Layout"
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', label: 'Grid view', icon: <LayoutGrid className="w-4 h-4" /> },
              { value: 'list', label: 'List view', icon: <List className="w-4 h-4" /> },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-8">
        <aside
          id="mobile-filters"
          className={`${filtersOpen ? 'block' : 'hidden'} sm:block sm:sticky sm:top-6 sm:self-start`}
        >
          <div className="flex items-center justify-between mb-3 sm:hidden">
            <h2 className="font-medium text-[--color-ink]">Filters</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="p-1 text-[--color-ink-muted]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CatalogFilters categories={categories} filters={filters} onChange={updateFilters} />
        </aside>

        <main>
          <ErrorBoundary key={retryKey}>
            {status === 'error' && <RequestError message={error} onRetry={handleRetry} />}

            {status === 'loading' && !data && (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
                aria-busy="true"
                aria-label="Loading products"
              >
                {Array.from({ length: filters.pageSize }).map((_, i) => (
                  <ProductCardSkeleton key={i} view={view} />
                ))}
              </div>
            )}

            {status === 'success' && data.items.length === 0 && (
              <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
            )}

            {data && data.items.length > 0 && (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
                style={{ opacity: status === 'loading' ? 0.6 : 1, transition: 'opacity 150ms' }}
              >
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} view={view} />
                ))}
              </div>
            )}

            {data && data.totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 mt-8"
                aria-label="Pagination"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <span className="text-sm text-[--color-ink-muted]">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={filters.page >= data.totalPages}
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                >
                  Next
                </Button>
              </nav>
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
