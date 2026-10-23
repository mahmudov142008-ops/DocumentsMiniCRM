# TEST_CASES.md — Mini CRM Test Case Matrix

## Project: Mini CRM
## Total Test Cases: 24 (18 Automated, 6 Manual)
## Automated Tests Executed: ✅ 22 automated unit/component tests — ALL PASS

> **Note on Test Results**: Automated test results (`PASS`) are recorded after actual `npm test` execution (confirmed output: 22 tests, 0 failures). Manual test cases are marked **PENDING** because they require a live Supabase connection which the user has not yet configured. Once Supabase credentials are added and the app is running, these tests should be executed and this document updated with actual results.

---

## Automated Tests — Executed and Verified

### Validation Unit Tests (`src/test/validation.test.ts`)

| Test ID | Category | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-A01 | Validation | `validateEmail('')` — empty email | Returns `'Email is required'` | Returns `'Email is required'` | ✅ PASS |
| TC-A02 | Validation | `validateEmail('   ')` — whitespace-only email | Returns `'Email is required'` | Returns `'Email is required'` | ✅ PASS |
| TC-A03 | Validation | `validateEmail('plainaddress')` — no @ or domain | Returns `'Please enter a valid email address'` | Returns `'Please enter a valid email address'` | ✅ PASS |
| TC-A04 | Validation | `validateEmail('user@domain')` — missing TLD | Returns `'Please enter a valid email address'` | Returns `'Please enter a valid email address'` | ✅ PASS |
| TC-A05 | Validation | `validateEmail('test@example.com')` — valid email | Returns `null` | Returns `null` | ✅ PASS |
| TC-A06 | Validation | `validatePhone('')` — empty phone | Returns `'Phone number is required'` | Returns `'Phone number is required'` | ✅ PASS |
| TC-A07 | Validation | `validatePhone('12345')` — fewer than 7 digits | Returns digit count error | Returns digit count error | ✅ PASS |
| TC-A08 | Validation | `validatePhone('+1 (555) 123-4567')` — valid international format | Returns `null` | Returns `null` | ✅ PASS |
| TC-A09 | Validation | `validateRequired('', 'Name')` — blank required field | Returns `'Name is required'` | Returns `'Name is required'` | ✅ PASS |
| TC-A10 | Validation | `validateCustomerForm(invalidPayload)` — multiple bad fields | `isValid: false`, errors for name, email, phone, company | All 4 errors returned, `isValid: false` | ✅ PASS |
| TC-A11 | Validation | `validateCustomerForm(validPayload)` — fully valid form | `isValid: true`, no errors | `isValid: true`, 0 errors | ✅ PASS |

### Customer Filtering Unit Tests (`src/test/filters.test.ts`)

| Test ID | Category | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-A12 | Filtering | Empty query + ALL status | Returns all 4 mock customers | 4 results returned | ✅ PASS |
| TC-A13 | Filtering | Status filter = `'Contacted'` | Returns only 1 result (Bob Smith) | 1 result, correct record | ✅ PASS |
| TC-A14 | Filtering | Search `'alice'` — case-insensitive name match | Returns only Alice Johnson | 1 result, Alice Johnson | ✅ PASS |
| TC-A15 | Filtering | Search `'Nexus Tech'` — company name match | Returns 2 records (Alice + David) | 2 results | ✅ PASS |
| TC-A16 | Filtering | Search `'7946'` — partial phone number match | Returns Carol White | 1 result, Carol White | ✅ PASS |
| TC-A17 | Filtering | Search `'Nexus'` + Status `'Lost'` — combined filter | Returns only David Lee | 1 result, David Lee | ✅ PASS |
| TC-A18 | Filtering | Search `'NonExistentPerson'` — no matches | Returns empty array | Empty array `[]` | ✅ PASS |

### UI Component Tests (`src/test/components.test.tsx`)

