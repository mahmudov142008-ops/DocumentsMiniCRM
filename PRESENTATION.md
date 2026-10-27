# PRESENTATION.md — Mini CRM Capstone Project Presentation Script

**Project**: Mini CRM — Modern Enterprise Customer Relationship Management  
**Presenter**: Software Engineering Student  
**Target Duration**: 7–10 Minutes  
**Format**: Live Application Demonstration & Architectural Walkthrough  

---

## ⏱️ Presentation Outline & Timing

| Segment | Duration | Focus Area |
| :--- | :---: | :--- |
| **1. Introduction & Problem Statement** | 1:00 | Project background, business objective, target audience |
| **2. Architecture & Technology Stack** | 1:30 | React 19, TypeScript, Supabase PostgreSQL, RLS security model |
| **3. Live Application Demonstration** | 4:00 | Dashboard, Customer CRUD, Kanban drag-and-drop, Notes, Settings |
| **4. Technical Challenges & Solutions** | 1:30 | Database permission grants, cache reconciliation, strict validation |
| **5. Testing & Quality Assurance** | 0:45 | 93 passing automated tests, zero-type-error build |
| **6. Conclusion & Q&A Preparation** | 0:45 | Recap, key takeaways, answering questions |
| **Total Duration** | **~9:00** | Balanced, professional delivery |

---

## 🎤 Detailed Presentation Script

---

### [0:00 – 1:00] Segment 1: Introduction & Problem Statement

**Screen / Slide**: Project Title Page showing Mini CRM logo and tagline: *"Mini CRM: Clean, resilient, and secure customer relationship management for growing teams."*

> **Speaker Script**:
> "Good morning / afternoon everyone. Today, I am proud to present **Mini CRM**, a modern, full-stack customer relationship and sales pipeline management platform.
>
> Many small and medium-sized businesses struggle with CRM tools. Existing enterprise platforms like Salesforce or HubSpot are often bloated, slow, expensive, and overwhelming for sales teams. On the other end of the spectrum, spreadsheets lead to lost customer notes, mismanaged follow-ups, and security risks.
>
> My goal with Mini CRM was to build a solution that combines the speed and elegance of consumer applications with the data integrity, multi-tenancy, and security required by modern enterprise software.
>
> Let's look at how the application is built."

---

### [1:00 – 2:30] Segment 2: Architecture & Technology Stack

**Screen / Slide**: Architecture Diagram showing Frontend (React 19 + TypeScript + Vite), Network (Supabase PostgREST + Auth), and Backend (PostgreSQL 15+ with 11 tables, RLS policies, and Triggers).

> **Speaker Script**:
> "From an architectural standpoint, Mini CRM is built on a modern, decoupled cloud architecture:
>
> 1. **On the Frontend**: We use **React 19** paired with **TypeScript** for 100% type safety, bundled by **Vite** for instant hot-module reloading and optimized production chunks.
> 2. **Design System**: Rather than using heavy UI libraries that bloat the bundle, I designed a bespoke design token system in **Vanilla CSS**. It provides a sophisticated Apple-inspired aesthetic with warm ivory backgrounds, deep forest green accents, and seamless support for Light, Dark, and System theme modes.
> 3. **Backend & Database**: We leverage **Supabase** powered by **PostgreSQL 15+**. The database contains **11 relational tables** managing workspaces, companies, customers, deals, notes, tasks, meetings, notifications, and sales quotas.
> 4. **Enterprise Security**: Security is enforced at the database level using **Row-Level Security (RLS)**. Even if an attacker intercepted client API calls, PostgreSQL strictly confines data access to authenticated workspace members. Furthermore, we audited our permissions so that client roles have least-privilege CRUD access (`SELECT, INSERT, UPDATE, DELETE`) while administrative commands and sensitive triggers are locked down."

---

### [2:30 – 6:30] Segment 3: Live Application Demonstration

**Screen / Action**: Open browser to `http://localhost:5173` (or production URL).

#### Demo Step 1: Executive Dashboard (0:45)
*(Action: Navigate to Dashboard `/`)*
> **Speaker Script**:
> "Here on the **Executive Dashboard**, users get an instant high-level pulse of their sales operation.
>
> At the top, these KPI cards compute total customer volume, active pipeline value, deal win rate, and monthly revenue. Notice this custom SVG donut chart: it visualizes the distribution of deals across stages without relying on any external chart libraries.
>
> We also have monthly sales target tracking with real-time percentage indicators, and a recent activity stream allowing one-click navigation to newly onboarded leads."

#### Demo Step 2: Customer Management & Activity Notes (1:15)
*(Action: Click 'Customers' in the sidebar; demonstrate search, status filter, and opening the Detail Drawer)*
> **Speaker Script**:
> "Moving to the **Customers** view:
>
> We have full lifecycle CRUD capabilities. Notice how fast the multi-criteria search and status pills work. As I type, it filters simultaneously across names, companies, emails, and phone numbers.
>
> On desktop, we see a structured data table. If I inspect the page or view it on a mobile viewport, it automatically adapts into touch-friendly cards.
>
> When I click on a customer, this slide-over **Detail Drawer** opens. Here, we see full contact information, linked deals, and the customer's chronological activity notes. Let's add a note: *'Confirmed contract kickoff meeting for Friday'*. It instantly updates with an exact timestamp and persists to Supabase with strict customer foreign-key scoping."

#### Demo Step 3: Interactive Kanban Deal Pipeline (1:00)
*(Action: Navigate to 'Pipeline'; drag a deal card between columns)*
> **Speaker Script**:
> "Now let's examine the heart of any CRM: the **Sales Pipeline**.
>
> Here we have an interactive 4-stage Kanban board powered by `@hello-pangea/dnd`. Cards represent sales opportunities with deal values and closing targets.
>
> Watch what happens when I drag a deal from *'Contacted'* into *'Negotiation'*. The movement uses **optimistic UI updates**—the card settles immediately without UI lag, while an asynchronous request updates the database in the background. If the connection fails, the board automatically rolls back the card and alerts the user."

#### Demo Step 4: Companies, Tasks, Calendar, and Personalization (1:00)
*(Action: Quickly showcase Tasks, Calendar, and switch theme in Settings)*
> **Speaker Script**:
> "In addition to customers and deals, Mini CRM provides integrated operational tools:
> - **Companies**: Directory tracking corporate accounts, employee count, and annual revenue.
> - **Tasks**: Action items with due dates and priority badges.
> - **Calendar**: Meeting scheduler equipped with validation logic that prevents scheduling errors, such as meetings ending before they start.
> - **Global Search**: Pressing `Ctrl+K` opens a global palette to find anything in seconds.
> - **Settings & Theming**: Users can personalize their workspace by switching between Light and Dark themes, or selecting custom accent colors like Forest Green, Royal Blue, or Violet."

---

### [6:30 – 8:00] Segment 4: Technical Challenges & Engineering Solutions

**Screen / Slide**: "Key Engineering Challenges & Overcoming Roadblocks"

> **Speaker Script**:
> "Building an application of this depth presented several real-world technical challenges that required careful debugging:
>
> 1. **PostgreSQL Privilege Grants & React Infinite Loop**:
>    Early in development, we hit a `permission denied for table customers` error. PostgreSQL checks table grants before evaluating RLS policies. Additionally, an unmemoized context object combined with a re-fetching hook created an infinite toast loop. I resolved this by applying explicit least-privilege grants in SQL and memoizing context handlers using `useMemo` and `useRef`.
>
> 2. **Data-Loss Prevention & Cache Reconciliation**:
>    When we added new tables like `companies` and `meetings` to Supabase, they initially contained zero rows. The application's local cache held pre-existing test data, but fetching from the newly created cloud table returned an empty array, threatening to overwrite the local cache. I engineered a robust **two-way non-destructive cache reconciliation engine**: if the cloud returns empty while local cache contains records, the app preserves the local data, initiates a safe background sync, and deduplicates records to avoid duplicate inserts.
>
> 3. **Input Validation Hardening**:
>    To maintain database integrity, I implemented strict validation: RFC-compliant email checking that rejects malformed domains, international phone format checking allowing `+`, spaces, and hyphens within 7–15 digits, and date-range validation."

---

### [8:00 – 8:45] Segment 5: Testing & Quality Assurance

**Screen / Slide**: Terminal showing `npm test` running 93 passing tests and `npm run build` passing.

> **Speaker Script**:
> "Quality assurance was a top priority throughout this project:
> - We maintain an automated test suite comprising **9 test files and 93 automated tests** using Vitest and React Testing Library.
> - Test coverage spans form validation boundary conditions, service CRUD with offline fallbacks, cache reconciliation, UI components, preference persistence, and page routing.
> - Every automated test passes with 100% reliability, and our production build compiles cleanly with zero TypeScript errors."

---

### [8:45 – 9:30] Segment 6: Conclusion & Questions

**Screen / Slide**: Summary Slide with GitHub repository link, feature highlights, and "Thank you / Q&A".

> **Speaker Script**:
> "To summarize: Mini CRM delivers a fast, responsive, and aesthetically pleasing CRM experience with enterprise-grade multi-tenancy, PostgreSQL Row-Level Security, non-destructive data recovery, and an extensive 93-test automated quality suite.
>
> Thank you very much for your time and attention. I would now love to open the floor to any questions you may have."

---

## 💡 Anticipated Q&A (Question & Answer Guide)

### Q1: Why did you choose Vanilla CSS Custom Properties instead of TailwindCSS?
> **Answer**: "Using CSS Custom Properties (design tokens) allowed us to implement dynamic theming (Light/Dark mode and multi-color accents) natively in the browser without any runtime performance penalty or CSS class churn. It also kept our production bundle small and gave us precise control over typography, micro-interactions, and responsive breakpoints."

### Q2: How does Row-Level Security (RLS) protect tenant data in Supabase?
> **Answer**: "In our PostgreSQL schema, every table has RLS enabled. When a query is made via Supabase PostgREST, PostgreSQL checks the authenticated JWT (`auth.uid()`). A policy like `WHERE user_id = auth.uid()` or our workspace helper `check_is_workspace_member(workspace_id)` is evaluated inside the database engine. Even if a user crafts a custom SQL or HTTP request, the database rejects queries attempting to access another tenant's records."

### Q3: How does the offline cache reconciliation handle conflicts?
> **Answer**: "Our services follow an offline-first preservation strategy. If the cloud returns an empty response but the local cache has records, the system flags that the table has local unsaved data, preserves the local state, and triggers a non-destructive push to Supabase. Duplicate checks verify whether a record ID or unique business key already exists before inserting."

### Q4: What would be the next feature you would implement?
> **Answer**: "The natural next step would be integrating live WebSocket real-time subscriptions via Supabase Realtime so that when multiple team members are working on the same Kanban pipeline, deal cards move across each other's screens in real time."
