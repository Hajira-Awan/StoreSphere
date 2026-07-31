# StoreSphere - E-Commerce Storefront

A modern e-commerce storefront built with React, Vite, and Tailwind CSS.

## Architecture

StoreSphere adopts a robust, component-driven architecture:

- **State Management (XState):** The shopping cart uses XState (`cartMachine.js`) to guarantee deterministic state transitions. The machine enforces two explicit states (`empty` and `hasItems`) and uses guards to strictly validate actions like quantity updates. This ensures the cart logic is predictable, decoupled from React, and prevents impossible states (like checking out an empty cart).
- **Routing:** Built with React Router (`react-router-dom`), the application separates the `CatalogPage` (`/`) and `ProductDetailsPage` (`/product/:id`). Code splitting via `React.lazy()` ensures that initial bundle sizes remain minimal, only loading the product detail page when requested.
- **Mock Data Layer:** We use Mock Service Worker (MSW) to intercept network requests at the browser level, serving realistic mock data and simulating latency/errors without a real backend.
- **Styling and Tokens:** Tailwind CSS provides the utility-first styling foundation, complemented by custom CSS variables (design tokens) in `index.css` for consistent theming (`--color-bg`, `--color-ink`, `--color-accent`), enabling a seamless dark mode.
- **Quantity Validation:** `QuantitySelector` keeps a local text "draft" separate from the committed quantity so a user can clear the field and type a fresh number without the controlled input snapping back mid-edit. The draft is only reconciled (and clamped to min/max, with a toast on invalid input) on blur or Enter.

## Testing

Testing is a critical part of the StoreSphere workflow, using Vitest and React Testing Library:

- **Component Tests:** `QuantitySelector` is tested through a realistic stateful parent wrapper (not just isolated prop changes), covering clear-and-retype behavior, min/max clamping on blur, Enter-to-commit, and ARIA spinbutton semantics. `ProductGallery` covers keyboard support and image swapping. `CartDrawer` covers subtotal math, remove/clear actions, and Escape-to-close.
- **State Machine Tests:** Isolated logic tests for `cartMachine` validating correct state transitions (`empty` ↔ `hasItems`) and guard rejections (invalid quantity updates).

To run tests:
```bash
npm run test
```

## Known Limitations

- **Checkout Flow:** The checkout functionality is planned for Week 3. The checkout button currently remains disabled.
- **Persistent State:** Cart state is currently not synchronized with local storage (unlike the wishlist), meaning cart contents are lost on page refresh.
- **API Completeness:** The mock API currently handles basic `GET` operations but does not yet support mutations like user accounts or order processing.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the app for production.
- `npm run lint` - Runs oxlint for fast linting.
- `npm run storybook` - Starts the Storybook environment.
- `npm run test` - Runs the Vitest test suite.