| Test ID | Category | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-A19 | Component | Badge renders `'New'` status label | Element with text `'New'` in DOM | `'New'` element found | ✅ PASS |
| TC-A20 | Component | Badge renders `'Negotiation'` status label | Element with text `'Negotiation'` in DOM | `'Negotiation'` element found | ✅ PASS |
| TC-A21 | Component | StatCards calculates totals from 3 mock customers | Shows `3` total, `1` new, `2` active pipeline | All values correct | ✅ PASS |
| TC-A22 | Component | StatCards handles empty customer array | Shows `0%` negotiation rate, no crash | Renders correctly with zeros | ✅ PASS |

---

## Manual Tests — Requires Live Supabase Connection

> These tests must be executed by the user after configuring the `.env` file with real Supabase credentials and running `npm run dev`.
> Status will be updated from **PENDING** to **PASS** or **FAIL** after actual execution.

### Authentication Tests

| Test ID | Category | Scenario | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-M01 | Authentication | Register new user with valid credentials | 1. Navigate to `/`  2. Switch to "Create Account"  3. Enter name, valid email, password (≥6 chars)  4. Click "Create Account" | Account created; user lands on Dashboard | — | PENDING |
| TC-M02 | Authentication | Register with password shorter than 6 characters | 1. Switch to "Create Account"  2. Enter valid email  3. Enter 3-character password  4. Click submit | Error message: password too short | — | PENDING |
| TC-M03 | Authentication | Login with valid credentials | 1. Enter registered email and password  2. Click "Sign In" | Redirected to Dashboard; user email visible in sidebar | — | PENDING |
| TC-M04 | Authentication | Login with wrong password | 1. Enter registered email  2. Enter incorrect password  3. Click "Sign In" | Error banner displayed; stay on login screen | — | PENDING |
| TC-M05 | Authentication | Logout and session clearance | 1. Click logout icon in sidebar  2. Attempt to navigate back to `/dashboard` URL | Session cleared; redirected to login screen | — | PENDING |
| TC-M06 | Authentication | Protected route access without login | 1. Open browser to app URL without login  2. Navigate directly | Login page shown; no CRM data accessible | — | PENDING |

### Customer CRUD Tests

| Test ID | Category | Scenario | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-M07 | Customer CRUD | Create customer with all valid fields | 1. Click "Add Customer"  2. Fill all fields  3. Click "Create Customer" | Customer appears in table; Dashboard count increments | — | PENDING |
| TC-M08 | Customer CRUD | Form validation on blank submit | 1. Open "Add Customer" modal  2. Click "Create Customer" without filling fields | Inline error labels on all required fields; no submission | — | PENDING |
| TC-M09 | Customer CRUD | Edit existing customer | 1. Click edit icon on a customer  2. Change name and company  3. Click "Save Changes" | Updated record appears in table; old values gone | — | PENDING |
| TC-M10 | Customer CRUD | Delete customer with confirmation | 1. Click delete icon  2. Confirm in dialog | Customer removed from table; Dashboard count decrements | — | PENDING |

### Search, Filter & Pipeline Tests

| Test ID | Category | Scenario | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-M11 | Pipeline | Drag card from `New` to `Contacted` | 1. Open Pipeline page  2. Drag a New customer card into Contacted column | Card moves; toast confirmation shown | — | PENDING |
| TC-M12 | Pipeline | Verify Kanban status persists after page reload | 1. Drag card to `Negotiation`  2. Refresh browser  3. Verify card remains in `Negotiation` | Card stays in new column after refresh | — | PENDING |
| TC-M13 | Notes | Add note to Customer A | 1. Open customer A detail  2. Type note  3. Click "Add Note" | Note appears in timeline with timestamp | — | PENDING |
| TC-M14 | Notes | Customer B does not show Customer A's notes | 1. Add note to Customer A  2. Open Customer B detail | Customer B has no notes from Customer A | — | PENDING |
| TC-M15 | Notes | Notes appear in chronological order | 1. Add 3 notes with delays  2. View timeline | Notes ordered oldest-first by creation timestamp | — | PENDING |

---

## Test Execution Summary

| Category | Total | ✅ Pass | ❌ Fail | ⏳ Pending |
| :--- | :--- | :--- | :--- | :--- |
| Automated Unit Tests | 22 | **22** | 0 | 0 |
| Manual Integration Tests | 15 | 0 | 0 | **15** |
| **Total** | **37** | **22** | **0** | **15** |
