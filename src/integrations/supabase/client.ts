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

// Test connection immediately
const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test auth access
    const { data: authData, error: authError } = await testClient.auth.getSession();
    console.log('🔐 Auth test:', authError ? 'ERROR' : 'SUCCESS', authError);
    
    // Test database access
    const { data: dbData, error: dbError } = await testClient.from('profiles').select('count').limit(1);
    console.log('🗄️ Database test:', dbError ? 'ERROR' : 'SUCCESS', dbError);
    
    if (authError || dbError) {
      console.error('❌ Supabase connection failed');
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('💥 Supabase connection error:', error);
    return false;
  }
};

testConnection().then(isConnected => {
  if (!isConnected) {
    console.error('⚠️ Supabase connection failed - app may not work properly');
  }
});

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
});

// Add global error logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Auth state change:', event, session?.user?.id);
});