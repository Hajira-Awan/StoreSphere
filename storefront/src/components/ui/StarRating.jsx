import { Star, StarHalf } from 'lucide-react';

/** Renders a 5-star rating as actual star icons rather than a bare number. */
export function StarRating({ rating, reviewCount, size = 14 }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const roundedUp = rating - full >= 0.75;
  const filledCount = full + (roundedUp ? 1 : 0);

  return (
    <div
      className="flex items-center gap-1 text-[--color-ink-muted]"
      role="img"
      aria-label={`Rated ${rating} out of 5 stars${reviewCount != null ? `, ${reviewCount} reviews` : ''}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < filledCount) {
            return (
              <Star key={i} width={size} height={size} className="fill-[--color-accent] text-[--color-accent]" />
            );
          }
          if (hasHalf && i === filledCount) {
            return (
              <StarHalf key={i} width={size} height={size} className="fill-[--color-accent] text-[--color-accent]" />
            );
          }
          return <Star key={i} width={size} height={size} className="text-[--color-line]" />;
        })}
      </span>
      <span className="text-xs">
        {rating}
        {reviewCount != null && <span> ({reviewCount})</span>}
      </span>
    </div>
  );
}
