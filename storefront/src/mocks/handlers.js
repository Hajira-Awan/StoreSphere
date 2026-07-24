import { http, HttpResponse, delay } from 'msw';
import { PRODUCTS, CATEGORY_LIST } from '../data/products';

// Small artificial latency so loading/skeleton states are visible in the UI.
const NETWORK_DELAY = 450;

export const handlers = [
  http.get('/api/products', async ({ request }) => {
    await delay(NETWORK_DELAY);

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const category = url.searchParams.get('category');
    const minPrice = Number(url.searchParams.get('minPrice')) || 0;
    const maxPrice = Number(url.searchParams.get('maxPrice')) || Infinity;
    const inStockOnly = url.searchParams.get('inStockOnly') === 'true';
    const sort = url.searchParams.get('sort') || 'relevance';
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 12;

    // Simulate an occasional server error so error-boundary/retry paths are testable.
    if (url.searchParams.get('simulateError') === 'true') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }

    let results = PRODUCTS.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchesCategory = !category || category === 'All' || p.category === category;
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
      const matchesStock = !inStockOnly || p.inStock;
      return matchesQuery && matchesCategory && matchesPrice && matchesStock;
    });

    switch (sort) {
      case 'price-asc':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const pageItems = results.slice(start, start + pageSize);

    return HttpResponse.json({
      items: pageItems,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  }),

  http.get('/api/categories', async () => {
    await delay(150);
    return HttpResponse.json({ categories: ['All', ...CATEGORY_LIST] });
  }),

  http.get('/api/products/:id', async ({ params }) => {
    await delay(300);
    const product = PRODUCTS.find((p) => String(p.id) === params.id);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),
];
