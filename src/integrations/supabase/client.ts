import { createClient } from '@supabase/supabase-js';

// Test connection function
const testSupabaseConnection = async (supabaseUrl: string, supabaseAnonKey: string) => {
  try {
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await testClient.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'undefined');
  
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Test connection before creating main client
testSupabaseConnection(supabaseUrl, supabaseAnonKey).then(isConnected => {
  if (!isConnected) {
    console.error('⚠️ Supabase connection failed. The app may not work properly.');
  }
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Add global error handler for Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  }
});