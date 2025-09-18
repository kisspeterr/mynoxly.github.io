import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password, firstName, lastName);
        if (error) throw error;
        
        if (data.user) {
          showSuccess('Sikeres regisztráció! Kérjük, erősítse meg e-mail címét.');
          setIsSignUp(false);
          setFirstName('');
          setLastName('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        showSuccess('Sikeres bejelentkezés!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      showError(error.message || (isSignUp ? 'Hiba történt a regisztráció során.' : 'Hiba történt a bejelentkezés során.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 p-4">
      <Card className="w-full max-w-md bg-black/30 border-cyan-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-cyan-300">
            {isSignUp ? 'Regisztráció' : 'Bejelentkezés'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isSignUp 
              ? 'Hozzon létre új fiókot' 
              : 'Jelentkezzen be a fiókjába'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">Keresztnév</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Keresztnév"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={isSignUp}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Vezetéknév</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Vezetéknév"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={isSignUp}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">E-mail cím</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Jelszó</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? 'Regisztráció...' : 'Bejelentkezés...') 
                : (isSignUp ? 'Regisztráció' : 'Bejelentkezés')}
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              {isSignUp ? 'Van már fiókja?' : 'Nincs még fiókja?'}
              <Button
                type="button"
                variant="link"
                className="ml-1 text-cyan-400 hover:text-cyan-300 p-0 h-auto"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Bejelentkezés' : 'Regisztráció'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;