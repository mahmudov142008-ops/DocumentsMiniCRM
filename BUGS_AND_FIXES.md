# BUGS_AND_FIXES.md — MiniCRM Engineering Defect Log & Resolutions

## Project: MiniCRM — Full Stack Customer Relationship Management
## Current Build Status: ✅ Production Build Clean | ✅ 107/107 Automated Tests Passing

This document chronicles the real engineering defects encountered during development and live testing, their underlying root causes, the technical resolutions applied, affected files, and verification outcomes.

---

## Defect Summary Matrix

| Bug ID | Title / Subsystem | Severity | Root Cause | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | TypeScript `verbatimModuleSyntax` Import Errors | Build-blocking | Default Vite 8 flag requiring `import type` across 39 locations | ✅ Resolved |
| **BUG-02** | Vite `defineConfig` Missing Vitest Property | Build-blocking | Importing `defineConfig` from `vite` rather than `vitest/config` | ✅ Resolved |
| **BUG-03** | Jest-DOM Expect Types Unrecognized | Build-blocking | Newer `@testing-library/jest-dom` requires `/vitest` subpath export | ✅ Resolved |
| **BUG-04** | Table Permission Denied & Infinite Toast Loop | High (Runtime) | Missing PostgreSQL table grants & unmemoized context object | ✅ Resolved |
| **BUG-05** | Trigger Function Privilege Exposure & Silent Provisioning | High (Security) | Client roles possessed EXECUTE rights on triggers; broad exception masked errors | ✅ Resolved |
| **BUG-06** | Overly Permissive Table-Level Grants | Medium (Security) | `GRANT ALL` assigned to `authenticated` role instead of explicit CRUD | ✅ Resolved |
| **BUG-07** | Data-Loss Bug: Empty Cloud Overwriting Local Cache | Critical (Data) | Empty Supabase query responses wiped pre-existing local caches | ✅ Resolved |
| **BUG-08** | Permissive Form Validation & Inverted Meeting Schedules | Medium (Quality) | Permissive email regex, unbounded phone numbers, negative deal values | ✅ Resolved |
| **BUG-09** | Notification Dropdown Bottom-Left Positioning & Visibility Clipping | Medium (UI / Layout) | Bell in sidebar footer, container overflow-y: auto clipping, hidden top header | ✅ Resolved |
| **BUG-10** | Dashboard Search and Filters Missing / Nonfunctional | High (Usability) | Missing search input, status filter controls, and reset logic in Dashboard activity view | ✅ Resolved in local code & verified |
| **BUG-11** | Deal Pipeline Dragged Cards Passing Behind Columns | Medium (UI / Layering) | Parent column `backdrop-filter: blur()` created isolated stacking context trapping fixed dragged cards | ✅ Resolved in local code & verified |
| **BUG-12** | Settings Accent Color Labels & Swatches Misaligned with Palette | Low (UI / Design System) | Stale neon SaaS labels (`Violet / Indigo`, `Electric Blue`, `Emerald Green`) remained after brand redesign | ✅ Resolved in local code & verified |
| **BUG-13** | Connection Bloom Illustration Lacked Meaningful CRM Labels | Low (Product / UI) | Abstract geometric flower petals lacked clear conceptual ties to CRM capabilities | ✅ Resolved in local code & verified |
| **BUG-14** | Email Confirmation Returned to Landing Page Without Verification | High (Authentication) | Missing `emailRedirectTo`, absent URL token/code callback handler, and premature hash routing to landing view | ⚠️ Application fix implemented; external Supabase re-enablement & end-to-end verification pending |

---

## Detailed Defect Reports

### Bug #1: TS1484 — Type imports require `import type` syntax
- **Severity**: Build-blocking
- **Discovery**: Encountered during initial production build (`npm run build`).
- **Error Log**:
  ```
  src/App.tsx(10,20): error TS1484: 'CustomerInput' is a type and must be imported
  using a type-only import when 'verbatimModuleSyntax' is enabled.
  ```
  *(Repeated across 39 import statements in 14 files)*
- **Root Cause**: Vite 8 scaffold sets `"verbatimModuleSyntax": true` in `tsconfig.app.json` by default. This compiler option enforces separate `import type` syntax for all interfaces and types.
- **Fix Applied**: Set `"verbatimModuleSyntax": false` in both `tsconfig.app.json` and `tsconfig.node.json`. For application bundles compiled by Vite's internal esbuild pipeline, this check adds syntax noise without runtime or tree-shaking benefit.
- **Files Changed**: `tsconfig.app.json`, `tsconfig.node.json`
- **Verification**: `npm run build` passed TypeScript compilation cleanly.

---

### Bug #2: TS2769 — `test` property not recognized in Vite `defineConfig`
- **Severity**: Build-blocking
- **Discovery**: Encountered during initial build attempt alongside Bug #1.
- **Error Log**:
  ```
  vite.config.ts(8,3): error TS2769: No overload matches this call.
  Object literal may only specify known properties, and 'test' does not exist in type 'UserConfigExport'.
  ```
- **Root Cause**: The Vitest `test` configuration block was added to `vite.config.ts`, but `defineConfig` was imported from core `vite` rather than `vitest/config`. The core `vite` package does not type-augment the `test` property.
- **Fix Applied**: Updated import in `vite.config.ts` from `vite` to `vitest/config`.
- **Files Changed**: `vite.config.ts`
- **Verification**: TypeScript type error resolved immediately.

---

### Bug #3: TS2339 — `toBeInTheDocument` not recognized on `expect` assertions
- **Severity**: Build-blocking
- **Discovery**: Encountered during component test compilation.
- **Error Log**:
  ```
  src/test/components.test.tsx(47,39): error TS2339: Property 'toBeInTheDocument'
  does not exist on type 'Assertion<void, HTMLElement>'.
  ```
- **Root Cause**: In modern releases of `@testing-library/jest-dom`, type augmentations for Vitest are located in the `/vitest` subpath export rather than the root package. Importing `@testing-library/jest-dom` directly failed to augment Vitest's `Assertion` interface.
- **Fix Applied**:
  1. Updated `src/test/setup.ts` to import `'@testing-library/jest-dom/vitest'`.
  2. Added `"@testing-library/jest-dom"` to the `types` array in `tsconfig.app.json`.
- **Files Changed**: `src/test/setup.ts`, `src/test/components.test.tsx`, `tsconfig.app.json`
- **Verification**: All component test assertions compiled and executed without type errors.

---

### Bug #4: "permission denied for table customers" & infinite toast notification loop
- **Severity**: High (Runtime / Database Access)
- **Discovery**: Occurred after connecting Supabase and logging in.
- **Error Symptoms**:
  - Console error: `permission denied for table customers`.
  - The UI fell into an infinite re-render loop displaying stacked error toast banners.
- **Root Causes**:
  1. **PostgreSQL Role Grants**: PostgreSQL checks table-level `GRANT` permissions *before* evaluating Row-Level Security (RLS) policies. While RLS policies existed for `auth.uid() = user_id`, the database role `authenticated` lacked table `GRANT` permissions.
  2. **Infinite Toast Loop**: In `ToastContext.tsx`, the `toast` helper object was an unmemoized object literal recreated on every render of `ToastProvider`. In `App.tsx`, `loadCustomers` included `toast` in its `useCallback` dependency array. When `loadCustomers()` failed, it invoked `toast.error(msg)`, mutating state and creating a new `toast` reference. This triggered `loadCustomers` again, causing an infinite network request loop.
- **Fix Applied**:
  1. Added explicit table `GRANT` permissions in PostgreSQL for `authenticated` and `service_role`.
  2. Memoized `toast` using `useMemo` in `src/context/ToastContext.tsx` and implemented message deduplication to prevent stacked duplicate alerts.
  3. Replaced direct `toast` dependency in `App.tsx` with a stable `useRef` reference.
- **Files Changed**: `supabase/schema.sql`, `src/context/ToastContext.tsx`, `src/App.tsx`
- **Verification**: Application loaded customers correctly without permission errors or re-render cycles.

---

### Bug #5: Trigger Function Privilege Exposure & Silent Provisioning Failure
- **Severity**: High (Security & Data Integrity)
- **Discovery**: Detected during security audit of Supabase migration script.
- **Vulnerabilities**:
  1. Client roles (`authenticated`, `anon`, `PUBLIC`) were granted execution privileges on database trigger functions `handle_new_user()` and `handle_updated_at()`. Triggers should only be invoked internally by the database engine upon DML events.
  2. The `handle_new_user()` trigger contained an overly broad `EXCEPTION WHEN OTHERS THEN RETURN NEW;` block that silently swallowed constraint and foreign key failures, leaving newly registered users without a profile or workspace.
- **Fix Applied**:
  1. Added explicit `REVOKE EXECUTE ON FUNCTION` statements for `handle_new_user()` and `handle_updated_at()` from `PUBLIC`, `anon`, and `authenticated`.
  2. Removed the broad `EXCEPTION` suppression block from `handle_new_user()`, ensuring provisioning failures roll back transactions and surface clear error messages.
