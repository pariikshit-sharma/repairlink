-- ==============================================================================
-- REPAIRLINK DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL (Postgres 15+)
-- Description: Complete 8-Phase Foundation, User Profiles, Repair Lifecycle, 
--              Itemized Quotations, Status Milestones, and Institutional Loans.
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'provider', 'institution', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE institution_category AS ENUM ('hospital', 'rehabilitation_centre', 'ngo', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE repair_lifecycle_status AS ENUM (
    'request_submitted',
    'provider_reviewing',
    'quotation_received',
    'awaiting_user_approval',
    'service_scheduled',
    'repair_in_progress',
    'repair_completed',
    'request_closed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE service_mode_preference AS ENUM ('at_home', 'workshop', 'institutional');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL DEFAULT 'New Delhi',
  address TEXT,
  avatar_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'verified',
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON public.profiles(verification_status);

-- 3. Wheelchair User Details Table
CREATE TABLE IF NOT EXISTS public.wheelchair_user_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  wheelchair_type TEXT NOT NULL DEFAULT 'Manual Active',
  wheelchair_brand TEXT,
  wheelchair_model TEXT,
  device_description TEXT,
  seat_width_cm NUMERIC,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wheelchair_user_id ON public.wheelchair_user_details(user_id);

-- 4. Repair Provider Details Table
CREATE TABLE IF NOT EXISTS public.provider_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  service_categories TEXT[] NOT NULL DEFAULT '{"Brake Repairs", "Wheel & Spoke", "General Tuneup"}',
  supported_wheelchair_types TEXT[] NOT NULL DEFAULT '{"Manual Active", "Motorized / Electric"}',
  experience_years TEXT NOT NULL DEFAULT '3-5 years',
  certification_details TEXT,
  service_radius_km INTEGER NOT NULL DEFAULT 25,
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC DEFAULT 4.9,
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_user_id ON public.provider_details(user_id);

-- 5. Institution Details Table (Hospitals, Rehab Centres, NGOs)
CREATE TABLE IF NOT EXISTS public.institution_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  institution_name TEXT NOT NULL,
  institution_category institution_category NOT NULL DEFAULT 'hospital',
  contact_person TEXT,
  available_loaner_units INTEGER NOT NULL DEFAULT 0,
  lending_guidelines TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institution_user_id ON public.institution_details(user_id);

-- 6. PHASE 4: Repair Requests Table
CREATE TABLE IF NOT EXISTS public.repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.profiles(id),
  wheelchair_summary JSONB NOT NULL DEFAULT '{"type": "Manual Active", "brand": "Ottobock", "model": "Zenit R"}',
  issue_category TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  service_preference service_mode_preference NOT NULL DEFAULT 'at_home',
  service_address TEXT NOT NULL,
  status repair_lifecycle_status NOT NULL DEFAULT 'request_submitted',
  urgency TEXT NOT NULL DEFAULT 'standard',
  cancellation_reason TEXT,
  rating INTEGER,
  review_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_requests_user ON public.repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_provider ON public.repair_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON public.repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_ticket ON public.repair_requests(ticket_number);

-- 7. PHASE 4: Itemized Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id),
  parts_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_completion TIMESTAMPTZ,
  notes TEXT,
  itemized_items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_request ON public.quotations(repair_request_id);

-- 8. PHASE 4: Repair Status Milestones History Table
CREATE TABLE IF NOT EXISTS public.repair_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  status repair_lifecycle_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_request ON public.repair_status_history(repair_request_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheelchair_user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin());

CREATE POLICY "Public read verified providers"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (role = 'provider' AND verification_status = 'verified');

CREATE POLICY "Public read verified institutions"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (role = 'institution' AND verification_status = 'verified');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- REPAIR REQUESTS POLICIES
CREATE POLICY "Users can view own repair requests"
  ON public.repair_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR (SELECT auth.uid()) = provider_id 
    OR provider_id IS NULL 
    OR public.is_admin()
  );

CREATE POLICY "Users can insert repair requests"
  ON public.repair_requests FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users and assigned providers can update repair requests"
  ON public.repair_requests FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id 
    OR (SELECT auth.uid()) = provider_id 
    OR public.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id 
    OR (SELECT auth.uid()) = provider_id 
    OR public.is_admin()
  );

-- QUOTATIONS POLICIES
CREATE POLICY "Users and providers can view related quotations"
  ON public.quotations FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = provider_id 
    OR EXISTS (
      SELECT 1 FROM public.repair_requests 
      WHERE id = quotations.repair_request_id AND user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Providers can insert quotations"
  ON public.quotations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = provider_id);

