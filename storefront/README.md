# StoreSphere - Week 3: Optimistic UI & Checkout

StoreSphere is a modern e-commerce storefront built with React, Vite, Tailwind CSS, and XState. Week 3 delivers instant, snappy cart interactions using Optimistic UI updates with automatic rollback, paired with a robust multi-step checkout flow governed by XState state machines and comprehensive client-side form validation.

---

## Deliverables & Features Built (Week 3)

### 1. Optimistic UI Updates & Automatic Rollback
- **Instant Cart Interactions:** Cart operations (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`) immediately mutate the local state in `cartMachine.js`, giving users instant visual feedback without waiting for server latency.
- **Automatic Rollback:** Before applying mutations, the state machine saves a snapshot of `previousItems`. `CartContext.jsx` asynchronously syncs cart changes with the MSW backend at `/api/cart`.
- **Failure Recovery:** If the backend sync fails (or returns status 500), `cartMachine` receives a `ROLLBACK` event, reverting `items` back to `previousItems` and surfacing an error toast notification to the user.

### 2. Multi-Step Checkout Flow Governed by XState (`checkoutMachine.js`)
- **State Machine Engine:** Managed by XState v5, enforcing explicit state transitions across steps:
  - `shipping` (Step 1: Shipping Address)
  - `payment` (Step 2: Payment Details)
  - `review` (Step 3: Order Review & Pricing Breakdown)
  - `submitting` (API processing state)
  - `confirmation` (Step 4: Order Receipt & Confirmation)
- **Step Guards:** Prevents moving to subsequent steps if required fields are missing or invalid.
- **Navigation Controls:** Supports back-and-forth step navigation without losing form state.

### 3. Comprehensive Client-Side Form Validation
- **Shipping Validation (`validateShipping`):** Enforces rules for Full Name (≥2 chars), Email (regex pattern), Street Address (≥5 chars), City, State, ZIP/Postal Code, and Country.
- **Payment Validation (`validatePayment`):** Enforces Cardholder Name, 15-16 digit Card Number, MM/YY Expiry Date (checking format and future expiration date), and 3-4 digit CVC.
- **Real-Time Feedback:** Highlights invalid fields with border indicators and inline error messages, clearing error states as the user types valid input.

### 4. Mock Service Worker (MSW) Endpoints
- `POST /api/cart`: Handles backend cart state synchronization with support for simulating error scenarios (`?simulateError=true`).
- `POST /api/checkout`: Processes order placement, generating a unique Order ID (`ORD-XXXXXX`), order timestamp, item breakdown, taxes (8%), shipping fees, and grand total.

### 5. Responsive Desktop & Mobile UX (`CheckoutPage.jsx`)
- **Responsive Stepper:** Visual progress bar adapting seamlessly between desktop widescreen and mobile screen sizes (<640px).
- **Adaptive Layout:** 2-column grid on desktop (`lg:grid-cols-12`) with sticky order summary sidebar, transforming into a single stacked column on mobile devices.
- **Order Confirmation:** Receipt screen displaying order ID, estimated delivery (3-5 business days), item summary, and button to return to catalog.

---

## Project Structure

```
storefront/
├── src/
│   ├── components/
│   │   ├── CartDrawer.jsx       # Side-drawer cart with "Proceed to Checkout" button
│   │   ├── QuantitySelector.jsx # Controlled quantity input with draft buffer
│   │   ├── SiteHeader.jsx       # Header navigation & cart count badge
│   │   └── ...
│   ├── context/
│   │   └── CartContext.jsx      # React context wrapping cartMachine with async API sync
│   ├── machines/
│   │   ├── cartMachine.js       # XState machine for cart & optimistic rollback
│   │   ├── cartMachine.test.js  # Unit tests for cart transitions & rollback
│   │   ├── checkoutMachine.js   # XState machine for multi-step checkout & validation
│   │   └── checkoutMachine.test.js # Unit tests for checkout steps & validation
│   ├── mocks/
│   │   └── handlers.js          # MSW mock handlers for products, cart, and checkout
│   ├── pages/
│   │   ├── CatalogPage.jsx      # Product listing catalog
│   │   ├── ProductDetailsPage.jsx # Individual product details page
│   │   └── CheckoutPage.jsx     # Multi-step checkout view
│   └── App.jsx                  # React Router routes (/ , /product/:id, /checkout)
└── package.json
```

---

## Instructions to Run Code & Tests

### 1. Install Dependencies
```bash
cd storefront
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit Test Suite
```bash
npm run test
```
Or run Vitest directly:
```bash
npx vitest run
```
*Runs all 42 unit tests covering `cartMachine`, `checkoutMachine`, `CartDrawer`, `QuantitySelector`, and `ProductGallery`.*

### 4. Build for Production
```bash
npm run build
```

---

## Verification & Testing Summary
- **Unit Tests:** 42/42 tests passing cleanly across 5 test files.
- **Build:** Production bundle built successfully with Vite.
- **Responsiveness:** Tested on mobile breakpoints (<640px) and desktop layouts.
