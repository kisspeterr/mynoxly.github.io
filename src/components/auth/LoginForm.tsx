import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

// Define the schema for form validation
const loginSchema = z.object({
  email: z.string().email('Érvénytelen email cím.'),
  password: z.string().min(1, 'A jelszó kötelező.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Supabase often returns generic errors for security reasons (e.g., Invalid login credentials)
        showError('Sikertelen bejelentkezés. Ellenőrizd az email címet és a jelszót.');
        console.error('Login error:', error);
        return;
      }

      // Success is handled by the useAuth hook redirecting the user
      
    } catch (error) {
      showError('Váratlan hiba történt a bejelentkezés során.');
      console.error('Unexpected login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">E-mail cím</Label>
        <Input 
          id="email"
          type="email" 
          {...register('email')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Jelszó</Label>
        <Input 
          id="password"
          type="password" 
          {...register('password')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
        Bejelentkezés
      </Button>
      
      <div className="text-center pt-2">
        <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Elfelejtetted a jelszavad?</a>
      </div>
    </form>
  );
};

export default LoginForm;