import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : (rawUrl ? `https://${rawUrl}` : 'https://placeholder.supabase.co');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder'
);
