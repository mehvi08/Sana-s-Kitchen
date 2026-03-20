# Sana's Kitchen — PROJECT_EXPLANATION

This document describes, in technical terms, how I built the **Sana's Kitchen** web application by explaining the concrete structure of my React codebase and the exact mechanics of my Appwrite integration (auth, database reads/writes, and admin operations). Everything below is based strictly on the real files and folder structure in this project.

## 1. React Architecture: Pages vs. Components

I structured the React frontend under `src/` using a clear separation between **route-level pages** and **reusable UI components**, with admin-specific screens grouped under a dedicated feature folder.

### Directory-level structure (what lives where)

- `src/pages/`: route container components (ex: `Landing.jsx`, `Cart.jsx`, `Checkout.jsx`, `Orders.jsx`, `Profile.jsx`, `Login.jsx`, `Signup.jsx`, `MenuItemDetail.jsx`). These act as orchestration layers: they manage page-local state, run fetch effects, and compose UI components.
- `src/components/`: reusable UI building blocks and layout elements (ex: `components/layout/Header.jsx`, `components/menu/MenuCard.jsx`, plus UI primitives in `components/ui/`).
- `src/features/admin/`: admin dashboard layout + admin screens (ex: `AdminLayout.jsx`, `OrderManagement.jsx`, `MenuManagement.jsx`, `Overview.jsx`). I keep this separate so admin logic is not intermingled with customer-facing pages.
- `src/context/`: React Context providers that implement global state (`AuthContext.jsx`, `CartContext.jsx`).
- `src/api/`: thin Appwrite-facing modules for CRUD and auth calls (`auth.js`, `menu.js`, `orders.js`, `profiles.js`, `storage.js`).
- `src/appwriteClient.js`: Appwrite SDK client initialization and exported service instances.
- `src/routing/`: explicit route-guard components (`RequireAuth.jsx`, `RequireAdmin.jsx`) that I mount in the router to protect sensitive routes.

### What a “Component” means in my project (example: `MenuCard`)

In my implementation, a **Component** is a modular, reusable UI function that receives data and handlers via `props` and uses hooks only for UI-adjacent concerns (navigation, context actions). A concrete example is `src/components/menu/MenuCard.jsx`:

- I render a single menu item by passing an `item` prop (the Appwrite document) from the page layer.
- Inside the component, my logic maps `item` fields into UI:
  - The image source is resolved by `getImageSrc(item)` which chooses between an uploaded file (`imageFileId` → Appwrite Storage URL) and a direct `imageUrl`, with a placeholder fallback.
  - Display text like “piece count” is normalized by `getPieceText(item)` so multiple schema variants resolve to a stable string.
- My click handlers are deliberately separated:
  - Clicking the card navigates to the detail route via `useNavigate()` (`/item/:id`).
  - Clicking “Add to Cart” calls `e.stopPropagation()` so it does not trigger the card navigation, then uses `useCart().addItem(...)` to push a normalized cart item object into global cart state.
  - If there is no authenticated user, I route the user to `/login` before allowing cart insertion, using `useAuth()` state as the gate.

This pattern is consistent across the component layer: components receive data as props, render it, and call context APIs or router navigation for actions.

### What a “Page” means in my project (example: `Landing`)

In my implementation, a **Page** is a route-mapped container component that owns the data lifecycle for a screen: fetching, loading/error flags, and transforming the result for rendering. A representative example is `src/pages/Landing.jsx`:

- I store page state in local `useState()`:
  - `menuItems` (the fetched list of menu documents)
  - `isLoading` and `error`
  - UI-only state such as `isCartOpen` for the cart modal
- On mount, I run a `useEffect()` that calls `fetchMenuItems()` (from `src/api/menu.js`), then commits the result into `menuItems`.
- I compute grouped UI-ready data via `useMemo()`:
  - I reduce `menuItems` into a `{ [categoryName]: item[] }` map.
  - I apply an availability gate so only available items render in the menu lists.
- I render the UI by composing reusable components:
  - `Header` for the top layout
  - `MenuCard` in a grid (`items.map(item => <MenuCard ... />)`)
  - `CartModal` as an overlay controlled by local `isCartOpen`

This is the core pattern of my page layer: data is fetched and normalized in the page, then passed down to components as props.

## 2. Backend Connection (Appwrite)

I connected the frontend to Appwrite by initializing the Appwrite Web SDK once and exporting a shared set of service objects and configuration IDs.

### Appwrite SDK initialization (`src/appwriteClient.js`)

In `src/appwriteClient.js`, I create a singleton Appwrite client:

- I instantiate `new Client()` from the `appwrite` SDK.
- I configure it with Vite environment variables:
  - `client.setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)`
  - `client.setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)`
- I then construct and export service instances bound to that same client:
  - `export const account = new Account(client);`
  - `export const databases = new Databases(client);`
  - `export const storage = new Storage(client);`

Because this is module-level initialization, every import across the app shares the same configured client and service instances.

### Environment-driven configuration (`.env` → `import.meta.env`)