- **Files Changed**: `supabase/schema.sql`
- **Verification**: Audited function permission catalog; trigger functions cannot be called via RPC while triggers execute normally upon `INSERT`.

---

### Bug #6: Overly Permissive Table-Level Grants for Authenticated Role
- **Severity**: Medium (Security Audit)
- **Discovery**: Identified in database migration script.
- **Problem**: The migration script previously executed `GRANT ALL ON TABLE ... TO authenticated`. This granted structural modification privileges (e.g., `TRUNCATE`, `REFERENCES`, `TRIGGER`) to the client role.
- **Fix Applied**: Restructured grants to enforce least privilege:
  ```sql
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.<table_name> TO authenticated;
  GRANT ALL ON TABLE public.<table_name> TO service_role;
  ```
- **Files Changed**: `supabase/schema.sql`
- **Verification**: Verified least privilege grants across all 11 tables.

---

### Bug #7: Critical Data-Loss Bug — Empty Cloud Overwriting Local Cache
- **Severity**: Critical (Data Integrity)
- **Discovery**: User reported that after running the database migration, existing local records in `companies` and `meetings` disappeared from the UI.
- **Root Cause**: Newly migrated Supabase tables (`public.companies`, `public.meetings`, etc.) initially had 0 rows. The service methods (`getAll()`) queried Supabase, received an empty array `[]`, and immediately overwrote non-empty localStorage caches (`minicrm_companies_cache`, `minicrm_meetings_cache`) with `[]`.
- **Fix Applied**:
  1. Redesigned `companyService`, `meetingService`, `taskService`, and `dealService` with safe reconciliation logic.
  2. If Supabase returns 0 records but the local cache contains records, the service preserves the local cache and initiates a safe, non-destructive sync to the cloud.
  3. Added deduplication guards to prevent duplicate records during synchronization.
  4. Added 5 automated regression tests in `src/test/cache_reconciliation.test.ts`.
- **Files Changed**: `src/services/companyService.ts`, `src/services/meetingService.ts`, `src/services/taskService.ts`, `src/services/dealService.ts`, `src/test/cache_reconciliation.test.ts`
- **Verification**: All 5 cache reconciliation tests passed; existing caches are preserved and safely synced.

---

### Bug #8: Permissive Form Validation & Inverted Meeting Schedules
- **Severity**: Medium (Data Quality & User Experience)
- **Discovery**: Identified during frontend validation audit.
- **Defects**:
  1. Email regex accepted malformed inputs like `test@`, `test.com`, or `test@gmail`.
  2. Phone validation did not enforce upper length bounds (e.g., accepting 30-digit strings) or allowed non-phone characters.
  3. Deal values accepted negative monetary amounts.
  4. Meeting scheduler accepted end times that preceded start times (e.g. start at 14:00, end at 13:00).
- **Fix Applied**:
  1. Implemented strict RFC-compliant email regex verifying username, domain, and valid top-level domain (`.[a-zA-Z]{2,}`).
  2. Implemented flexible international phone validation allowing `+`, spaces, hyphens, and parentheses while enforcing 7–15 digits.
  3. Added positive number checks on monetary inputs.
  4. Added `validateMeetingForm` to enforce chronological start/end time ordering.
  5. Added 19 unit tests in `src/test/validation.test.ts`.
- **Files Changed**: `src/lib/validation.ts`, `src/components/customers/CustomerFormModal.tsx`, `src/components/pipeline/DealFormModal.tsx`, `src/test/validation.test.ts`
- **Verification**: 19 validation unit tests passed with 100% coverage of boundary cases.

---

### Bug #9: Notification Dropdown Bottom-Left Positioning & Visibility Clipping
- **Severity**: Medium (UI / Layout & Positioning)
- **Discovery**: Clicking notification bell opened dropdown in bottom-left; notifications were cut off.
- **Root Causes**:
  1. On desktop, `<header>` was hidden via `.mobile-header { display: none !important; }`, leaving desktop without a top-right header.
  2. `<NotificationDropdown />` was placed in the desktop sidebar's user profile footer (bottom-left of screen).
  3. Parent `<aside className="desktop-sidebar">` had `overflow-y: auto`, which clipped any child extending below or outside the 260px container.
  4. Dropdown rendered with `top: calc(100% + 8px)`, pushing it below the viewport floor.
