import { Select } from './ui/Select';
import { Input } from './ui/Input';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
];

export function CatalogFilters({ categories, filters, onChange }) {
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <div className="flex flex-col gap-5">
      <Select
        id="filter-category"
        label="Category"
        value={filters.category}
        options={categoryOptions}
        onChange={(e) => onChange({ category: e.target.value })}
      />

      <Select
        id="filter-sort"
        label="Sort by"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(e) => onChange({ sort: e.target.value })}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-[--color-ink-muted] mb-1">Price range</legend>
        <div className="flex items-center gap-2">
          <Input
            id="filter-min-price"
            label="Min price"
            hideLabel
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />
          <span className="text-[--color-ink-faint]">–</span>
          <Input
            id="filter-max-price"
            label="Max price"
            hideLabel
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-[--color-ink] cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ inStockOnly: e.target.checked })}
          className="w-4 h-4 rounded border-[--color-line] text-[--color-accent] focus-visible:ring-2 focus-visible:ring-[--color-accent]"
        />
        In stock only
      </label>
    </div>
  );
}
