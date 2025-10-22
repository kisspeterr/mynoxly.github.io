import React, { useState } from 'react';
import { useEmailTemplates, EmailTemplate, EmailTemplateInsert } from '@/hooks/use-email-templates';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mail, Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import EmailTemplateForm from './EmailTemplateForm';

// Define placeholders for different template types
const COUPON_PLACEHOLDERS = ['coupon_title', 'organization_name'];
const EVENT_PLACEHOLDERS = ['event_title', 'organization_name'];

interface TemplateEditDialogProps {
  template: EmailTemplate;
  onUpdate: (id: string, data: Partial<EmailTemplateInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({ template, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine placeholders based on template name convention (simple heuristic)
  const placeholders = template.template_name.toLowerCase().includes('coupon') 
    ? COUPON_PLACEHOLDERS 
    : template.template_name.toLowerCase().includes('event') 
    ? EVENT_PLACEHOLDERS 
    : [...COUPON_PLACEHOLDERS, ...EVENT_PLACEHOLDERS]; // Default to all

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 border-pink-500/50 text-pink-300 hover:bg-pink-500/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 border-pink-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pink-300">Sablon szerkesztése</DialogTitle>
          <DialogDescription className="text-gray-400">
            Frissítsd a "{template.template_name}" sablon tartalmát.
          </DialogDescription>
        </DialogHeader>
        <EmailTemplateForm 
          onSubmit={(data) => onUpdate(template.id, data)} 
          onClose={() => setIsOpen(false)} 
          isLoading={isLoading}
          initialData={template}
          placeholders={placeholders}
        />
      </DialogContent>
    </Dialog>
  );
};

const EmailTemplateCard: React.FC<{ template: EmailTemplate, onDelete: (id: string) => Promise<{ success: boolean }>, onUpdate: (id: string, data: Partial<EmailTemplateInsert>) => Promise<{ success: boolean }>, isLoading: boolean }> = ({ template, onDelete, onUpdate, isLoading }) => {
  return (
    <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-pink-500/20 transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-pink-300">{template.template_name}</CardTitle>
        <div className="flex space-x-2">
          <TemplateEditDialog template={template} onUpdate={onUpdate} isLoading={isLoading} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-400">Sablon törlése</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Biztosan törölni szeretnéd a "{template.template_name}" sablont? Ez a művelet nem visszavonható, és minden kupon/esemény, ami ezt használja, email nélkül marad.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(template.id)}
                >
                  Törlés megerősítése
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <CardDescription className="text-gray-400 truncate">{template.subject}</CardDescription>
        <p className="text-sm text-gray-500 line-clamp-2">{template.body}</p>
      </CardContent>
    </Card>
  );
};

const EmailTemplatesPage: React.FC = () => {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
        <p className="ml-3 text-gray-300">Sablonok betöltése...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-pink-300 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Email Sablonok Kezelése
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Új Sablon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/80 border-pink-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-pink-300">Új Email Sablon Létrehozása</DialogTitle>
              <DialogDescription className="text-gray-400">
                Hozd létre az új sablont a kuponokhoz vagy eseményekhez.
              </DialogDescription>
            </DialogHeader>
            <EmailTemplateForm 
              onSubmit={createTemplate} 
              onClose={() => setIsFormOpen(false)} 
              isLoading={isLoading}
              placeholders={[...COUPON_PLACEHOLDERS, ...EVENT_PLACEHOLDERS]}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10">Még nincsenek email sablonok létrehozva.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <EmailTemplateCard 
              key={template.id} 
              template={template} 
              onDelete={deleteTemplate} 
              onUpdate={updateTemplate}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesPage;