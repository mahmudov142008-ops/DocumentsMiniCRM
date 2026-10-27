# Mini CRM — Modern Enterprise CRM & Sales Pipeline Management

[![Tests](https://img.shields.io/badge/tests-94%20passed-success)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646cff)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015+-3ecf8e)](https://supabase.com/)

A modern, full-featured Customer Relationship Management (CRM) application built for businesses to manage their client relationships, track sales deals through interactive visual pipelines, coordinate tasks, schedule meetings, and generate actionable business reports.

Built with an Apple-inspired design aesthetic featuring warm cream/ivory palettes, deep forest green accents, refined typography, responsive dark/light theme switching, and smooth micro-animations.

---

## 🚀 Key Features & Implemented Pages

### 1. Executive Dashboard (`/`)
- **Key Metrics & KPI Cards**: Real-time calculations of total customers, active pipeline volume, win rate, and monthly revenue.
- **Sales Goals Progress**: Interactive tracking against monthly revenue targets with percentage-based progress indicators.
- **Interactive Visual Distribution**: Custom SVG donut chart visualizing pipeline stages without bloated external chart libraries.
- **Recent Activity Feed**: Chronological list of recently onboarded customers, closed deals, and completed tasks with 1-click navigation.

### 2. Customer Management (`/customers`)
- **Full Lifecycle CRUD**: Create, read, edit, and delete customer profiles with instant validation.
- **Data Attributes**: Full name, company association, email address, international phone numbers, and status.
- **Multi-Criteria Search & Filtering**: Real-time search across names, emails, companies, and phone numbers with status filter pills and 1-click filter reset.
- **Dual View Modes**: Responsive tabular grid on desktop view and touch-friendly card list on mobile viewports.
- **Customer Detail Drawer**: Slide-over drawer displaying customer history, linked deals, and chronological notes.
- **Timestamped Activity Notes**: Scoped 1-to-many customer notes timeline with automatic timestamps (`created_at`).

### 3. Visual Deal Pipeline (`/pipeline`)
- **Kanban Sales Pipeline**: 4-column visual board (`New`, `Contacted`, `Negotiation`, `Lost`).
- **Drag & Drop**: Powered by `@hello-pangea/dnd` with full mouse, touch, and keyboard accessibility.
- **Optimistic UI Updates**: State updates instantly upon card drop with automatic rollback on network failure.
- **Deal Management**: Modal for creating and editing deals with deal values, expected close dates, and stage tracking.

### 4. Company Directory (`/companies`)
- **Organization Management**: Track business accounts with company name, industry, employee size, annual revenue, and website.
- **Associated Contacts**: Seamless relational linking between companies and customer contacts.
- **Safe Cache Reconciliation**: Local cache preserves records and safely reconciles with Supabase without data loss.

### 5. Task & Activity Management (`/tasks`)
- **Operational Task Tracking**: Organize CRM to-dos with titles, descriptions, due dates, and priority levels (`Low`, `Medium`, `High`, `Urgent`).
- **Status Toggle**: One-click completion toggling with visual strike-through and filtering by status.
- **Entity Linking**: Associate tasks directly with customers or deals.

### 6. Meeting Scheduler & Calendar (`/calendar`)
- **Event Scheduling**: Book customer meetings, product demos, and follow-up calls.
- **Validation Guards**: Enforces chronological sanity (meeting end time must strictly follow start time).
- **Attendee Tracking**: Link customer contacts and team members to calendar invites.

### 7. Business Reports & Analytics (`/reports`)
- **Conversion Metrics**: Win/loss ratio, deal velocity, and pipeline conversion percentages.
- **Revenue Forecasting**: Projected revenue based on weighted pipeline stages.
- **Performance Summaries**: High-level visual reports for sales leadership.

### 8. Settings & User Customization (`/settings`)
- **Appearance & Theme Customization**: Real-time switching between Light, Dark, and System theme modes.
- **Accent Color Selection**: Customizable accent palettes (Forest Green, Royal Blue, Violet, Amber, Rose).
- **Workspace Management**: Multi-tenant workspace configuration and profile customization.

### 9. Cross-Cutting Capabilities
- **Global Search Modal (`Ctrl+K` or `/`)**: Quick-search across customers, companies, deals, and tasks from anywhere in the app.
- **AI-Powered Lead Scoring & Email Drafter**: Built-in AI assistants for predicting deal closure likelihood and drafting personalized follow-up emails.
- **Offline-First Resilience**: Robust cache reconciliation layer preventing empty cloud responses from wiping local caches.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19.1 + TypeScript 5.9 | Modern functional components with strict typing |
| **Build Tool & Bundler** | Vite 7.0 | Instant HMR, optimized production chunks |
| **Styling & Design System** | Vanilla CSS + CSS Design Tokens | Zero-runtime CSS variables, dark/light theme support |
| **Icons** | Lucide React | Crisp, accessible SVG iconography |
| **Drag & Drop** | `@hello-pangea/dnd` | Accessible, React 19-compatible Kanban dragging |
| **Backend & Database** | Supabase (PostgreSQL 15+) | 11 relational tables, triggers, indexes, and constraints |
| **Authentication** | Supabase Auth | JWT session handling, automatic token refresh |
| **Authorization & Security** | PostgreSQL Row-Level Security (RLS) | Strict least-privilege security policies per workspace/user |
| **Test Suite** | Vitest 4.0 + React Testing Library | 93 passing automated unit, integration, and component tests |

---

## 🔒 Database Architecture & Security Model

The backend is powered by Supabase PostgreSQL with **11 structured relational tables**:
1. `profiles` — User profile details linked to `auth.users`.
2. `workspaces` — Multi-tenant organization boundaries.
3. `workspace_members` — Role-based access control (`owner`, `admin`, `member`).
4. `companies` — Organization and client accounts.
5. `customers` — Individual client contacts.
6. `deals` — Sales opportunities linked to customers and stages.
7. `notes` — Timestamped customer activity logs.
8. `tasks` — Action items with due dates and priorities.
9. `meetings` — Calendar events and customer appointments.
10. `notifications` — In-app alerts and notifications.
11. `sales_goals` — Revenue targets and progress tracking.

### Security Highlights
- **Row-Level Security (RLS)** enabled across all 11 tables.
- **Least-Privilege Role Grants**: Tables grant only `SELECT`, `INSERT`, `UPDATE`, `DELETE` to the `authenticated` role; administrative `ALL` is reserved strictly for `service_role`.
- **Protected Triggers**: Sensitive trigger functions (`handle_new_user`, `handle_updated_at`) have client execution privileges explicitly revoked from `PUBLIC`, `anon`, and `authenticated`.
- **Safe Provisioning**: User registration securely provisions a default profile and workspace without silently masking database constraint errors.

---

## 📋 Step-by-Step Supabase Setup Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Choose a project name (e.g., `MiniCRM`), set a secure database password, and choose your preferred region.

### Step 2: Execute Migration Schema
1. Open the Supabase Dashboard and navigate to the **SQL Editor**.
2. Create a **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and paste into the editor.
4. Click **Run**. This establishes all 11 tables, foreign key constraints, indexes, RLS policies, and triggers.

### Step 3: Disable Email Confirmations (Recommended for Development)
1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**.
2. Toggle off **Confirm email** and save changes. This permits instant sign-in upon registration.

### Step 4: Configure Environment Variables
1. In your Supabase Dashboard, go to **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon (public)** key.
3. In the project root, create a file named `.env.local` (or `.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 💻 Local Installation & Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Steps
```bash
# 1. Clone the repository
git clone <repository-url>
cd DocumentsMiniCRM

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
The application will launch locally at `http://localhost:5173` (or `http://localhost:5174`).

---

## 🧪 Testing & Quality Assurance

The project includes an extensive automated test suite covering validation logic, offline cache reconciliation, database services, UI components, settings, and navigation.

```bash
# Run all automated tests
npm test

# Run tests in one-shot mode
npm test -- --run

# Run production build and type check
npm run build
```

### Verified Test Summary
- **Test Files**: 9 passed
- **Tests**: 94 passed (100% pass rate)
- **TypeScript Typecheck**: 0 errors
- **Production Bundle**: Successfully built with Vite

---

## 🚢 Production Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. In **Project Settings** → **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your production Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your production Supabase anonymous public key.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Click **Deploy**. Vercel will build and host your production application with automatic SSL.
