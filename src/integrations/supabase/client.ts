import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// By removing the custom auth configuration, we revert to the default,
// which is localStorage. This is more robust, especially in iframe environments.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);