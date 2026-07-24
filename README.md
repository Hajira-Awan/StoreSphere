# StoreSphere — Week 1: Foundation & Catalog

A mobile-first e-commerce storefront for a fictional specialty audio retailer
(turntables, headphones, amps, speakers, cartridges, cables). This is the
Week 1 submission for the Parallax Labs frontend internship track.

## What was built this week

- **Tech stack chosen:** Vite + React (JavaScript, not TypeScript) with
  Tailwind CSS v4 for styling. Chose Vite over Next.js since Week 1 has no
  server-rendering or routing requirement yet — plain SPA is the leaner fit.
- **Design system:** custom token set (not a default template) — a warm
  off-white/charcoal palette with a copper accent, Fraunces (serif display),
  Inter (UI text), and JetBrains Mono (prices/specs). Includes full support
  for both Light and Dark themes.
- **Mock API:** Mock Service Worker (MSW) intercepts `fetch` in the browser —
  no real backend. Endpoints:
  - `GET /api/products` — search (`q`), category, min/max price, in-stock
    filter, sort (relevance / price asc / price desc / rating), and
    pagination. Also accepts `simulateError=true` to force a 500 response,
    used to exercise the error-boundary/retry path.
  - `GET /api/categories`
  - `GET /api/products/:id`
  - 64 products are generated deterministically (seeded PRNG) across the
    6 categories above, each with realistic specs (impedance, driver size,
    THD, etc.), price, rating, and stock status.
- **UI primitives** (`src/components/ui`): `Button`, `Input`, `Select`,
  `ToggleGroup` (used for the grid/list switch), `Skeleton`. All are
  keyboard-accessible with visible focus rings, proper `<label>` association,
  and ARIA roles where relevant (e.g. `ToggleGroup` is a `radiogroup`).
  Storybook stories exist for every primitive plus `ProductCard`.
- **Product catalog page** (`src/pages/CatalogPage.jsx`):
  - Debounced search (300ms) that doesn't fire on every keystroke.
  - Sidebar filters (category, price range, in-stock only, sort), collapsed
    into a mobile drawer below the `sm` breakpoint, and sticky on desktop so
    it stays visible while scrolling the results.
  - Grid/list view toggle.
  - Content-aware skeleton loaders shaped exactly like the real card, so the
    layout doesn't jump when data arrives.
  - Empty state with a "clear all filters" action when a search/filter
    combination returns zero results.
  - Error boundary around the results area with a "Try again" action, so a
    failed request or a render bug doesn't blank the whole page.
  - Pagination (12 items per page).
- **Product cards:** real (seeded placeholder) photography via picsum.photos
  instead of initials, a star-rating display (`StarRating`), a working
  "Add to cart" button, and a wishlist heart — both backed by small
  `CartContext`/`WishlistContext` providers (wishlist persists to
  `localStorage`; cart is in-memory since the full Cart → Shipping → Payment
  → Confirmation flow is a Week 2 deliverable per the roadmap). Cards also
  lift and get a copper glow on hover, and the image zooms slightly.

## Why these approaches

Real-time inventory sync, checkout state machines, the 3D viewer, and PWA/
offline support are later-week deliverables per the roadmap — this week is
scoped to the catalog and its supporting design system, per the Week 1
objectives. The mock API is intentionally built to already support the
filters/pagination shape that later weeks (cart, checkout) will need, so it
doesn't need to be redesigned later.

## Project structure

```
src/
  components/
    ui/              Button, Input, Select, ToggleGroup, Skeleton (+ stories)
    ProductCard.jsx
    SearchBar.jsx
    CatalogFilters.jsx
    EmptyState.jsx
    ErrorBoundary.jsx
    SiteHeader.jsx
  context/
    ThemeContext.jsx  Dark mode provider
  data/
    products.js        Seeded mock product generator (64 products)
  hooks/
    useProducts.js      Debounced fetch hook w/ abort-on-refilter
  mocks/
    handlers.js         MSW request handlers
    browser.js           MSW worker setup
  pages/
    CatalogPage.jsx
  App.jsx
  main.jsx               Starts MSW, then renders the app
  index.css               Design tokens + Tailwind v4 import
```

## Running the project

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). MSW starts
automatically before the app renders, so the catalog works with no backend.

### Other scripts

```bash
npm run build             # production build (outputs to dist/)
npm run preview           # preview the production build locally
npm run lint               # oxlint
npm run storybook          # Storybook dev server on :6006
npm run build-storybook    # static Storybook build
```

## Known limitations / next steps

- Product photos are real photographs from picsum.photos, seeded per product
  so they stay consistent across reloads — but they aren't actually pictures
  of audio gear, since this is a mock catalog with no real product
  photography yet. Swap `image` in `src/data/products.js` for real asset URLs
  when photography is available; nothing else needs to change.
- No routing yet (single catalog page) — will be added when a product detail
  page / checkout flow is introduced in a later week.
- The cart is an in-memory quantity map, not the XState-driven Cart →
  Shipping → Payment → Confirmation flow — that's an explicit Week 2
  objective per the roadmap, so it's intentionally left as a simple stub.
- Storybook's Playwright browser binaries failed to download in this sandbox
  (network-restricted), so interaction/a11y tests inside Storybook itself
  weren't run — the `oxlint` pass and the production build succeeding were
  used as the compile-time correctness check instead.
