const VARIANTS = {
  primary:
    'bg-[--color-accent] text-white hover:bg-[--color-accent-strong] focus-visible:ring-[--color-accent]',
  secondary:
    'bg-transparent border border-[--color-line] text-[--color-ink] hover:bg-[--color-surface-hover] focus-visible:ring-[--color-accent]',
  ghost:
    'bg-transparent text-[--color-ink] hover:bg-[--color-surface-hover] focus-visible:ring-[--color-accent]',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

/**
 * Base button primitive. Always renders a real <button> so it stays
 * keyboard and screen-reader accessible; icons are passed as children.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-offset-[--color-bg]
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