CREATE POLICY "Providers and users can update quotations"
  ON public.quotations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = provider_id 
    OR EXISTS (
      SELECT 1 FROM public.repair_requests 
      WHERE id = quotations.repair_request_id AND user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- STATUS HISTORY POLICIES
CREATE POLICY "Users and providers can view status history"
  ON public.repair_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.repair_requests 
      WHERE id = repair_status_history.repair_request_id 
      AND (user_id = auth.uid() OR provider_id = auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "Authenticated users can insert status history"
  ON public.repair_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role user_role := 'user';
  user_full_name TEXT := 'New Member';
  v_status verification_status := 'verified';
BEGIN
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    assigned_role := (new.raw_user_meta_data->>'role')::user_role;
  END IF;

  IF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    user_full_name := new.raw_user_meta_data->>'full_name';
  END IF;

  IF assigned_role IN ('provider', 'institution') THEN
    v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, email, city, verification_status)
  VALUES (
    new.id,
    assigned_role,
    user_full_name,
    new.email,
    COALESCE(new.raw_user_meta_data->>'city', 'New Delhi'),
    v_status
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- PHASE 5: TEMPORARY MOBILITY SUPPORT & INSTITUTIONAL INVENTORY
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE wheelchair_loan_status AS ENUM (
    'available',
    'request_pending',
    'reserved',
    'currently_lent',
    'under_maintenance'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE loan_request_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'lent_active',
    'returned',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 8. Institutional Inventory Wheelchairs
CREATE TABLE IF NOT EXISTS public.inventory_wheelchairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  serial_tag TEXT NOT NULL UNIQUE,
  model_name TEXT NOT NULL,
  wheelchair_type TEXT NOT NULL,
  manual_or_powered TEXT NOT NULL DEFAULT 'manual',
  seat_width_cm NUMERIC NOT NULL DEFAULT 40,
  weight_capacity_kg NUMERIC NOT NULL DEFAULT 120,
  condition_rating TEXT NOT NULL DEFAULT 'tier_a_mint',
  availability_status wheelchair_loan_status NOT NULL DEFAULT 'available',
  lending_conditions TEXT,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  institution_name TEXT NOT NULL DEFAULT 'AIIMS PMR',
  institution_location TEXT NOT NULL DEFAULT 'Ansari Nagar, New Delhi',
  institution_phone TEXT DEFAULT '+91 11 2658 8500',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_institution ON public.inventory_wheelchairs(institution_id);
CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_status ON public.inventory_wheelchairs(availability_status);
CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_type ON public.inventory_wheelchairs(wheelchair_type);

-- 9. Temporary Support Requests (Patient Loan Applications)
CREATE TABLE IF NOT EXISTS public.temporary_support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  wheelchair_id UUID REFERENCES public.inventory_wheelchairs(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repair_ticket_id TEXT,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_email TEXT,
  user_address TEXT NOT NULL,
  requested_start_date DATE NOT NULL,
  requested_end_date DATE NOT NULL,
  delivery_mode TEXT NOT NULL DEFAULT 'pickup',
  patient_medical_notes TEXT,
  status loan_request_status NOT NULL DEFAULT 'pending',
  institution_notes TEXT,
  pickup_instructions TEXT,
  lent_at TIMESTAMPTZ,
  expected_return_date DATE,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tmp_requests_user ON public.temporary_support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_institution ON public.temporary_support_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_status ON public.temporary_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_repair_ticket ON public.temporary_support_requests(repair_ticket_id);

-- 10. Enable RLS for Phase 5 Tables
ALTER TABLE public.inventory_wheelchairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_support_requests ENABLE ROW LEVEL SECURITY;

-- Inventory RLS: Anyone can view inventory wheelchairs
CREATE POLICY "Anyone can view inventory wheelchairs"
  ON public.inventory_wheelchairs FOR SELECT
  USING (true);

-- Institutions can insert/update/delete their own inventory
CREATE POLICY "Institutions can manage their own inventory"
  ON public.inventory_wheelchairs FOR ALL
  TO authenticated
  USING (institution_id = auth.uid() OR public.is_admin())
  WITH CHECK (institution_id = auth.uid() OR public.is_admin());

-- Temporary Support Requests RLS:
-- Users can see their own requests; Institutions can see requests assigned to them; Admins see all
CREATE POLICY "Users and institutions can view their loan requests"
  ON public.temporary_support_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR institution_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "Authenticated users can submit temporary loan requests"
  ON public.temporary_support_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Institutions and users can update their loan requests"
  ON public.temporary_support_requests FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR institution_id = auth.uid() 
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR institution_id = auth.uid() 
    OR public.is_admin()
  );
