export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[--color-line] ${className}`}
      aria-hidden="true"
    />
  );
}

/** Mirrors the exact shape of ProductCard so the loading state doesn't jump. */
export function ProductCardSkeleton({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div className="flex gap-4 rounded-lg border border-[--color-line] p-4">
        <Skeleton className="h-24 w-24 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 py-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-16 mt-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[--color-line] p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