I pass environment variables through Vite’s `import.meta.env` and centralize IDs in `APPWRITE_CONFIG` (also exported from `src/appwriteClient.js`). The rest of the code imports `APPWRITE_CONFIG` to reference:

- Database ID (`VITE_APPWRITE_DATABASE_ID`)
- Collection IDs (`VITE_APPWRITE_MENU_COLLECTION_ID`, `VITE_APPWRITE_ORDERS_COLLECTION_ID`, `VITE_APPWRITE_PROFILES_COLLECTION_ID`)
- Storage bucket ID (`VITE_APPWRITE_MENU_IMAGES_BUCKET_ID`)
- Admin email (`VITE_ADMIN_EMAIL`)

My API modules (`src/api/*.js`) use those IDs consistently when calling `databases.listDocuments()`, `databases.createDocument()`, and `databases.updateDocument()`.

## 3. Routing & Route Protection

I implemented routing with `react-router-dom` in `src/App.jsx`, and I enforce route protection using explicit guard components plus in-page action gating.

### Routing setup (`src/App.jsx`)

In `src/App.jsx`, I wrap the entire app in:

- `AuthProvider` (global auth/session state)
- `CartProvider` (global cart state)
- `BrowserRouter` with a `Routes` table defining the full app navigation

The router maps:

- Public pages: `/`, `/login`, `/signup`, `/cart`, and `/item/:id`
- Auth-protected pages: `/checkout`, `/profile`, `/orders`
- Admin-only pages: `/admin` with nested admin routes (`/admin`, `/admin/menu`, `/admin/orders`)

### RequireAuth guard (`src/routing/RequireAuth.jsx`)

I protect authenticated routes using `RequireAuth`:

- I read `{ user, isLoading }` from `useAuth()`.
- While `isLoading` is true (session hydration is still running), I render `null` to avoid transient mis-renders.
- If there is no `user`, I redirect to `/login` using `<Navigate />`, passing the current location into `state.from`.
- If the user is present, I render `children`.

In `src/App.jsx`, I wrap `Checkout`, `Profile`, and `Orders` route elements in `<RequireAuth>...</RequireAuth>` so access is enforced at the router level.

### RequireAdmin guard (`src/routing/RequireAdmin.jsx`) and admin validation

I restrict admin routes using `RequireAdmin`:

- I compute `isAdmin` by validating the current session identity against the configured admin email:
  - `user?.email === import.meta.env.VITE_ADMIN_EMAIL`
- If there is no session or the email does not match, I redirect to `/`.
- Otherwise, I render the admin route’s children.

I mount this guard in `src/App.jsx` by wrapping the `/admin` route element in `<RequireAdmin>`.

Additionally, `src/features/admin/AdminLayout.jsx` performs its own enforcement:

- It re-computes `isAdmin` using the same email comparison.
- If `!user || !isAdmin`, it returns `<Navigate to="/" replace />` before rendering the admin shell.

This means admin access is gated both at the routing layer and inside the admin layout itself.

### Action-level protection for cart/checkout

Even where a route is public (ex: `/cart`), I still gate sensitive actions in the page logic:

- In `src/pages/Cart.jsx`, the “Proceed to Checkout” button routes unauthenticated users to `/login` and authenticated users to `/checkout`.
- In `src/components/menu/MenuCard.jsx`, “Add to Cart” also routes unauthenticated users to `/login` before inserting items into the cart.

## 4. Global State Management (React Context)

I implemented global state using React Context providers mounted at the top of the component tree (`src/App.jsx`).

### Auth State (`src/context/AuthContext.jsx`)

My `AuthContext` is responsible for tracking the authenticated Appwrite session and the user’s profile document.

- I store three primary values in provider state:
  - `user` (Appwrite account object from `account.get()`)
  - `profile` (profiles collection document, fetched by `userId`)
  - `isLoading` (initial session hydration flag)
- On initial mount, my first `useEffect()` executes an async session load:
  1. Call `account.get()` (Appwrite) to resolve the current session.
  2. If it succeeds, set `user` to the resolved account object.
  3. Fetch the profile via `fetchProfileByUserId(session.$id)` (from `src/api/profiles.js`) and store it in `profile`.
  4. If session lookup fails, I set `user` and `profile` to `null`.
  5. I finalize by setting `isLoading` to `false`.
- I run a second `useEffect()` keyed to `user?.$id` to re-fetch the profile whenever the authenticated identity changes.
- I expose imperative helpers in the context value:
  - `setUser` / `setProfile` for auth flows to commit new state
  - `refreshProfile()` which re-fetches the profile and updates `profile` in-place

My auth flows live in `src/api/auth.js` and are invoked by pages:

- `src/pages/Login.jsx` calls `login()`, then commits the returned user into context via `setUser()` and calls `refreshProfile()`.
- `src/pages/Signup.jsx` calls `signup()`, then queries `account.get()` and commits the user into context similarly.

### Cart State (`src/context/CartContext.jsx`)

My `CartContext` implements a persistent cart with deterministic add/remove/update semantics.

#### Persistence with `localStorage`

