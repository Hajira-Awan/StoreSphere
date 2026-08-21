# StoreSphere - Real-Time Inventory & E-Commerce Storefront

StoreSphere is a modern, high-performance e-commerce storefront built with **React 19**, **Vite**, **Tailwind CSS**, **Three.js / React Three Fiber**, and **XState v5**. It features real-time inventory streaming via WebSockets with exponential backoff resiliency, optimistic cart UI updates with automatic rollback, a multi-step checkout state machine, an interactive 3D product viewer, and a full Storybook & Vitest testing suite.

---

## Key Features & Architecture

### 1. Real-Time WebSocket Stock Updates & Resilience (`inventoryMachine.js`)
- **Live Inventory Streaming:** Real-time stock state updates broadcast from an Express + WebSocket server (`server.js` on `ws://localhost:4000`).
- **Resilient Connection Lifecycle:** Governed by XState (`inventoryMachine.js`), handling states (`disconnected`, `connecting`, `connected`, `reconnecting`).
- **Exponential Backoff Reconnection:** Automatically attempts reconnection on failure with exponential backoff ($1\text{s}, 2\text{s}, 4\text{s}, 8\text{s} \dots$ capped at $30\text{s}$, max 10 retries).
- **Validation & Simulation:** Validates incoming payloads (`validateInventoryUpdate`) and features an automated server simulator generating dynamic stock changes every 8–15 seconds.
- **Connection Status Indicator (`ConnectionStatus.jsx`):** Interactive header badge indicating connection state (*Live*, *Connecting*, *Reconnecting with attempt count/retry timer*, *Offline*) with auto-subtle dimming after 3 seconds of connection.
- **Network Disconnect Resiliency:** Ensures smooth UX and state preservation during network drops, validated via checkout disconnect tests (`checkoutDisconnect.test.jsx`).

