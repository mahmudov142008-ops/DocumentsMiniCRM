-- ==============================================================================
-- Mini CRM Database Schema & Row-Level Security (RLS) Setup
-- Compatible with Supabase PostgreSQL
-- ==============================================================================

-- 1. Create profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create customers table (with optional tags, favorite, and last contact)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Negotiation', 'Lost')),
    tags TEXT[] DEFAULT '{}'::TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    last_contact_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;

-- 3. Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    size TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure company_id foreign key column exists on customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 5. Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
    expected_close_date DATE,
    description TEXT,
    lost_reason TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE NOT NULL,
    due_time TIME,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_type TEXT NOT NULL DEFAULT 'Discovery' CHECK (meeting_type IN ('Discovery', 'Demo', 'Proposal Review', 'Negotiation', 'Check-in')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. Create sales_goals table
CREATE TABLE IF NOT EXISTS public.sales_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    link_page TEXT,
    link_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. Create workspaces and workspace_members tables
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'team')),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- 11. Create Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_customer_id ON public.notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON public.deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_goals_user_id ON public.sales_goals(user_id);

-- 12. Auto-update triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_deals_updated_at ON public.deals;
CREATE TRIGGER set_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_meetings_updated_at ON public.meetings;
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. Auto-create user profile and default personal workspace
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    ws_id UUID;
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create default personal workspace
    INSERT INTO public.workspaces (name, type, owner_id)
    VALUES ('My Personal Workspace', 'personal', NEW.id)
    RETURNING id INTO ws_id;

    -- Add user as workspace owner
    IF ws_id IS NOT NULL THEN
        INSERT INTO public.workspace_members (workspace_id, user_id, role)
        VALUES (ws_id, NEW.id, 'owner')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- Multi-tenant isolation for all CRM tables
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CUSTOMERS
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- NOTES
DROP POLICY IF EXISTS "Users can view notes for own customers" ON public.notes;
CREATE POLICY "Users can view notes for own customers" ON public.notes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create notes for own customers" ON public.notes;
CREATE POLICY "Users can create notes for own customers" ON public.notes 
FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.customers 
        WHERE customers.id = notes.customer_id AND customers.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes" ON public.notes 
FOR UPDATE USING (auth.uid() = user_id) 
WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.customers 
        WHERE customers.id = notes.customer_id AND customers.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- COMPANIES
DROP POLICY IF EXISTS "Users manage own companies" ON public.companies;
CREATE POLICY "Users manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DEALS
DROP POLICY IF EXISTS "Users manage own deals" ON public.deals;
CREATE POLICY "Users manage own deals" ON public.deals 
FOR ALL USING (auth.uid() = user_id) 
WITH CHECK (
    auth.uid() = user_id
    AND (customer_id IS NULL OR EXISTS (SELECT 1 FROM public.customers WHERE customers.id = deals.customer_id AND customers.user_id = auth.uid()))
    AND (company_id IS NULL OR EXISTS (SELECT 1 FROM public.companies WHERE companies.id = deals.company_id AND companies.user_id = auth.uid()))
);

-- TASKS
DROP POLICY IF EXISTS "Users manage own tasks" ON public.tasks;
CREATE POLICY "Users manage own tasks" ON public.tasks 
FOR ALL USING (auth.uid() = user_id) 
WITH CHECK (
    auth.uid() = user_id
    AND (customer_id IS NULL OR EXISTS (SELECT 1 FROM public.customers WHERE customers.id = tasks.customer_id AND customers.user_id = auth.uid()))
    AND (deal_id IS NULL OR EXISTS (SELECT 1 FROM public.deals WHERE deals.id = tasks.deal_id AND deals.user_id = auth.uid()))
);

-- MEETINGS
DROP POLICY IF EXISTS "Users manage own meetings" ON public.meetings;
CREATE POLICY "Users manage own meetings" ON public.meetings 
FOR ALL USING (auth.uid() = user_id) 
WITH CHECK (
    auth.uid() = user_id
    AND (customer_id IS NULL OR EXISTS (SELECT 1 FROM public.customers WHERE customers.id = meetings.customer_id AND customers.user_id = auth.uid()))
    AND (deal_id IS NULL OR EXISTS (SELECT 1 FROM public.deals WHERE deals.id = meetings.deal_id AND deals.user_id = auth.uid()))
);

-- SALES GOALS
DROP POLICY IF EXISTS "Users manage own sales goals" ON public.sales_goals;
CREATE POLICY "Users manage own sales goals" ON public.sales_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WORKSPACES
DROP POLICY IF EXISTS "Users view accessible workspaces" ON public.workspaces;
CREATE POLICY "Users view accessible workspaces" ON public.workspaces FOR SELECT USING (
    auth.uid() = owner_id OR EXISTS (
        SELECT 1 FROM public.workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users insert own workspaces" ON public.workspaces;
CREATE POLICY "Users insert own workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners update own workspaces" ON public.workspaces;
CREATE POLICY "Owners update own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);

-- WORKSPACE MEMBERS
DROP POLICY IF EXISTS "Members can view membership" ON public.workspace_members;
CREATE POLICY "Members can view membership" ON public.workspace_members FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()
    )
);

-- ==============================================================================
-- Table Privileges (GRANTs)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.profiles TO authenticated, service_role;
GRANT ALL ON TABLE public.customers TO authenticated, service_role;
GRANT ALL ON TABLE public.notes TO authenticated, service_role;
GRANT ALL ON TABLE public.companies TO authenticated, service_role;
GRANT ALL ON TABLE public.deals TO authenticated, service_role;
GRANT ALL ON TABLE public.tasks TO authenticated, service_role;
GRANT ALL ON TABLE public.meetings TO authenticated, service_role;
GRANT ALL ON TABLE public.sales_goals TO authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO authenticated, service_role;
GRANT ALL ON TABLE public.workspaces TO authenticated, service_role;
GRANT ALL ON TABLE public.workspace_members TO authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
