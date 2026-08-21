/**
 * Accessible single-select toggle group, used for the grid/list view switch.
 * Implements the roving-tab-index radiogroup pattern.
 */
export function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-[--color-line] p-0.5 bg-[--color-surface]">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center rounded p-1.5 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]
              ${active ? 'bg-[--color-accent] text-white' : 'text-[--color-ink-muted] hover:bg-[--color-surface-hover]'}`}
            title={opt.label}
          >
            {opt.icon}
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
