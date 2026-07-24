import { useEffect, useRef, useState } from 'react';

/**
 * Fetches the paginated, filtered product list from the mock API.
 * Debounces the search query and cancels in-flight requests when
 * filters change again before the previous request resolves.
 */
export function useProducts(filters) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const { q, category, minPrice, maxPrice, inStockOnly, sort, page, pageSize } = filters;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({ status: 'loading', data: prev.data, error: null }));

      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category && category !== 'All') params.set('category', category);
      if (minPrice) params.set('minPrice', String(minPrice));
      if (maxPrice) params.set('maxPrice', String(maxPrice));
      if (inStockOnly) params.set('inStockOnly', 'true');
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          const contentType = res.headers.get('content-type');
          const isJson = contentType && contentType.includes('application/json');
          
          if (!res.ok) {
            const body = isJson ? await res.json().catch(() => ({})) : {};
            throw new Error(body.message || `Request failed (${res.status})`);
          }
          if (!isJson) {
            throw new Error('Received non-JSON response from server');
          }
          return res.json();
        })
        .then((data) => setState({ status: 'success', data, error: null }))
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setState({ status: 'error', data: null, error: err.message });
        });
    }, q ? 300 : 0); // debounce only text search, filters apply instantly

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, minPrice, maxPrice, inStockOnly, sort, page, pageSize]);

  return state;
}
