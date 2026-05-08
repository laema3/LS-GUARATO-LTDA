import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://ztxzqveyavgvwnbkqyhb.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eHpxdmV5YXZndnduYmtxeWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDQyNTksImV4cCI6MjA5MjI4MDI1OX0.-nLltEZvvwwjjgo06NAB5GwW-iRwn6Jq0lsWgSgyqyA').trim();

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = !!(supabaseUrl && !supabaseUrl.includes('placeholder'));
