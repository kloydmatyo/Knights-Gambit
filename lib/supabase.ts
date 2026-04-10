import { createClient } from '@supabase/supabase-js';

export type LeaderboardEntry = {
  id?: string;
  nickname: string;
  floor_reached: number;
  character_class: string;
  enemies_killed: number;
  turns: number;
  created_at?: string;
};

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};