### 2. Optimistic UI Updates & Automatic Rollback (`cartMachine.js`)
- **Instant Cart Interactions:** Operations (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`) immediately update local UI state for zero-latency user feedback.
- **Automatic Rollback:** Saves state snapshots (`previousItems`) prior to mutation. If MSW/backend sync (`/api/cart`) fails or returns 500, the machine triggers a `ROLLBACK` event, restoring state and displaying error toasts.

### 3. Multi-Step Checkout State Machine (`checkoutMachine.js`)
- **Guarded 4-Step Wizard:** Step navigation (`shipping` → `payment` → `review` → `submitting` → `confirmation`) enforced by XState v5 guards.
- **Comprehensive Validation:**
  - `validateShipping`: Enforces rules for name, email regex, street address, city, state, ZIP, and country.
  - `validatePayment`: Enforces cardholder name, 15-16 digit card number, MM/YY expiry check, and 3-4 digit CVC.
- **Responsive Layout:** Adaptive desktop sidebar layout and single-column mobile view with sticky order summary and live receipt generation (`ORD-XXXXXX`).

### 4. Interactive WebGL 3D Product Viewer (`Product3DViewer.jsx`)
- **Three.js & React Three Fiber Integration:** High-performance 3D canvas viewer built with Three.js, `@react-three/fiber`, and `@react-three/drei`.
- **Procedural 3D Audio Models & GLTF Asset Loading:** Supports external `.glb`/`.gltf` model loading while providing rich, category-tailored procedural 3D representations for all 6 Cadence Audio product categories (`Turntables`, `Headphones`, `Amplifiers`, `Speakers`, `Cartridges`, `Cables`) styled with product colorways (`Matte Black`, `Walnut`, `Brushed Copper`, `Slate Grey`, `Cream`).
- **Lazy Loading & Zero Bundle Bloat:** Lazily code-split via `React.lazy()` and `Suspense` so Three.js runtime assets are only loaded when opening "3D View".
- **Accessible Loading Skeleton & WebGL Fallback:** Features `Product3DViewerSkeleton` loading state (`role="status"`) and `Product3DViewerFallback` UI when WebGL is unavailable or disabled.
- **Accessibility & Keyboard Controls:** Full ARIA screen reader announcements (`aria-describedby`), focus indicators, keyboard rotation (`Arrow keys`), zoom (`+`/`-`), and camera reset (`R`). Automatically respects `prefers-reduced-motion: reduce`.
- **Mobile Performance & Resource Lifecycle:** Capped device pixel ratio (`dpr={[1, 2]}`), touch rotation/pinch zoom, and complete Three.js geometry/material resource disposal on unmount.

### 5. Component Isolation & Storybook
- Storybook integration (`@storybook/react-vite`) with visual stories for `CartDrawer`, `ProductCard`, `ProductGallery`, `Product3DViewer`, `QuantitySelector`, `CatalogFilters`, `SiteHeader`, and `ConnectionStatus`.

---

## Week 5 — WebGL & 3D Product Viewer

### Implemented Requirements:
1. **Interactive 3D Product Viewer (`src/components/Product3DViewer.jsx`)**:
   - Integrated naturally into `ProductDetailsPage.jsx` as a tabbed Media View (`[ Product Images ]` / `[ 3D View ]`).
   - Powered by Three.js, `@react-three/fiber`, and `@react-three/drei`.
   - Supports touch/pointer rotation, scroll & pinch zoom, auto-rotation toggle, camera reset, smooth lighting, and soft shadows.

2. **Reusable Architecture**:
   - Accepts generic `product`, `modelUrl`, `fallbackImages`, and `onSwitchToImages` props.
   - Works across any product object within StoreSphere catalog data.

3. **Intelligent Asset & Procedural Fallback Handling**:
   - Supports real GLTF `.glb/.gltf` assets via `@react-three/drei`'s `useGLTF`.
   - Procedurally generates 3D models for all 6 catalog categories when GLTF assets are absent, applying dynamic materials corresponding to product colorways (`Matte Black`, `Walnut`, `Brushed Copper`, `Slate Grey`, `Cream`).

4. **Lazy Loading & Skeleton Placeholder**:
   - Lazy-loaded via `React.lazy(() => import('../components/Product3DViewer'))` and `Suspense`.
   - `Product3DViewerSkeleton.jsx` displays a smooth loading indicator using StoreSphere design tokens without layout shift.

5. **WebGL Detection & Fallback**:
   - Automatically tests WebGL rendering capability via `checkWebGLSupport()`.
   - Displays `Product3DViewerFallback.jsx` with an accessible explanation and quick action to switch back to image gallery if WebGL is unsupported or disabled.
   - Wrapped in React `ErrorBoundary` and internal Canvas ErrorBoundary to isolate WebGL runtime errors.

6. **Accessibility**:
   - **Keyboard Navigation**: `ArrowLeft` / `ArrowRight` (rotate Y), `ArrowUp` / `ArrowDown` (rotate X), `+` / `-` (zoom), `R` (reset camera).
   - **Screen Reader**: `aria-label` region, `aria-describedby` description instructions, accessible toolbar buttons, and `role="status"` loading announcements.
   - **Reduced Motion**: Detects `prefers-reduced-motion: reduce` and disables auto-rotation.

7. **Mobile & Resource Optimization**:
   - Throttled DPR (`dpr={[1, Math.min(2, window.devicePixelRatio)]}`).
   - Touch drag rotation and pinch-to-zoom.
   - WebGL context loss listener and geometry/material disposal on unmount to prevent memory leaks.

---

## Project Structure

```
storefront/
├── server.js                     # Express + WebSocket server for inventory streaming & simulation
├── src/
│   ├── components/
│   │   ├── CartDrawer.jsx        # Slide-over cart drawer with optimistic total calculation
│   │   ├── ConnectionStatus.jsx  # Real-time WebSocket connection status badge
│   │   ├── Product3DViewer.jsx   # Interactive WebGL 3D viewer component (Three.js & R3F)
│   │   ├── Product3DViewerSkeleton.jsx # Skeleton placeholder for 3D viewer loading
│   │   ├── Product3DViewerFallback.jsx # WebGL unsupported / failure fallback view
│   │   ├── ProductCard.jsx       # Catalog product card with live stock badge
│   │   ├── ProductGallery.jsx    # Image gallery with zoom & thumbnail switching
│   │   ├── QuantitySelector.jsx  # Debounced quantity input control
│   │   ├── SiteHeader.jsx        # Navigation header with connection badge & cart counter
│   │   └── ui/                   # Shared UI primitives (buttons, badges, inputs)
│   ├── context/
│   │   ├── CartContext.jsx       # Cart state provider with MSW backend sync
│   │   └── InventoryContext.jsx  # Real-time inventory provider powered by WebSocket
│   ├── hooks/
│   │   ├── useInventory.js       # Hook accessing live stock state & connection status
│   │   ├── useWebSocket.js       # Resilient WebSocket connection & reconnect management
│   │   └── useCart.js            # Hook for cart operations & state machine
│   ├── machines/
│   │   ├── cartMachine.js        # XState machine for optimistic cart & rollback
│   │   ├── checkoutMachine.js    # XState machine for multi-step checkout wizard
│   │   └── inventoryMachine.js   # XState machine for WebSocket lifecycle & backoff
│   ├── mocks/
│   │   └── handlers.js           # MSW mock API handlers for cart, products, checkout
│   ├── pages/
│   │   ├── CatalogPage.jsx       # Product catalog with search, filter, and live stock
│   │   ├── ProductDetailsPage.jsx# Single product detail view with live inventory indicator & 3D view
│   │   └── CheckoutPage.jsx      # Multi-step checkout page with order summary
│   └── App.jsx                   # React Router setup & global providers
├── package.json
└── README.md
```

---

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Running the Application

#### Option A: Full App (Vite + WebSocket Backend)
Run both the Vite frontend server and WebSocket backend server concurrently:
```bash
npm run dev:full
```

#### Option B: Standalone Servers
Start the WebSocket server only:
```bash
npm run server
```
Start the Vite dev server only:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing & Quality Assurance

### Unit & Integration Test Suite
Run all Vitest test suites:
```bash
npm run test
```
*Current test suite results: **103 tests passing across 11 test files** covering `Product3DViewer`, `useWebSocket`, `inventoryMachine`, `cartMachine`, `checkoutMachine`, `ConnectionStatus`, `checkoutDisconnect`, `QuantitySelector`, `CartDrawer`, `websocket.integration`, and `ProductGallery`.*

### Linter Audit
Run Oxlint code check:
```bash
npm run lint
```
*Clean execution with 0 errors.*

### Storybook UI Component Explorer
Launch Storybook to inspect component states:
```bash
npm run storybook
```
Open [http://localhost:6006](http://localhost:6006).

Build Storybook static distribution:
```bash
npm run build-storybook
```

### Production Build
Validate production bundling:
```bash
npm run build
```

---

## Summary of Verification & Test Results
- **Unit & Integration Tests:** 103/103 tests passing across 11 test suites.
- **3D Viewer Tests:** Tested WebGL detection, fallback UI, loading skeleton, keyboard navigation listeners, reset controls, and screen reader announcements.
- **WebSocket Resilience:** Tested reconnect handling with exponential backoff & disconnect handling during checkout.
- **Optimistic UI:** Tested rollback under 500 error responses from MSW mock handlers.
- **Production Build:** Verified clean Vite production build with 3D viewer dynamic code splitting (`Product3DViewer.js` and `three.js` chunked separately).
- **Storybook Build:** Verified successful production Storybook compilation (`storybook-static`).
