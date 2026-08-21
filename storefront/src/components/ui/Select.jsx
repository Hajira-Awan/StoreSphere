export function Select({ id, label, hideLabel = false, options, className = '', ...rest }) {
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
      <select
        id={id}
        className={`w-full rounded-md border border-[--color-line] bg-[--color-surface]
          px-3 py-2 text-sm text-[--color-ink]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]
          focus-visible:border-transparent ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
