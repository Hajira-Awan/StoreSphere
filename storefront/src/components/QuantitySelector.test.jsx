import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { QuantitySelector } from './QuantitySelector';

// Renders QuantitySelector exactly the way real consumers (CartDrawer,
// ProductDetailsPage) do: as a controlled input driven by a real stateful
// parent, not a prop that stays frozen across events. Bugs in the
// clear-and-retype flow only show up when the parent actually re-renders
// between keystrokes, so tests need to go through a real parent like this
// one rather than firing disconnected events at a static prop.
function ControlledHarness({ initial = 3, min, max, onCommit }) {
  const [qty, setQty] = useState(initial);
  return (
    <QuantitySelector
      quantity={qty}
      onChange={(val) => {
        setQty(val);
        onCommit?.(val);
      }}
      min={min}
      max={max}
    />
  );
}

describe('QuantitySelector', () => {
  it('renders with the given quantity', () => {
    render(<ControlledHarness initial={3} />);
    expect(screen.getByRole('spinbutton')).toHaveValue('3');
  });

  it('increments via the + button', () => {
    render(<ControlledHarness initial={1} />);
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(screen.getByRole('spinbutton')).toHaveValue('2');
  });

  it('decrements via the - button', () => {
    render(<ControlledHarness initial={3} />);
    fireEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(screen.getByRole('spinbutton')).toHaveValue('2');
  });

  it('disables decrement button at minimum quantity', () => {
    render(<ControlledHarness initial={1} min={1} />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('disables increment button at maximum quantity', () => {
    render(<ControlledHarness initial={10} max={10} />);
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });

  it('lets a user clear the field and type a new number, through a real re-rendering parent', () => {
    render(<ControlledHarness initial={3} />);
    const input = screen.getByRole('spinbutton');

    // Select-all + delete: the field goes empty. This is the exact step
    // that was previously broken — the input used to snap back to "3"
    // immediately because the component had no local draft state.
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');

    // Now type a new number, one keystroke at a time, the way a browser
    // actually delivers events.
    fireEvent.change(input, { target: { value: '1' } });
    expect(input).toHaveValue('1');
    fireEvent.change(input, { target: { value: '15' } });
    expect(input).toHaveValue('15');

    fireEvent.blur(input);
    expect(input).toHaveValue('15');
  });

  it('reconciles an empty field back to the last valid quantity on blur', () => {
    render(<ControlledHarness initial={4} />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('4');
  });

  it('commits on Enter without requiring blur', () => {
    render(<ControlledHarness initial={2} />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('7');
  });

  it('clamps typed values below the minimum on blur', () => {
    render(<ControlledHarness initial={5} min={2} />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '0' } });
    // A value of 0 is below min, so it isn't committed live — the draft
    // holds '0' until blur, at which point it's clamped to the minimum.
    fireEvent.blur(input);

    expect(input).toHaveValue('2');
  });

  it('clamps typed values above the maximum on blur', () => {
    render(<ControlledHarness initial={5} max={10} />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('10');
  });

  it('ignores non-numeric characters entirely', () => {
    render(<ControlledHarness initial={3} />);
    const input = screen.getByRole('spinbutton');

    fireEvent.change(input, { target: { value: 'abc' } });

    // Non-numeric input should never even update the draft.
    expect(input).toHaveValue('3');
  });

  it('exposes correct ARIA spinbutton semantics', () => {
    render(<ControlledHarness initial={3} min={1} max={10} />);
    const input = screen.getByRole('spinbutton');

    expect(input).toHaveAttribute('aria-valuenow', '3');
    expect(input).toHaveAttribute('aria-valuemin', '1');
    expect(input).toHaveAttribute('aria-valuemax', '10');
  });
});
