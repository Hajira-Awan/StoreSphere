import { forwardRef } from 'react';

/**
 * Text input primitive with a visible label (or sr-only label when
 * `hideLabel` is set) so every field stays accessible without relying
 * on placeholder text alone.
 */
export const Input = forwardRef(function Input(
  { id, label, hideLabel = false, className = '', ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={hideLabel ? 'sr-only' : 'text-sm font-medium text-[--color-ink-muted]'}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-md border border-[--color-line] bg-[--color-surface]
          px-3 py-2 text-sm text-[--color-ink] placeholder:text-[--color-ink-faint]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]
          focus-visible:border-transparent transition-shadow ${className}`}
        {...rest}
      />
    </div>
  );
});
