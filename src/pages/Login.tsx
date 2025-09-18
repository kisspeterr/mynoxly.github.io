import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      showSuccess('Sikeres bejelentkezés!');
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">NOXLY</CardTitle>
          <CardDescription className="text-gray-300">
            {isSignUp ? 'Regisztráció' : 'Bejelentkezés'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            redirectTo={`${window.location.origin}/`}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#06b6d4',
                    brandAccent: '#8b5cf6',
                  },
                },
              },
              className: {
                button: 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white',
                input: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500',
                label: 'text-gray-300',
                anchor: 'text-cyan-400 hover:text-cyan-300',
              },
            }}
            view={isSignUp ? 'sign_up' : 'sign_in'}
            showLinks={false}
          />
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-cyan-400 hover:text-cyan-300"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp 
                ? 'Már van fiókja? Bejelentkezés' 
                : 'Nincs még fiókja? Regisztráció'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;