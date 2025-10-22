import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Building, Mail, Phone } from 'lucide-react';
import Navigation from '@/components/sections/Navigation';
import FooterSection from '@/components/sections/FooterSection';
import { showError, showSuccess } from '@/utils/toast';

// Define the schema for form validation
const partnerSignupSchema = z.object({
  organizationName: z.string().min(3, 'A szervezet neve kötelező.'),
  contactName: z.string().min(3, 'A kapcsolattartó neve kötelező.'),
  email: z.string().email('Érvénytelen email cím.'),
  phone: z.string().optional(),
  message: z.string().min(10, 'A rövid üzenet kötelező.'),
});

type PartnerSignupFormData = z.infer<typeof partnerSignupSchema>;

const PartnerSignup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartnerSignupFormData>({
    resolver: zodResolver(partnerSignupSchema),
    defaultValues: {
      organizationName: '',
      contactName: '',
      email: '',
      phone: '',
      message: '',
    }
  });

  const onSubmit = async (data: PartnerSignupFormData) => {
    setIsLoading(true);
    
    // NOTE: In a real application, this is where you would send the data to a backend service (e.g., Supabase Edge Function, email service).
    // For this demo, we simulate a successful submission.
    console.log('Partner Signup Data:', data);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    showSuccess('Üzenetedet sikeresen elküldtük! Hamarosan felvesszük veled a kapcsolatot.');
    reset();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      <Navigation />
      <main className="pt-32 pb-20 px-6 container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Building className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-purple-300 mb-4">Légy a NOXLY Partnere!</h1>
          <p className="text-lg text-gray-400">
            Töltsd ki az űrlapot, és segítünk növelni az üzleted forgalmát Pécs éjszakai életében.
          </p>
        </div>

        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-gray-300 flex items-center"><Building className="h-4 w-4 mr-2" /> Szervezet neve *</Label>
              <Input 
                id="organizationName"
                {...register('organizationName')}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.organizationName && <p className="text-red-400 text-sm">{errors.organizationName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-gray-300 flex items-center"><User className="h-4 w-4 mr-2" /> Kapcsolattartó neve *</Label>
              <Input 
                id="contactName"
                {...register('contactName')}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.contactName && <p className="text-red-400 text-sm">{errors.contactName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center"><Mail className="h-4 w-4 mr-2" /> E-mail cím *</Label>
                <Input 
                  id="email"
                  type="email" 
                  {...register('email')}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300 flex items-center"><Phone className="h-4 w-4 mr-2" /> Telefonszám (opcionális)</Label>
                <Input 
                  id="phone"
                  type="tel" 
                  {...register('phone')}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
                {errors.phone && <p className="text-red-400 text-sm">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-300">Üzenet / Kérdés *</Label>
              <Textarea 
                id="message"
                {...register('message')}
                rows={4}
                placeholder="Írd le röviden, miben segíthetünk..."
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.message && <p className="text-red-400 text-sm">{errors.message.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Üzenet küldése
            </Button>
          </form>
        </Card>
      </main>
      <FooterSection />
    </div>
  );
};

export default PartnerSignup;