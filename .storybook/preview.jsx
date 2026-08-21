import '../src/index.css';
import { CartProvider } from '../src/context/CartContext';
import { WishlistProvider } from '../src/context/WishlistContext';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    },

    backgrounds: {
      default: 'cadence-light',
      values: [
        { name: 'cadence-light', value: '#FAF8F5' },
        { name: 'cadence-dark', value: '#14120F' },
      ],
    },
  },

  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      return <Story />;
    },
    (Story) => (
      <CartProvider>
        <WishlistProvider>
          <Story />
        </WishlistProvider>
      </CartProvider>
    ),
  ],

  globalTypes: {
    theme: {
      description: 'Light or dark theme',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        showName: true,
      },
    },
  },

  initialGlobals: {
    theme: 'light',
  },
};

export default preview;