- On mount, I read `window.localStorage.getItem('local-food-cart')`.
- If data exists, I parse JSON and seed the `items` array state.
- On every `items` update, I write back `JSON.stringify(items)` to the same key, ensuring the cart persists across page refreshes and navigation.

#### Add item logic (duplicate detection vs. quantity increment)

My `addItem(item)` function merges items by `id`:

- I compute `existing = prev.find(i => i.id === item.id)`.
- If `existing` is found, I return a new array where only the matching item is updated:
  - `{ ...i, quantity: i.quantity + 1 }`
- If `existing` is not found, I append a new item with `quantity: 1`.

This guarantees that the cart never contains duplicated line items for the same menu product; instead, quantity is the single source of truth.

#### Totals computed with `.reduce()`

I compute pricing and counts using `Array.prototype.reduce()`:

- `getTotal()` returns the total amount as:
  - `items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)`
- `getTotalItems()` returns the total number of items as:
  - `items.reduce((sum, item) => sum + item.quantity, 0)`

## 5. Database Integration & Data Flow

I isolate Appwrite database calls into `src/api/*` modules and call them from pages/components. This keeps the UI layer focused on state transitions while the API layer owns the Appwrite SDK calls and identifiers.

### Fetching menu items on app load (`src/pages/Landing.jsx` → `src/api/menu.js`)

The menu fetch is implemented end-to-end as:

1. `Landing.jsx` mounts and runs a `useEffect()` with an async `load()` function.
2. `load()` calls `fetchMenuItems()` from `src/api/menu.js`.
3. `fetchMenuItems()` executes:
   - `databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.menuCollectionId, [Query.equal('isAvailable', true)])`
4. The Appwrite response returns `{ documents }`, which I return to the page.
5. `Landing.jsx` stores the list in `menuItems` state and renders it through `MenuCard` in a categorized grid.

### Writing an order (“checkout / place order”) (`src/pages/Checkout.jsx` → `src/api/orders.js`)

The order creation flow is implemented in `Checkout.jsx` and executed through the `createOrder()` API:

1. I read `items`, `getTotal()`, and `clearCart()` from `useCart()`, and `user` from `useAuth()`.
2. I build a normalized `billItems` array using `useMemo()` that maps each cart line item into:
   - `menuItemId`, `name`, `price`, `quantity`, and `lineTotal`
3. I fetch delivery info by loading the user’s profile:
   - `fetchProfileByUserId(user.$id)` (from `src/api/profiles.js`)
4. When the user clicks **Confirm & Place Order**, `handleConfirm()` executes:
   - If `!user`, I route to `/login`.
   - If `!profile`, I stop and surface an error.
   - Otherwise, I call `createOrder({...})` with:
     - `userId: user.$id`
     - `items: billItems.map(...)` (stripped down to the persisted fields)
     - `totalAmount: getTotal()`
     - `status: 'pending'`
     - `deliveryAddress` and `mobile` from the profile document
5. In `src/api/orders.js`, `createOrder()`:
   - Generates a new document id via `ID.unique()`
   - Normalizes `items`:
     - If `items` is not already a string, I serialize it using `JSON.stringify(...)`
   - Writes the order with:
     - `databases.createDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.ordersCollectionId, docId, { orderId: docId, ...payload })`
6. After a successful write, `Checkout.jsx` clears the cart and navigates the user to `/orders`.

## 6. Admin Dashboard Logic

I implemented the admin dashboard under `src/features/admin/` and protected it with both router-level guards and admin layout enforcement.

### Fetching incoming orders (`src/features/admin/OrderManagement.jsx` → `src/api/orders.js`)

In `OrderManagement.jsx`, I fetch all orders on mount:

1. A `useEffect()` runs an async `load()` function.
2. `load()` calls `fetchAllOrders()` from `src/api/orders.js`.
3. `fetchAllOrders()` executes:
   - `databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.ordersCollectionId)`
4. The documents array is stored in local `orders` state.

On the rendering side, I group orders into columns based on status by:

- Defining `STATUSES` in `OrderManagement.jsx`
- Mapping each status into a column:
  - `orders.filter(o => o.status === status)`

I also normalize `order.items` for display:

- If `order.items` is an array, I use it directly.
- Otherwise, I attempt to `JSON.parse(order.items)` (since `createOrder()` can store items as a JSON string).

### Updating order status (`OrderManagement.jsx` → `updateOrderStatus()`)

I update an order’s status through a direct Appwrite update call wrapped by my API module:

- In `OrderManagement.jsx`, `handleStatusChange(orderId, currentStatus, direction)`:
  1. Computes the next status using the current status index in `STATUSES`.
  2. Calls `updateOrderStatus(orderId, nextStatus)`.
  3. Updates local UI state immediately by mapping the `orders` array and replacing the matching order’s `status` field.

- In `src/api/orders.js`, `updateOrderStatus(id, status)` executes:
  - `databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.ordersCollectionId, id, { status })`

This produces a direct, deterministic write to the database and a synchronized UI state update in the admin screen.

