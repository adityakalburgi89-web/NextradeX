# NexTradeX UI/UX Fix Plan

## Goal
Transform NexTradeX into a premium, accessible, responsive trading platform UX. Fix critical accessibility gaps, establish a toast/notification system, improve loading states, polish mobile interactions, and unify the design language across all pages.

## Success Criteria
1. Lighthouse Accessibility score ≥ 90 on all major pages (Auth, Dashboard, Markets, Spot Trading)
2. All interactive elements have ≥ 44px touch targets
3. No layout shifts during loading (proper skeletons used)
4. Form errors announced to screen readers
5. Consistent button/surface styling across all pages
6. App gracefully handles runtime JS errors (error boundary)

---

## Chunk 1: Global UX Foundation
**Files:** 
- `frontend/src/components/ErrorBoundary.jsx` (NEW)
- `frontend/src/components/SkipNav.jsx` (NEW)
- `frontend/src/components/Toast/ToastProvider.jsx` (NEW)
- `frontend/src/components/Toast/ToastContainer.jsx` (NEW)
- `frontend/src/hooks/useToast.js` (NEW)
- `frontend/src/App.js` (MODIFY)
- `frontend/src/index.css` (MODIFY)

**Changes:**
1. **ErrorBoundary**: Class component catching errors, rendering a styled fallback with "Reload app" button and error details.
2. **SkipNav**: A11y skip-to-content link, visually hidden until focused, jumps to `<main id="main-content">`.
3. **Toast System**: Context-based toast notification system. Supports success / error / info / warning variants. Auto-dismiss 5s. Stacked max 3 visible, oldest evicted. Used by `useToast()` hook.
4. **App.js Wrapper**: Wrap `<Routes>` with ErrorBoundary, insert SkipNav at top, wrap with ToastProvider, add `<main id="main-content">`.
5. **CSS**: Add focus-visible outline styles matching Tailwind `focus-ring` utility. Ensure `prefers-reduced-motion: reduce` zeroes out ALL keyframe/transition durations, not just some.

**Acceptance Criteria:**
- App renders with skip link visible on Tab press.
- Manually thrown error inside a route shows ErrorBoundary fallback instead of blank page.
- `useToast().success("test")` renders a dismissible toast in top-right.
- `prefers-reduced-motion` disables the ambient-glow drift animation entirely.

---

## Chunk 2: Auth Page Overhaul
**Files:**
- `frontend/src/pages/AuthPage.jsx` (MODIFY)

**Changes:**
1. **Accessible Form Markup**: Every `<Input>` paired with a visible `<label htmlFor>` (or `aria-label` if hidden).
2. **Autocomplete**: `autocomplete="username"`, `autocomplete="email"`, `autocomplete="current-password"` / `new-password`.
3. **Form Validation**: Inline validation on blur (email format, password ≥ 8 chars with 1 uppercase, 1 number). Errors in red text below inputs with `role="alert"` and `aria-describedby` pointing to error element.
4. **Password Field**: Keep Eye/EyeOff toggle. Add password-strength meter (weak/medium/strong) using colored bars.
5. **Loading State**: Button disabled + spinner while submitting. No double-submit.
6. **Post-Success**: Clear form state. Show toast via `useToast()` instead of raw `alert()` or console.
7. **Error Display**: Top-level form error uses alert-box style with icon, `role="alert"`, `aria-live="polite"`.

**Acceptance Criteria:**
- Screen-reader can identify every field by its label.
- Submitting with empty fields shows validation errors before API call.
- Password meter appears on typing.
- Successful registration clears form and shows a toast.
- No layout shift when error appears below an input.

---

## Chunk 3: Dashboard Loading States & Empty States
**Files:**
- `frontend/src/components/ui/Skeleton.jsx` (MODIFY — expand existing)
- `frontend/src/components/EmptyState.jsx` (NEW)
- `frontend/src/pages/DashboardPage.jsx` (MODIFY)
- `frontend/src/components/ui/Card.jsx` (MODIFY — add subtle hover state)

**Changes:**
1. **Skeleton Expansion**: Instead of generic pulse div, create `DashboardSkeleton` with:
   - 4 `Card`-shaped skeleton blocks for stats
   - A table skeleton with header + 5 rows
   - Each skeleton block uses the exact rounded/shape of the real UI.
2. **EmptyState Component**: Illustration placeholder (icon from Lucide), headline, description, primary CTA button. Used when:
   - No wallets exist yet
   - No holdings exist yet
3. **DashboardPage**: Replace `animate-pulse` loading with `DashboardSkeleton`. Replace empty-string/error text with `EmptyState` where applicable. Add `aria-live="polite"` to the data section so screen readers announce when data arrives.
4. **Card Hover**: Add `transition-all duration-200 hover:border-primary/30` to interactive cards.

**Acceptance Criteria:**
- JS disabled or during load → skeleton layout matches final layout (no shift).
- Empty wallet shows EmptyState with "Deposit Funds" CTA.
- Cards have a visible hover glow/border on desktop.

---

## Chunk 4: Trading Pages (Spot, Futures, Options, Margin)
**Files:**
- `frontend/src/pages/SpotTradingPage.jsx` (MODIFY)
- `frontend/src/pages/FuturesTradingPage.jsx` (MODIFY parity fixes)
- `frontend/src/pages/OptionsTradingPage.jsx` (MODIFY parity fixes)
- `frontend/src/pages/MarginTradingPage.jsx` (MODIFY parity fixes)
- `frontend/src/components/ui/OrderBook.jsx` (MODIFY if needed)
- `frontend/src/components/QuantitySelector.jsx` (NEW)

