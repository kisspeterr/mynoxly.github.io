import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/AuthLayout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // We still need isLoading here because the hook might update its state 
    // during sign in/out events, even after AuthLoader finishes.
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Removed initial loading screen, AuthLoader handles it.
  // We keep the check inside useEffect for post-login redirects.

  return (
    <AuthLayout>
      <Auth
        supabaseClient={supabase}
        providers={[]}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                // Primary brand color (used for links, primary buttons)
                brand: 'hsl(185 90% 50%)', // Cyan-500
                brandAccent: 'hsl(270 60% 60%)', // Purple-500
                
                // Backgrounds
                defaultButtonBackground: 'hsl(217.2 32.6% 17.5%)', // Dark secondary
                defaultButtonBackgroundHover: 'hsl(217.2 32.6% 25%)',
                inputBackground: 'hsl(222.2 84% 4.9%)', // Very dark background
                
                // Text and borders
                defaultButtonText: 'hsl(210 40% 98%)', // White/light text
                inputBorder: 'hsl(217.2 32.6% 17.5%)',
                inputBorderHover: 'hsl(185 90% 50%)', // Cyan hover
                inputPlaceholder: 'hsl(215 20.2% 65.1%)',
                
                // Focus ring
                defaultButtonBorder: 'hsl(185 90% 50%)',
              },
            },
          },
        }}
        theme="dark"
        // Removed view="sign_in" to allow registration/sign up view
        redirectTo={window.location.origin + '/'}
      />
    </AuthLayout>
  );
}

export default Login;