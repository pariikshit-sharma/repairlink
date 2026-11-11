-- ==============================================================================
-- REPAIRLINK DATABASE SCHEMA & HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- Target: Supabase PostgreSQL 15+ (Verified on PostgreSQL 17)
-- Description: Complete 8-Phase Foundation, User Profiles, Role Onboarding,
--              Repair Lifecycle, Itemized Quotations, Milestones & Loaners.
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS private;

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'provider', 'institution', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.institution_category AS ENUM ('hospital', 'rehabilitation_centre', 'ngo', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.repair_lifecycle_status AS ENUM (
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
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.service_mode_preference AS ENUM ('at_home', 'workshop', 'institutional');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.wheelchair_loan_status AS ENUM (
    'available',
    'request_pending',
    'reserved',
    'currently_lent',
    'under_maintenance'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.loan_request_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'lent_active',
    'returned',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tables & Foreign-Key Indexes
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'user',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL DEFAULT 'New Delhi',
  address TEXT,
  avatar_url TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'verified',
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON public.profiles(verification_status);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_wheelchair_user_id ON public.wheelchair_user_details(user_id);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_provider_user_id ON public.provider_details(user_id);

CREATE TABLE IF NOT EXISTS public.institution_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  institution_name TEXT NOT NULL,
  institution_category public.institution_category NOT NULL DEFAULT 'hospital',
  contact_person TEXT,
  available_loaner_units INTEGER NOT NULL DEFAULT 0,
  lending_guidelines TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_institution_user_id ON public.institution_details(user_id);

CREATE TABLE IF NOT EXISTS public.repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.profiles(id),
  wheelchair_summary JSONB NOT NULL DEFAULT '{"type": "Manual Active", "brand": "Ottobock", "model": "Zenit R"}'::jsonb,
  issue_category TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  service_preference public.service_mode_preference NOT NULL DEFAULT 'at_home',
  service_address TEXT NOT NULL,
  status public.repair_lifecycle_status NOT NULL DEFAULT 'request_submitted',
  urgency TEXT NOT NULL DEFAULT 'standard',
  cancellation_reason TEXT,
  rating INTEGER,
  review_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_repair_requests_user ON public.repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_provider ON public.repair_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON public.repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_ticket ON public.repair_requests(ticket_number);

CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id),
  parts_cost NUMERIC NOT NULL DEFAULT 0,
  labor_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_completion TIMESTAMPTZ,
  notes TEXT,
  itemized_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_quotations_request ON public.quotations(repair_request_id);
CREATE INDEX IF NOT EXISTS idx_quotations_provider ON public.quotations(provider_id);

CREATE TABLE IF NOT EXISTS public.repair_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  status public.repair_lifecycle_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_request ON public.repair_status_history(repair_request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON public.repair_status_history(changed_by);

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
  availability_status public.wheelchair_loan_status NOT NULL DEFAULT 'available',
  lending_conditions TEXT,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  institution_name TEXT NOT NULL DEFAULT 'AIIMS PMR',
  institution_location TEXT NOT NULL DEFAULT 'Ansari Nagar, New Delhi',
  institution_phone TEXT DEFAULT '+91 11 2658 8500',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_institution ON public.inventory_wheelchairs(institution_id);
CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_status ON public.inventory_wheelchairs(availability_status);
CREATE INDEX IF NOT EXISTS idx_inv_wheelchairs_type ON public.inventory_wheelchairs(wheelchair_type);

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
  status public.loan_request_status NOT NULL DEFAULT 'pending',
  institution_notes TEXT,
  pickup_instructions TEXT,
  lent_at TIMESTAMPTZ,
  expected_return_date DATE,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_tmp_requests_user ON public.temporary_support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_institution ON public.temporary_support_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_wheelchair ON public.temporary_support_requests(wheelchair_id);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_status ON public.temporary_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_tmp_requests_repair_ticket ON public.temporary_support_requests(repair_ticket_id);

-- 3. Private Security Helpers & Role Protection Triggers
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_verified_provider()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'provider' AND verification_status = 'verified'
  );
$$;

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_verified_provider() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_profile_role_and_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NOT NULL AND NOT private.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
       OR NEW.verification_notes IS DISTINCT FROM OLD.verification_notes THEN
      RAISE EXCEPTION 'Only platform administrators may modify role or verification status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  raw_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  assigned_role public.user_role := 'user';
  user_full_name TEXT := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'New Member');
  v_status public.verification_status := 'verified';
BEGIN
  IF raw_role IN ('user', 'provider', 'institution') THEN
    assigned_role := raw_role::public.user_role;
  ELSE
    assigned_role := 'user';
  END IF;

  IF assigned_role IN ('provider', 'institution') THEN
    v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, email, phone, city, verification_status)
  VALUES (
    NEW.id,
    assigned_role,
    user_full_name,
    NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'city'), ''), 'New Delhi'),
    v_status
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_protect_profile_role_and_status ON public.profiles;
CREATE TRIGGER trg_protect_profile_role_and_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.protect_profile_role_and_status();

