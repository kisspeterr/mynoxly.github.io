// This is a utility file to help create admin users
// You can run this in the browser console after logging in

export const makeCurrentUserAdmin = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.error('No user logged in');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', session.user.id);

  if (error) {
    console.error('Error making user admin:', error);
  } else {
    console.log('User is now admin. Please refresh the page.');
  }
};

// To use this, call makeCurrentUserAdmin() in the browser console after logging in