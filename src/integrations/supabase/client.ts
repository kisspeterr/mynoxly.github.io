import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Supabase Anon Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'undefined');
  throw new Error('Missing Supabase environment variables');
}

// Create client with timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'noxly-app',
    },
  },
  db: {
    schema: 'public',
  },
});

// Test connection with timeout
const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection with timeout...');
    
    // Use Promise.race to add timeout
    const connectionTest = Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    const result = await connectionTest;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Run connection test but don't block the app
testConnection().catch(() => {
  console.log('⚠️ Supabase connection test failed, but continuing...');
});

// Add global error logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Auth state change:', event, session?.user?.id);
});