import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lqgazrxcrzhaklymbryn.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ2F6cnhjcnpoYWtseW1icnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDc0ODIsImV4cCI6MjA3MzcyMzQ4Mn0.Ge2KN_fRtlLgdlfIVZDrQlVXkoXXCOwsR5v0FTbfvGA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);