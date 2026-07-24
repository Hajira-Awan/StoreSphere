import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { SiteHeader } from './SiteHeader';

export default {
  title: 'Catalog/Navbar',
  component: SiteHeader,
};

export const Default = {
  render: () => (
    <ThemeProvider>
      <CartProvider>
        <SiteHeader />
      </CartProvider>
    </ThemeProvider>
  ),
};
