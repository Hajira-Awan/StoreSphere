import { SearchX } from 'lucide-react';
import { Button } from './ui/Button';

export function EmptyState({ onReset }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center text-center gap-3 py-20 px-4 border border-dashed border-[--color-line] rounded-lg"
    >
      <SearchX className="w-10 h-10 text-[--color-ink-faint]" aria-hidden="true" />
      <div>
        <p className="font-medium text-[--color-ink]">No products match these filters</p>
        <p className="text-sm text-[--color-ink-muted] mt-1">
          Try a broader search term or clear a filter to see more results.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  );
}