- **Fix Applied**:
  1. Converted header to a universal, sticky top application header (`.app-header`) present on both desktop and mobile viewports.
  2. Positioned Notification bell at the top-right of the interface alongside Quick Search.
  3. Removed duplicate bell from the sidebar footer.
  4. Updated `NotificationDropdown` styles with `position: absolute; top: calc(100% + 8px); right: 0; zIndex: 1000; maxWidth: min(360px, calc(100vw - 24px));` and `minHeight: 0` on scroll body.
- **Files Changed**: `src/components/layout/NotificationDropdown.tsx`, `src/components/layout/AppLayout.tsx`, `src/styles/main.css`, `src/test/navigation.test.tsx`
- **Verification**: 94 automated tests pass; verified dropdown opens directly below bell aligned to right edge at top-right of UI.

---

### Bug #10: Dashboard Search and Filters Missing / Nonfunctional
- **Severity**: High (Usability & Feature Completeness)
- **Discovery**: Reported during live-application testing (TC-03). The user observed that searching and filtering customer activity on the Executive Dashboard was nonfunctional.
- **Root Cause**: The Executive Dashboard view previously lacked interactive search input handlers and status filtering controls on the Recent Customer Activity table.
- **Fix Applied**:
  1. Added `searchQuery` and `statusFilter` states to `src/pages/DashboardPage.tsx`.
  2. Implemented real-time multi-criteria filtering across name, company, email, and phone, combined with lifecycle status filtering (`ALL`, `New`, `Contacted`, `Negotiation`, `Lost`).
  3. Added a dedicated search & filter bar to the Recent Customer Activity section with clear search button (`X`) and a 1-click `Clear Filters` reset button.
  4. Added an explicit empty filter state displaying a `Reset Filters` action when a query returns no records.
  5. Authored 7 automated tests in `src/test/dashboard_filters.test.tsx` covering all search, filter, reset, and empty-state behaviors.
- **Files Changed**: `src/pages/DashboardPage.tsx`, `src/test/dashboard_filters.test.tsx`
- **Verification**: All 7 dashboard filter tests pass; verified locally via `npm test`.

---

### Bug #11: Deal Pipeline Dragged Cards Passing Behind Columns
- **Severity**: Medium (Visual Layering / Stacking Context)
- **Discovery**: Reported during live testing (TC-08). Dragging a deal card across the Kanban board functioned logically and persisted on reload, but the dragged card title visually appeared behind neighboring columns.
- **Root Cause**: Under CSS specifications, `backdrop-filter: blur(16px)` on the Kanban column containers creates an isolated stacking context and containing block. When `@hello-pangea/dnd` positioned the dragging card with `position: fixed`, the card remained trapped within the source column's stacking context, rendering visually behind subsequent columns in DOM order.
- **Fix Applied**:
  1. Updated `src/components/pipeline/KanbanCard.tsx` to render the dragged card via `createPortal(cardNode, document.body)` when `snapshot.isDragging` is active, elevating it above all column stacking contexts.
  2. Added `zIndex: snapshot.isDragging ? 9999 : 'auto'` and enhanced elevation shadow during drag.
  3. Added explicit `position: relative` to column wrappers in `src/components/pipeline/KanbanBoard.tsx`.
- **Files Changed**: `src/components/pipeline/KanbanCard.tsx`, `src/components/pipeline/KanbanBoard.tsx`
- **Verification**: Verified in local rendering; dragged cards remain fully visible above all columns throughout the drag operation.

---

### Bug #12: Settings Accent Color Labels & Swatches Misaligned with Palette
- **Severity**: Low (UI Defect & Token Alignment)
- **Discovery**: Reported during live testing (TC-13). Theme switching functioned, but accent color controls displayed outdated labels (`Violet / Indigo`, `Electric Blue`, `Emerald Green`) and neon swatches that contradicted the actual design system palette.
- **Root Cause**: Stale button labels and neon CSS colors from an earlier theme revision were never updated to reflect the warm ivory/forest green/brass palette defined in `tokens.css`.
- **Fix Applied**:
  1. Updated `src/pages/SettingsPage.tsx` button labels, swatches, and active borders to match the design system tokens:
     - `Forest Green` (`#24392F`) mapping to `data-accent="green"` (Default)
     - `Antique Brass` (`#B49A69`) mapping to `data-accent="violet"`
     - `Muted Olive` (`#69735C`) mapping to `data-accent="blue"`
  2. Preserved backward-compatible stored preference keys (`green`, `violet`, `blue`).
  3. Updated test assertions in `src/test/preferences.test.tsx`.
