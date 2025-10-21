import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

// Define password complexity rules
const passwordSchema = z.string()
  .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie.")
  .regex(/[A-Z]/, "Tartalmaznia kell legalább egy nagybetűt.")
  .regex(/[a-z]/, "Tartalmaznia kell legalább egy kisbetűt.")
  .regex(/[0-9]/, "Tartalmaznia kell legalább egy számot.")
  .regex(/[^A-Za-z0-9]/, "Tartalmaznia kell legalább egy speciális karaktert.");

// Define the schema for form validation
const signupSchema = z.object({
  first_name: z.string().min(2, 'A keresztnév kötelező.'),
  last_name: z.string().min(2, 'A vezetéknév kötelező.'),
  email: z.string().email('Érvénytelen email cím.'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek.",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
        },
      });

      if (error) {
        showError(`Regisztrációs hiba: ${error.message}`);
        console.error('Signup error:', error);
        return;
      }

      showSuccess('Sikeres regisztráció! Kérjük, ellenőrizd az email címedet a fiók aktiválásához.');
      // Note: Supabase automatically redirects after successful signup if redirectTo is set in the client config, 
      // but since we are using a custom form, we rely on the user checking their email.
      
    } catch (error) {
      showError('Váratlan hiba történt a regisztráció során.');
      console.error('Unexpected signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-gray-300">Keresztnév *</Label>
          <Input 
            id="first_name"
            {...register('first_name')}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.first_name && <p className="text-red-400 text-sm">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-gray-300">Vezetéknév *</Label>
          <Input 
            id="last_name"
            {...register('last_name')}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.last_name && <p className="text-red-400 text-sm">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">E-mail cím *</Label>
        <Input 
          id="email"
          type="email" 
          {...register('email')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Jelszó *</Label>
        <Input 
          id="password"
          type="password" 
          {...register('password')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
        <PasswordStrengthIndicator password={password} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-300">Jelszó megerősítése *</Label>
        <Input 
          id="confirmPassword"
          type="password" 
          {...register('confirmPassword')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
        Regisztráció
      </Button>
    </form>
  );
};

export default SignupForm;