**Changes:**
1. **Touch Target Minimum 44px**: All percentage buttons (25/50/75/100), buy/sell tabs, type toggles, and action buttons must have `min-h-[44px] min-w-[44px]`.
2. **QuantitySelector Component**: A reusable component that shows percentage chips and optionally a slider + input. Enforces numeric input, prevents invalid values, shows max available label.
3. **Error Messages**: Standardize all inline errors inside a `<div role="alert" className="text-trading-down text-xs mt-1">`. Never use raw `<span className="text-red-500">` inconsistently.
4. **Buy / Sell Button Styling**: Use `variant="tradingUp"` and `variant="tradingDown"` consistently. Add `min-h-[48px]` for thumb-size taps.
5. **Order Confirmation**: Before submitting a market/limit order, show a non-blocking confirmation summary modal with:
   - Type, Side, Symbol, Price, Quantity, Total
   - Confirm / Cancel buttons
6. **Balance Display**: Wherever balance is shown, clamp text-overflow and ensure labels read clearly with `aria-label`.

**Acceptance Criteria:**
- All tap targets measure ≥ 44px in rendered CSS.
- Invalid quantity (negative, NaN, > available) shows validation error before submission.
- Clicking "Buy BTC" triggers a confirmation modal with the order details recapped.
- Layout stays usable horizontally down to 375px width (no unscrollable overflow).

---

## Chunk 5: Navigation, Footer & Component Polish
**Files:**
- `frontend/src/components/Navbar.jsx` (MODIFY)
- `frontend/src/components/Footer.jsx` (MODIFY)
- `frontend/src/components/ui/Button.jsx` (MODIFY)
- `frontend/src/components/ui/Input.jsx` (MODIFY)
- `frontend/src/components/ui/Card.jsx` (MODIFY)
- `frontend/src/components/SearchModal.jsx` (MODIFY)
- `frontend/src/components/Chatbot.jsx` (MODIFY — reduced-motion)
- `frontend/src/pages/HomePage.jsx` (MODIFY — reduced-motion wrapper for framer-motion)

**Changes:**
1. **Navbar**:
   - Mobile hamburger menu opens a full-screen overlay with close button.
   - Mobile overlay sets `aria-modal="true"` and traps focus (use a simple `useEffect` + `keydown` listener).
   - User dropdown: Ensure `aria-haspopup="true"` and `aria-expanded` are set on trigger.
2. **Footer**: Responsive grid (stack on mobile, 4-col on desktop). Fix any raw `<a>` external links to have `target="_blank" rel="noopener noreferrer"`.
3. **Button Fix**: Loading spinner reserved space (`min-w` check) so button width doesn't jump when spinner appears.
4. **Input Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary/40` standard focus ring. Ensure `aria-invalid` when in error state.
5. **Card Fix**: Add `aria-label` support prop. Subtle hover lift.
6. **SearchModal**: Focus the input on open (`autoFocus`). Add `Escape` closes modal. Use proper `aria-modal`.
7. **Reduced Motion**: In `HomePage.jsx`, wrap all `motion.*` components in a custom `ReducedMotionWrapper` that passes `animate={prefersReduced ? false : {...}}`.
8. **Chatbot**: Disable floating animation when `prefers-reduced-motion`.

**Acceptance Criteria:**
- Mobile nav overlay can be opened/closed with hamburger button.
- Focus ring visible on every input and button via keyboard navigation.
- Search modal can be exited by pressing Escape.
- `prefers-reduced-motion` disables HomePage fade-ins and Chatbot float.

---

## Chunk 6: Utility & CSS Polish
**Files:**
- `frontend/src/index.css` (MODIFY)
- `frontend/src/lib/utils.js` (MODIFY)

**Changes:**
1. **Scrollbar**: Apply custom scrollbar globally, not just WebKit — add thin Firefox scrollbar via `scrollbar-width: thin; scrollbar-color: #2b3139 transparent;`.
2. **Focus Ring Global**: Override default browser outlines with Tailwind `focus-ring` style on all interactive elements.
3. **utils.js**: Add `formatDate(value)` helper using `Intl.DateTimeFormat`. Add `truncateText(str, len)` helper.
4. **Color Contrast Fix**: Adjust `--muted` to `#8c94a0` in dark mode for ≥ 4.5:1 on #0b0e11 background.

**Acceptance Criteria:**
- Firefox shows consistent thin scrollbar.
- All keyboard-tabbed elements show gold/primary outline.
- `formatDate(new Date())` returns human-readable local string.

---

## Execution Order
1. **Chunk 6** (CSS/utils — foundation for all other chunks)
2. **Chunk 1** (Global UX — error boundaries, toast, skip nav)
3. **Chunk 5** (Nav/Footer polish — visible on every page)
4. **Chunk 2 + Chunk 3** (Auth + Dashboard in parallel — first major pages)
5. **Chunk 4** (Trading pages — depends on buttons/toast from earlier)

## Parallel Groups
- Chunks 2 and 3 can execute in parallel after Chunk 1 completes.
- Chunk 6 can execute in parallel with Chunk 1.

## Verification Steps
After all chunks:
1. `npm start` compiles without errors.
2. Manual tab-through of Auth page, Dashboard, Spot trading — all focus rings visible.
3. Mobile view (375px) — no horizontal overflow, hamburger menu usable.
4. Simulate network throttling — skeletons appear and match final layout.
5. Disable animations in OS — verify no drift/float animations in HomePage or Chatbot.
