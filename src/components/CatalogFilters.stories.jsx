import { useState } from 'react';
import { CatalogFilters } from './CatalogFilters';

export default {
  title: 'Catalog/Filters',
  component: CatalogFilters,
};

const CATEGORIES = ['All', 'Turntables', 'Headphones', 'Amplifiers', 'Speakers', 'Cartridges', 'Cables'];

function Controlled() {
  const [filters, setFilters] = useState({
    category: 'All',
    sort: 'relevance',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
  });

  return (
    <div className="max-w-xs">
      <CatalogFilters
        categories={CATEGORIES}
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
      />
    </div>
  );
}

export const Default = {
  render: () => <Controlled />,
};
