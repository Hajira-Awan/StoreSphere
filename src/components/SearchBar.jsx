import { Search } from 'lucide-react';
import { Input } from './ui/Input';

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-ink-faint] pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id="catalog-search"
        label="Search products"
        hideLabel
        placeholder="Search by product or brand…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
