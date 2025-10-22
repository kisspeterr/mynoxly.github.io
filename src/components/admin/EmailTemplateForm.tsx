import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, Info } from 'lucide-react';
import { EmailTemplate, EmailTemplateInsert } from '@/hooks/use-email-templates';

const templateSchema = z.object({
  template_name: z.string().min(3, 'A sablon neve túl rövid.'),
  subject: z.string().min(5, 'A tárgy túl rövid.'),
  body: z.string().min(10, 'A törzs túl rövid.'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EmailTemplateFormProps {
  onSubmit: (data: EmailTemplateInsert) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
  initialData?: EmailTemplate;
  placeholders: string[];
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ onSubmit, onClose, isLoading, initialData, placeholders }) => {
  
  const defaultValues: TemplateFormData = {
    template_name: initialData?.template_name || '',
    subject: initialData?.subject || '',
    body: initialData?.body || '',
  };

  const { register, handleSubmit, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues,
  });

  const isEditing = !!initialData;

  const handleFormSubmit = async (data: TemplateFormData) => {
    const result = await onSubmit(data);
    if (result.success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template_name" className="text-gray-300">Sablon neve *</Label>
        <Input 
          id="template_name"
          {...register('template_name')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          disabled={isEditing}
        />
        {errors.template_name && <p className="text-red-400 text-sm">{errors.template_name.message}</p>}
        {isEditing && <p className="text-gray-500 text-xs">A sablon neve nem szerkeszthető.</p>}
      </div>
      
      <div className="space-y-4 p-4 border border-pink-500/30 rounded-lg">
          <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-sm text-yellow-300 flex items-start">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
              <p className="text-left">
                  Használható változók: {placeholders.map(p => <code>{`{{${p}}}`}</code>).reduce((prev, curr) => [prev, ', ', curr])}
              </p>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-300">Email Tárgy *</Label>
              <Input 
                id="subject"
                type="text" 
                {...register('subject')}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.subject && <p className="text-red-400 text-sm">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-300">Email Törzs (HTML/Text) *</Label>
              <Textarea 
                id="body"
                rows={8}
                {...register('body')}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 font-mono"
              />
              {errors.body && <p className="text-red-400 text-sm">{errors.body.message}</p>}
          </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        disabled={isLoading}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Mentés...' : (isEditing ? 'Sablon frissítése' : 'Sablon létrehozása')}
      </Button>
    </form>
  );
};

export default EmailTemplateForm;