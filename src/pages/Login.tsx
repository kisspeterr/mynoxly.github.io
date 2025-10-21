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
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950">
        <p className="text-cyan-400">Betöltés...</p>
      </div>
    );
  }

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
                brand: 'hsl(200 60% 50%)', // Cyan-like color
                brandAccent: 'hsl(270 60% 50%)', // Purple-like color
                inputBackground: 'hsl(222.2 84% 4.9%)', // Dark background
                inputBorder: 'hsl(217.2 32.6% 17.5%)',
                inputBorderHover: 'hsl(200 60% 50%)',
                inputPlaceholder: 'hsl(215 20.2% 65.1%)',
                defaultButtonBackground: 'hsl(217.2 32.6% 17.5%)',
                defaultButtonBackgroundHover: 'hsl(217.2 32.6% 25%)',
                defaultButtonBorder: 'hsl(217.2 32.6% 17.5%)',
                defaultButtonText: 'hsl(210 40% 98%)',
              },
            },
          },
        }}
        theme="dark"
        view="sign_in"
        redirectTo={window.location.origin + '/'}
      />
    </AuthLayout>
  );
}

export default Login;