DROP TRIGGER IF EXISTS trg_wheelchair_user_details_updated_at ON public.wheelchair_user_details;
CREATE TRIGGER trg_wheelchair_user_details_updated_at
  BEFORE UPDATE ON public.wheelchair_user_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_provider_details_updated_at ON public.provider_details;
CREATE TRIGGER trg_provider_details_updated_at
  BEFORE UPDATE ON public.provider_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_institution_details_updated_at ON public.institution_details;
CREATE TRIGGER trg_institution_details_updated_at
  BEFORE UPDATE ON public.institution_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_repair_requests_updated_at ON public.repair_requests;
CREATE TRIGGER trg_repair_requests_updated_at
  BEFORE UPDATE ON public.repair_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_quotations_updated_at ON public.quotations;
CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_wheelchairs_updated_at ON public.inventory_wheelchairs;
CREATE TRIGGER trg_inventory_wheelchairs_updated_at
  BEFORE UPDATE ON public.inventory_wheelchairs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_tmp_support_requests_updated_at ON public.temporary_support_requests;
CREATE TRIGGER trg_tmp_support_requests_updated_at
  BEFORE UPDATE ON public.temporary_support_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- 4. Enable Row Level Security (RLS) Across All Public Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheelchair_user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_wheelchairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_support_requests ENABLE ROW LEVEL SECURITY;

-- 5. Consolidated Single-Policy-Per-Action RLS Policies
DROP POLICY IF EXISTS "profiles_select_anon" ON public.profiles;
CREATE POLICY "profiles_select_anon"
  ON public.profiles FOR SELECT
  TO anon
  USING (role IN ('provider', 'institution') AND verification_status = 'verified');

DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (role IN ('provider', 'institution') AND verification_status = 'verified')
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role IN ('user', 'provider', 'institution')
  );

DROP POLICY IF EXISTS "profiles_update_owner_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_owner_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id OR private.is_admin())
  WITH CHECK ((SELECT auth.uid()) = id OR private.is_admin());

DROP POLICY IF EXISTS "wheelchair_details_select" ON public.wheelchair_user_details;
CREATE POLICY "wheelchair_details_select"
  ON public.wheelchair_user_details FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_admin());

DROP POLICY IF EXISTS "wheelchair_details_insert" ON public.wheelchair_user_details;
CREATE POLICY "wheelchair_details_insert"
  ON public.wheelchair_user_details FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "wheelchair_details_update" ON public.wheelchair_user_details;
CREATE POLICY "wheelchair_details_update"
  ON public.wheelchair_user_details FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR private.is_admin());

DROP POLICY IF EXISTS "provider_details_select" ON public.provider_details;
CREATE POLICY "provider_details_select"
  ON public.provider_details FOR SELECT
  TO anon, authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR private.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = provider_details.user_id
        AND p.role = 'provider'
        AND p.verification_status = 'verified'
    )
  );

DROP POLICY IF EXISTS "provider_details_insert" ON public.provider_details;
CREATE POLICY "provider_details_insert"
  ON public.provider_details FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "provider_details_update" ON public.provider_details;
CREATE POLICY "provider_details_update"
  ON public.provider_details FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR private.is_admin());

DROP POLICY IF EXISTS "institution_details_select" ON public.institution_details;
CREATE POLICY "institution_details_select"
  ON public.institution_details FOR SELECT
  TO anon, authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR private.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = institution_details.user_id
        AND p.role = 'institution'
        AND p.verification_status = 'verified'
    )
  );

DROP POLICY IF EXISTS "institution_details_insert" ON public.institution_details;
CREATE POLICY "institution_details_insert"
  ON public.institution_details FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "institution_details_update" ON public.institution_details;
