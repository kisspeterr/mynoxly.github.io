import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Save, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface EmailTemplate {
  id: string;
  organization_name: string;
  template_type: 'coupon_redemption';
  subject: string;
  body: string;
}

const TEMPLATE_TYPE = 'coupon_redemption';

const EmailTemplatesPage: React.FC = () => {
  const { profile, user, isLoading: isAuthLoading } = useAuth();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const organizationName = profile?.organization_name;

  const fetchTemplate = async () => {
    if (!organizationName) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_name', organizationName)
        .eq('template_type', TEMPLATE_TYPE)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        showError('Hiba történt az email sablon betöltésekor.');
        console.error('Fetch template error:', error);
        setTemplate(null);
      } else if (data) {
        setTemplate(data as EmailTemplate);
        setSubject(data.subject);
        setBody(data.body);
      } else {
        // Set default template if none found
        setTemplate(null);
        setSubject('Sikeres kupon beváltás a NOXLY-n!');
        setBody('Kedves Felhasználó!\n\nSikeresen beváltottad a(z) "{{coupon_title}}" kupont a(z) {{organization_name}} helyen. Köszönjük, hogy a NOXLY-t használod!\n\nÜdvözlettel,\nA NOXLY csapata');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationName) {
      fetchTemplate();
    }
  }, [organizationName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName || isSaving) return;

    setIsSaving(true);
    
    const newTemplateData = {
      organization_name: organizationName,
      template_type: TEMPLATE_TYPE,
      subject: subject.trim(),
      body: body.trim(),
    };

    try {
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update(newTemplateData)
          .eq('id', template.id);

        if (error) throw error;
        showSuccess('Email sablon sikeresen frissítve!');
      } else {
        // Insert new template
        const { data, error } = await supabase
          .from('email_templates')
          .insert([newTemplateData])
          .select()
          .single();

        if (error) throw error;
        setTemplate(data as EmailTemplate);
        showSuccess('Email sablon sikeresen létrehozva!');
      }
      
      await fetchTemplate(); // Re-fetch to ensure state consistency

    } catch (error) {
      showError('Hiba történt a sablon mentésekor.');
      console.error('Template save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Email sablon betöltése...</p>
      </div>
    );
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Beváltási Email Sablon
        </CardTitle>
        <p className="text-gray-400">Állítsd be az email tartalmát, amit a felhasználók kapnak sikeres kupon beváltás után.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-sm text-yellow-300 flex items-start">
            <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
            <p className="text-left">
              Használható változók: <code>{{coupon_title}}</code> (a kupon címe) és <code>{{organization_name}}</code> (a szervezet neve).
              <br/>
              **FONTOS:** Az email küldéshez be kell állítanod a <code>RESEND_API_KEY</code> titkot a Supabase Edge Functions beállításainál.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-300">Email Tárgy *</Label>
            <Input 
              id="subject"
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-gray-300">Email Törzs (HTML/Text) *</Label>
            <Textarea 
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={10}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 font-mono"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            disabled={isSaving || !subject.trim() || !body.trim()}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Sablon mentése
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailTemplatesPage;