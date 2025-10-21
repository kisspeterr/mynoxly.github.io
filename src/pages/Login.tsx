import AuthLayout from '@/components/AuthLayout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { LogIn, UserPlus } from 'lucide-react';

function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect authenticated users to the home page
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <AuthLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50">
          <TabsTrigger 
            value="login" 
            className="data-[state=active]:bg-cyan-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
          >
            <LogIn className="h-4 w-4 mr-2" /> Bejelentkezés
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="data-[state=active]:bg-purple-600/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Regisztráció
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </div>
      </Tabs>
    </AuthLayout>
  );
}

export default Login;