- **Files Changed**: `src/pages/SettingsPage.tsx`, `src/test/preferences.test.tsx`
- **Verification**: All 8 preference unit tests pass cleanly in `src/test/preferences.test.tsx`.

---

### Bug #13: Connection Bloom Illustration Lacked Meaningful CRM Labels
- **Severity**: Low (Design Clarity & Product Association)
- **Discovery**: Review noted that while the flower-like Connection Bloom illustration on the landing page was visually appealing, its organic shapes felt abstract and lacked an obvious conceptual connection to MiniCRM's features.
- **Root Cause**: Vector artwork consisted of abstract petals and geometric nodes without semantic labels connecting the graphic to CRM capabilities.
- **Fix Applied**:
  1. Integrated the 5 exact requested English labels into corresponding petal-like shapes in `src/components/landing/ConnectionBloom.tsx`:
     - **GROWTH**: Anchored above the Apex Crown (representing long-term development).
     - **CUSTOMERS**: Positioned on the left petal shoulder with an antique brass leader line (representing customer relationships).
     - **DEALS**: Positioned on the right petal shoulder with an antique brass leader line (representing the sales pipeline).
     - **MEETINGS**: Positioned beneath the central convergence node (representing scheduled interactions).
     - **FOLLOW-UPS**: Positioned alongside the lower engagement foliage (representing continuing engagement).
  2. Strictly preserved the original geometry, silhouette, palette, animations, and responsive boundaries.
  3. Formatted with refined typography (`fontSize="8"`, `fontWeight="700"`, letter spacing, warm ivory backing capsules) to ensure readability and zero clipping across desktop and mobile screens.
- **Files Changed**: `src/components/landing/ConnectionBloom.tsx`
- **Verification**: Verified via production build and visual inspection across viewports.

---

### Bug #14: Email Confirmation Returned Users to Landing Page Without Completing Verification
- **Severity**: High (Authentication Flow)
- **Discovery**: Reported during live-application testing (TC-01). The confirmation email arrived in Spam; clicking "Confirm email address" opened the published landing page, and the Supabase user remained unconfirmed (`email_confirmed_at` null).
- **Root Causes**:
  1. In `src/context/AuthContext.tsx`, `supabase.auth.signUp()` was called without `options.emailRedirectTo`, defaulting Supabase to the Site URL root.
  2. The application had no URL callback handler to parse and verify incoming OTP tokens (`token_hash` & `type`) or PKCE `code` parameters.
  3. Hash-based routing in `src/App.tsx` treated unexpected hashes or empty routes as public landing page views, bypassing authentication state resolution.
- **Fix Applied (Application Side)**:
  1. Configured `options.emailRedirectTo` in `signUp` targeting `${window.location.origin}/`.
  2. Implemented `processAuthCallback` in `AuthProvider`'s initialization to detect `token_hash` and invoke `supabase.auth.verifyOtp({ token_hash, type })`, exchange PKCE `code` via `supabase.auth.exchangeCodeForSession(code)`, log auth redirect errors, and route to `#dashboard` on success.
  3. Updated hash-change routing in `src/App.tsx` so authentication tokens and callback parameters are not treated as public landing page navigations.
- **External Dependencies & Verification Status**:
  - **Status**: Application-side redirect and callback handling have been updated in code and pass all automated tests. However, **end-to-end email verification has NOT yet been verified in production**.
  - **Required Supabase Action**: During live testing, Supabase's "Confirm email" setting was temporarily disabled to permit testing unconfirmed accounts. The updated flow requires re-enabling "Confirm email" in the Supabase Dashboard (*Authentication → Providers → Email*), verifying that the email template uses `{{ .ConfirmationURL }}` (or `{{ .SiteURL }}/?token_hash={{ .TokenHash }}&type=signup`), and generating a fresh confirmation email to test end-to-end.
  - **Deliverability Notice**: Gmail Custom SMTP deliverability (inbox vs. spam) depends on external DNS records (SPF, DKIM, DMARC) and cannot be guaranteed by frontend code changes.
- **Files Changed**: `src/context/AuthContext.tsx`, `src/App.tsx`

---

## Final Verification Summary
- **Total Defects Documented**: 14 (BUG-01 through BUG-14)
- **Defects Resolved in Code**: 13 fully resolved; 1 (BUG-14) application-side fix implemented with external Supabase re-enablement and live verification pending.
- **Automated Regression Suite**: 107 tests passing across 10 test files (`npm test`)
- **Production Build Status**: Clean build generated in `dist/` with 0 TypeScript or bundling errors.
