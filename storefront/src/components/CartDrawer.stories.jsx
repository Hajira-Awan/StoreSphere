import { useState } from 'react';
import { CartDrawer } from './CartDrawer';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'sonner';

export default {
  title: 'Components/CartDrawer',
  component: CartDrawer,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <CartProvider>
          <div className="min-h-[500px] w-full bg-[--color-bg] text-[--color-ink] flex items-center justify-center relative">
            <Story />
            <Toaster richColors />
          </div>
        </CartProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);
  const { addItem, items } = useCart();

  useEffect(() => {
    if (args.seedItems && Object.keys(items).length === 0) {
      args.seedItems.forEach((item) => addItem(item.product, item.quantity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.seedItems]);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[--color-accent] text-white rounded-md"
      >
        Open Cart
      </button>
      <CartDrawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};

export const Populated = Template.bind({});
Populated.args = {
  isOpen: true,
  seedItems: [
    { product: { id: 's1', name: 'Premium Wireless Headphones', price: 299.99, image: 'https://picsum.photos/seed/h1/200' }, quantity: 1 },
    { product: { id: 's2', name: 'Ergonomic Keyboard', price: 129.99, image: 'https://picsum.photos/seed/k1/200' }, quantity: 2 },
  ]
};
