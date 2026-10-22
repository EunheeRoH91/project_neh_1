-- ==============================================================================
-- Migration: 20261022000001_create_rbac_and_rls.sql
-- Description: Supabase Auth RBAC(Role-Based Access Control) & RLS(Row Level Security)
-- Target: Portflio_P01 (매출/정산 및 입금 대사 자동화 시스템)
-- ==============================================================================

-- 1. 사용자 역할 ENUM 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'executive', 'viewer');
    END IF;
END $$;

-- 2. profiles (사용자 프로필 & RBAC 권한 매핑 테이블)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  channel_scope TEXT, -- 영업 관리자(viewer)인 경우 특정 채널 범위 제한 (예: 'B2B', 'SMARTSTORE')
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS 헬퍼 함수 정의 (무한 재귀 방지 및 보안 강화를 위한 SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_executive()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'executive')
  );
$$;

-- 보안 경화: RPC를 통한 임의의 anon/public 직접 호출 차단
REVOKE EXECUTE ON FUNCTION public.get_auth_role() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_executive() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_executive() TO authenticated;

-- 4. 신규 유저 생성 시 profiles 자동 동기화 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'viewer'::user_role),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 5. bank_statements (은행 계좌 입금 원장) 테이블
CREATE TABLE IF NOT EXISTS public.bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  sender_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  reconciliation_status TEXT NOT NULL DEFAULT 'UNMATCHED',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. suspense_amounts (미확인 가수금 보관함) 테이블
CREATE TABLE IF NOT EXISTS public.suspense_amounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_statement_id UUID REFERENCES public.bank_statements(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  sender_name TEXT NOT NULL,
  reason TEXT NOT NULL, -- 'UNMATCHED_AMOUNT', 'DUPLICATE_CANDIDATES', 'UNKNOWN_SENDER'
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED', 'REFUNDED'
  conflict_count INT DEFAULT 0,
  candidate_partner_ids JSONB DEFAULT '[]'::jsonb,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Row Level Security(RLS) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspense_amounts ENABLE ROW LEVEL SECURITY;

-- 8. profiles 테이블 RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy') THEN
    CREATE POLICY profiles_select_policy ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_admin_or_executive());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_policy') THEN
    CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_policy') THEN
    CREATE POLICY profiles_insert_policy ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_admin());
  END IF;
END $$;

-- 9. bank_statements 테이블 RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_statements' AND policyname = 'bank_statements_select_policy') THEN
    CREATE POLICY bank_statements_select_policy ON public.bank_statements
    FOR SELECT TO authenticated
    USING (public.is_admin_or_executive());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_statements' AND policyname = 'bank_statements_admin_policy') THEN
    CREATE POLICY bank_statements_admin_policy ON public.bank_statements
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 10. suspense_amounts 테이블 RLS 정책 (영업 관리자 viewer 접근 원천 차단)
DO $$
BEGIN
  -- SELECT: admin 또는 executive만 허용
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suspense_amounts' AND policyname = 'suspense_amounts_select_policy') THEN
    CREATE POLICY suspense_amounts_select_policy ON public.suspense_amounts
    FOR SELECT TO authenticated
    USING (public.is_admin_or_executive());
  END IF;

  -- MODIFY (INSERT/UPDATE/DELETE): 자금/재무 관리자 admin만 허용
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suspense_amounts' AND policyname = 'suspense_amounts_admin_policy') THEN
    CREATE POLICY suspense_amounts_admin_policy ON public.suspense_amounts
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;
