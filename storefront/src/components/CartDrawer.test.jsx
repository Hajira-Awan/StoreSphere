import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartDrawer } from './CartDrawer';
import * as useCartHook from '../hooks/useCart';

vi.mock('../hooks/useCart', () => ({
  useCart: vi.fn(),
}));

describe('CartDrawer', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    brand: 'Test Brand',
    image: 'test.jpg'
  };

  it('does not render when isOpen is false', () => {
    useCartHook.useCart.mockReturnValue({ items: {} });
    const { container } = render(<CartDrawer isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders empty state correctly', () => {
    useCartHook.useCart.mockReturnValue({
      items: {},
      count: 0,
      subtotal: 0,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    });

    render(<CartDrawer isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('renders line items with correct subtotal math', () => {
    useCartHook.useCart.mockReturnValue({
      items: {
        '1': { product: mockProduct, quantity: 2 }
      },
      count: 2,
      subtotal: 200,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    });

    render(<CartDrawer isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // price format
    expect(screen.getByText('Your Cart (2)')).toBeInTheDocument();
    
    // Subtotal
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('clicking remove removes the item', () => {
    const removeItemMock = vi.fn();
    useCartHook.useCart.mockReturnValue({
      items: {
        '1': { product: mockProduct, quantity: 2 }
      },
      count: 2,
      subtotal: 200,
      updateQuantity: vi.fn(),
      removeItem: removeItemMock,
      clearCart: vi.fn(),
    });

    render(<CartDrawer isOpen={true} onClose={() => {}} />);
    
    const removeBtn = screen.getByLabelText(`Remove Test Product from cart`);
    fireEvent.click(removeBtn);
    expect(removeItemMock).toHaveBeenCalledWith('1');
  });

  it('clicking clear cart empties it', () => {
    const clearCartMock = vi.fn();
    useCartHook.useCart.mockReturnValue({
      items: {
        '1': { product: mockProduct, quantity: 2 }
      },
      count: 2,
      subtotal: 200,
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: clearCartMock,
    });

    render(<CartDrawer isOpen={true} onClose={() => {}} />);
    
    const clearBtn = screen.getByText('Clear Cart');
    fireEvent.click(clearBtn);
    expect(clearCartMock).toHaveBeenCalled();
  });
  
  it('Escape key closes the drawer', () => {
    const onCloseMock = vi.fn();
    useCartHook.useCart.mockReturnValue({ items: {}, count: 0, subtotal: 0 });

    render(<CartDrawer isOpen={true} onClose={onCloseMock} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalled();
  });
});