CREATE POLICY "institution_details_update"
  ON public.institution_details FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR private.is_admin());

DROP POLICY IF EXISTS "repair_requests_select" ON public.repair_requests;
CREATE POLICY "repair_requests_select"
  ON public.repair_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = provider_id
    OR (provider_id IS NULL AND private.is_verified_provider())
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "repair_requests_insert" ON public.repair_requests;
CREATE POLICY "repair_requests_insert"
  ON public.repair_requests FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "repair_requests_update" ON public.repair_requests;
CREATE POLICY "repair_requests_update"
  ON public.repair_requests FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = provider_id
    OR (provider_id IS NULL AND private.is_verified_provider())
    OR private.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = provider_id
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "quotations_select" ON public.quotations;
CREATE POLICY "quotations_select"
  ON public.quotations FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = provider_id
    OR EXISTS (
      SELECT 1 FROM public.repair_requests rr
      WHERE rr.id = quotations.repair_request_id
        AND rr.user_id = (SELECT auth.uid())
    )
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "quotations_insert" ON public.quotations;
CREATE POLICY "quotations_insert"
  ON public.quotations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = provider_id);

DROP POLICY IF EXISTS "quotations_update" ON public.quotations;
CREATE POLICY "quotations_update"
  ON public.quotations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = provider_id
    OR EXISTS (
      SELECT 1 FROM public.repair_requests rr
      WHERE rr.id = quotations.repair_request_id
        AND rr.user_id = (SELECT auth.uid())
    )
    OR private.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = provider_id
    OR EXISTS (
      SELECT 1 FROM public.repair_requests rr
      WHERE rr.id = quotations.repair_request_id
        AND rr.user_id = (SELECT auth.uid())
    )
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "repair_status_history_select" ON public.repair_status_history;
CREATE POLICY "repair_status_history_select"
  ON public.repair_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.repair_requests rr
      WHERE rr.id = repair_status_history.repair_request_id
        AND (rr.user_id = (SELECT auth.uid()) OR rr.provider_id = (SELECT auth.uid()))
    )
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "repair_status_history_insert" ON public.repair_status_history;
CREATE POLICY "repair_status_history_insert"
  ON public.repair_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.repair_requests rr
      WHERE rr.id = repair_status_history.repair_request_id
        AND (rr.user_id = (SELECT auth.uid()) OR rr.provider_id = (SELECT auth.uid()))
    )
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "inventory_wheelchairs_select" ON public.inventory_wheelchairs;
CREATE POLICY "inventory_wheelchairs_select"
  ON public.inventory_wheelchairs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "inventory_wheelchairs_insert" ON public.inventory_wheelchairs;
CREATE POLICY "inventory_wheelchairs_insert"
  ON public.inventory_wheelchairs FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = institution_id OR private.is_admin());

DROP POLICY IF EXISTS "inventory_wheelchairs_update" ON public.inventory_wheelchairs;
CREATE POLICY "inventory_wheelchairs_update"
  ON public.inventory_wheelchairs FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = institution_id OR private.is_admin())
  WITH CHECK ((SELECT auth.uid()) = institution_id OR private.is_admin());

DROP POLICY IF EXISTS "inventory_wheelchairs_delete" ON public.inventory_wheelchairs;
CREATE POLICY "inventory_wheelchairs_delete"
  ON public.inventory_wheelchairs FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = institution_id OR private.is_admin());

DROP POLICY IF EXISTS "temporary_support_requests_select" ON public.temporary_support_requests;
CREATE POLICY "temporary_support_requests_select"
  ON public.temporary_support_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = institution_id
    OR private.is_admin()
  );

DROP POLICY IF EXISTS "temporary_support_requests_insert" ON public.temporary_support_requests;
CREATE POLICY "temporary_support_requests_insert"
  ON public.temporary_support_requests FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id OR private.is_admin());

DROP POLICY IF EXISTS "temporary_support_requests_update" ON public.temporary_support_requests;
CREATE POLICY "temporary_support_requests_update"
  ON public.temporary_support_requests FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = institution_id
    OR private.is_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = institution_id
    OR private.is_admin()
  );

-- 6. Explicit Data API Privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles, public.provider_details, public.institution_details, public.inventory_wheelchairs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
