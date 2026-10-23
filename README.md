# Mini CRM — Customer Relationship & Pipeline Management

A polished, minimalist web application for small businesses to manage customers, track deals in a Kanban sales pipeline, and record chronological activity notes.

Built with an Apple-inspired design aesthetic featuring warm ivory/cream backgrounds, deep forest green primary accents, subtle violet highlights, and graphite typography.

---

## 🚀 Key Features

1. **Authentication & Multi-Tenant Security**
   - Email and password authentication via Supabase Auth.
   - Protected application routes with automated session restoration.
   - Strict PostgreSQL **Row-Level Security (RLS)** ensuring users only ever access their own data.

2. **Customer Management (Full CRUD)**
   - Create, view, edit, and delete customer records.
   - Tracks: Full Name, Company, Email, Phone Number, and Status.
   - Lifecycle Statuses: `New`, `Contacted`, `Negotiation`, and `Lost`.
   - Responsive presentation: desktop table view and touch-friendly mobile card view.

3. **Search & Multi-Criteria Filtering**
   - Instant search across name, company, email, and phone number.
   - Status filtering pills with active count indicators.
   - Combined multi-criteria search and status filtering.
   - One-click filter reset.

4. **Kanban Deal Pipeline**
   - 4-column drag-and-drop sales pipeline (`New`, `Contacted`, `Negotiation`, `Lost`).
   - Powered by `@hello-pangea/dnd` with smooth touch and keyboard support.
   - Optimistic UI updates with automatic rollback on network errors.
   - Changes persist to PostgreSQL in real time and survive page refreshes.

5. **Timestamped Customer Activity Notes**
   - 1-to-many relationship linking notes to individual customer profiles.
   - Chronological timeline ordering (`created_at ASC`).
   - Strict foreign key and query scoping preventing notes from appearing under the wrong customer.

6. **Executive Dashboard Analytics**
   - Total customer count, new leads count, and active pipeline volume.
   - SVG Pipeline Distribution donut chart and progress bars calculated directly from live database records.
   - Chronological list of recently added leads with quick navigation.

7. **Bulletproof Validation & Error Handling**
   - Client-side validation: RFC 5322 email formatting, international/domestic phone digit validation, and required fields.
   - Accessible inline error labels with immediate feedback.
   - Server-side error handling with animated notification banners.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling** | Custom Vanilla CSS with CSS Custom Properties (Design Tokens) |
| **Typography** | Plus Jakarta Sans (Google Fonts) |
| **Icons** | Lucide React |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Backend & Database** | Supabase (PostgreSQL 15+) |
| **Authentication** | Supabase Auth (JWT + Session persistence) |
| **Authorization** | PostgreSQL Row-Level Security (RLS) |
| **Testing** | Vitest + React Testing Library + JSDOM |
| **Deployment** | Vercel |

---

## 📋 Step-by-Step Supabase Setup Guide

Follow these simple steps to connect your own Supabase backend:

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and click **Start your project** (or sign in).
2. Click **New Project**, choose a name (e.g. `MiniCRM`), set a secure database password, and select your closest region.
3. Wait ~60 seconds for the database to provision.

### Step 2: Run the Database Migration
1. In your Supabase project dashboard, click **SQL Editor** from the left navigation menu.
2. Click **New Query**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. You should see `Success. No rows returned`. All tables (`profiles`, `customers`, `notes`), indexes, triggers, and Row-Level Security policies are now configured.

### Step 3: (Recommended for Fast Testing) Disable Email Confirmations
1. Go to **Authentication** → **Providers** → **Email**.
2. Toggle off **Confirm email**.
3. Click **Save**. This allows newly registered users to sign in immediately without waiting for an email deliverability link.

### Step 4: Copy API Credentials into `.env`
1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public API key**.
3. In the root of this project folder, create a file named `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```
*(On Windows systems where PowerShell script execution is restricted, run `npm.cmd install`)*

### 2. Start the Development Server
```bash
npm run dev
```
*(or `npm.cmd run dev`)*

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run the automated test suite powered by Vitest:

```bash
npm test
```

To run tests in watch mode:
```bash
npx vitest
```

The automated test suite verifies:
- Email regex validation (empty checks, malformed addresses, valid inputs).
- Phone number length and format validation.
- Customer form validation and schema requirements.
- Multi-criteria customer search (name, email, phone, company).
- Status filtering and combined filter logic.
- UI Component rendering (`Badge`, `StatCards`).

For the full 24-scenario test matrix including manual and live validation steps, see [`TEST_CASES.md`](TEST_CASES.md).

---

## 📦 Production Build

To verify TypeScript types and bundle the application for production:

```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment Instructions (Vercel)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Mini CRM implementation"
   git remote add origin https://github.com/your-username/mini-crm.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **Deploy**. Vercel will automatically build and publish your CRM with HTTPS enabled.

---

## 🔒 Security Best Practices Implemented

- **No Secrets Exposed**: Frontend code only communicates via the public `anon` key. The Supabase `service_role` key is never referenced anywhere in client code.
- **Strict Row-Level Security (RLS)**: The database evaluates `auth.uid() = user_id` for every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operation. Even if API requests are directly forged, PostgreSQL prevents data tampering across users.
- **Git Hygiene**: `.env` and `.env.*` are explicitly included in `.gitignore` to prevent secret leaks to public repositories.

---

## 📄 Deliverable Documentation Links

- [`supabase/schema.sql`](supabase/schema.sql) — PostgreSQL DDL with RLS policies and triggers.
- [`TEST_CASES.md`](TEST_CASES.md) — 24 executed test cases with Pass/Fail results.
- [`BUGS_AND_FIXES.md`](BUGS_AND_FIXES.md) — Real technical bugs encountered and resolved during development.
- [`AI_USAGE.md`](AI_USAGE.md) — AI workflow, prompts, technical decisions, and architecture record.
