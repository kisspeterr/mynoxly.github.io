import { supabase } from '@/integrations/supabase/client';

// Function to make a user an admin (for testing purposes)
export const makeUserAdmin = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (error) {
    console.error('Error making user admin:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Function to get all users (admin only)
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return { success: false, error };
  }

  return { success: true, data };
};

// Function to get user count
export const getUserCount = async () => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching user count:', error);
    return { success: false, error };
  }

  return { success: true, count };
};