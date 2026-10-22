import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  'https://fwepupbrjuihlltyceyo.supabase.co';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZXB1cGJyanVpaGxsdHljZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODA4OTMsImV4cCI6MjEwODA1Njg5M30.l1jG49Ca7YaHrSfSv19ys-MiqnDGi2xNLtefJHjfkwg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 현재 로그인한 사용자의 프로필 및 Role 조회
 */
export async function getCurrentUserProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, profile: null, error: authError };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile, error: profileError };
}
