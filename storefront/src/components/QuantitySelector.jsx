import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Quantity stepper with a real committed value (`quantity`, owned by the
 * parent) and a local text "draft" for the input. The draft exists so a
 * user can clear the field and type a new number without React snapping
 * the controlled input back to the old value on every keystroke — the
 * draft is only reconciled with `quantity` on blur/Enter, or whenever the
 * parent changes `quantity` from outside while the input isn't focused
 * (e.g. the +/- buttons, or another part of the app updating the cart).
 */
export function QuantitySelector({ quantity, onChange, min = 1, max = 99 }) {
  const [draft, setDraft] = useState(String(quantity));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setDraft(String(quantity));
    }
  }, [quantity]);

  const commit = (rawValue) => {
    const val = parseInt(rawValue, 10);
    if (isNaN(val)) {
      toast.error(`Enter a quantity between ${min} and ${max}`);
      setDraft(String(quantity));
      return;
    }
    if (val < min) {
      toast.error(`Minimum quantity is ${min}`);
      onChange(min);
      setDraft(String(min));
    } else if (val > max) {
      toast.error(`Maximum quantity is ${max}`);
      onChange(max);
      setDraft(String(max));
    } else {
      onChange(val);
      setDraft(String(val));
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    } else {
      toast.error(`Minimum quantity is ${min}`);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    } else {
      toast.error(`Maximum quantity is ${max}`);
    }
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // Let the user freely clear/type — only digits (or empty) are kept as
    // the draft. Nothing is committed to the parent until it's a complete,
    // valid number (checked live) or until blur/Enter reconciles it.
    if (raw !== '' && !/^\d+$/.test(raw)) return;
    setDraft(raw);

    if (raw === '') return; // mid-edit; wait for blur/Enter to reconcile

    const val = parseInt(raw, 10);
    if (val >= min && val <= max) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    commit(draft);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(draft);
      e.target.blur();
    }
  };

  return (
    <div className="flex items-center border border-[--color-line] rounded-md overflow-hidden bg-[--color-surface] w-fit">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="p-2 text-[--color-ink-muted] hover:bg-[--color-surface-hover] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] z-10"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        aria-label="Quantity"
        role="spinbutton"
        aria-valuenow={quantity}
        aria-valuemin={min}
        aria-valuemax={max}
        className="w-12 text-center font-mono text-sm bg-transparent border-none p-0 focus:ring-0 text-[--color-ink] [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="p-2 text-[--color-ink-muted] hover:bg-[--color-surface-hover] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] z-10"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
