import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, Save, MapPin, Mail, Info } from 'lucide-react';
import { Event, EventInsert } from '@/types/events';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoupons } from '@/hooks/use-coupons';
import { showError } from '@/utils/toast';
import { Switch } from '@/components/ui/switch';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const eventSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  location: z.string().nullable().optional().transform(e => e === "" ? null : e),
  image_url: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  coupon_id: z.string().nullable().optional().transform(e => e === "" ? null : e),
  
  // Start Date and Time handling
  startDate: z.date({ required_error: "A kezdő dátum kötelező." }),
  startTime: z.string().regex(timeRegex, "Érvénytelen kezdő idő formátum (HH:MM)."),
  
  // End Date and Time handling (Optional)
  endDate: z.date().nullable().optional(),
  endTime: z.string().regex(timeRegex, "Érvénytelen vég idő formátum (HH:MM).").nullable().optional().transform(e => e === "" ? null : e),
  
  // NEW Email fields
  send_email_notification: z.boolean().default(false),
  email_subject: z.string().nullable().optional().transform(e => e === "" ? null : e),
  email_body: z.string().nullable().optional().transform(e => e === "" ? null : e),
}).refine(data => {
    // Custom validation: If endTime is provided, endDate must also be provided
    if (data.endTime && !data.endDate) {
        return false;
    }
    return true;
}, {
    message: "Ha megadsz befejezési időt, a befejezési dátum is kötelező.",
    path: ["endDate"],
}).refine(data => {
    // Custom validation: End time must be after start time
    if (data.startDate && data.startTime && data.endDate && data.endTime) {
        const [startHours, startMinutes] = data.startTime.split(':').map(Number);
        const [endHours, endMinutes] = data.endTime.split(':').map(Number);
        
        const startDateTime = new Date(data.startDate);
        startDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const endDateTime = new Date(data.endDate);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        return endDateTime.getTime() > startDateTime.getTime();
    }
    return true;
}, {
    message: "A befejezési időnek későbbinek kell lennie, mint a kezdési idő.",
    path: ["endTime"],
}).refine(data => {
    // Conditional validation: If email notification is enabled, subject and body are required
    if (data.send_email_notification) {
        return data.email_subject && data.email_body;
    }
    return true;
}, {
    message: "Az email értesítéshez a tárgy és a törzs is kötelező.",
    path: ["email_subject"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: EventInsert) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
  initialData?: Event; // Optional data for editing
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onClose, isLoading, initialData }) => {
  const { coupons, isLoading: isCouponsLoading } = useCoupons();
  
  // Prepare default values for editing
  const defaultStartTime = initialData?.start_time ? new Date(initialData.start_time) : new Date();
  const defaultEndTime = initialData?.end_time ? new Date(initialData.end_time) : null;
  
  const defaultValues: EventFormData = {
    title: initialData?.title || '',
    description: initialData?.description || null,
    location: initialData?.location || null,
    image_url: initialData?.image_url || null,
    coupon_id: initialData?.coupon_id || null,
    startDate: initialData?.start_time ? defaultStartTime : undefined,
    startTime: format(defaultStartTime, 'HH:mm'),
    endDate: defaultEndTime,
    endTime: defaultEndTime ? format(defaultEndTime, 'HH:mm') : null,
    
    // NEW Email fields
    send_email_notification: initialData?.send_email_notification ?? false,
    email_subject: initialData?.email_subject || null,
    email_body: initialData?.email_body || null,
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, setError } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const sendEmailNotification = watch('send_email_notification');
  const isEditing = !!initialData;

  const handleFormSubmit = async (data: EventFormData) => {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    
    if (!data.startDate) {
      setError('startDate', { message: 'A kezdő dátum kötelező.' });
      return;
    }

    // Combine start date and time
    const startDateTime = new Date(data.startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    let endDateTime: Date | null = null;
    if (data.endDate && data.endTime) {
        const [endHours, endMinutes] = data.endTime.split(':').map(Number);
        endDateTime = new Date(data.endDate);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
    }

    if (isNaN(startDateTime.getTime()) || (endDateTime && isNaN(endDateTime.getTime()))) {
      showError('Érvénytelen dátum vagy időpont.');
      return;
    }
    
    // Ensure email fields are null if notification is disabled
    const finalEmailSubject = data.send_email_notification ? data.email_subject : null;
    const finalEmailBody = data.send_email_notification ? data.email_body : null;

    const eventInsert: EventInsert = {
      title: data.title,
      description: data.description,
      location: data.location,
      image_url: data.image_url,
      coupon_id: data.coupon_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime ? endDateTime.toISOString() : null, // NEW
      
      // NEW Email fields
      send_email_notification: data.send_email_notification,
      email_subject: finalEmailSubject,
      email_body: finalEmailBody,
    };

    const result = await onSubmit(eventInsert);
    if (result.success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Esemény címe *</Label>
        <Input 
          id="title"
          {...register('title')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">Leírás (opcionális)</Label>
        <Textarea 
          id="description"
          {...register('description')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location" className="text-gray-300">Helyszín (opcionális)</Label>
        <Input 
          id="location"
          {...register('location')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.location && <p className="text-red-400 text-sm">{errors.location.message}</p>}
      </div>

      <div className="space-y-4 border border-cyan-500/20 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-cyan-300">Kezdési időpont</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Start Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-300">Dátum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50",
                    !startDate && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Válassz dátumot</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-cyan-500/30 backdrop-blur-sm text-black">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setValue('startDate', date || undefined, { shouldValidate: true })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && <p className="text-red-400 text-sm">{errors.startDate.message}</p>}
          </div>

          {/* Start Time Input */}
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-gray-300">Idő (HH:MM) *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="startTime"
                type="text"
                placeholder="20:00"
                {...register('startTime')}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            {errors.startTime && <p className="text-red-400 text-sm">{errors.startTime.message}</p>}
          </div>
        </div>
      </div>
      
      <div className="space-y-4 border border-purple-500/20 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-purple-300">Befejezési időpont (opcionális)</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* End Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-gray-300">Dátum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50",
                    !endDate && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Válassz dátumot</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-purple-500/30 backdrop-blur-sm text-black">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={(date) => setValue('endDate', date || null, { shouldValidate: true })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && <p className="text-red-400 text-sm">{errors.endDate.message}</p>}
          </div>

          {/* End Time Input */}
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-gray-300">Idő (HH:MM)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="endTime"
                type="text"
                placeholder="23:00"
                {...register('endTime')}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            {errors.endTime && <p className="text-red-400 text-sm">{errors.endTime.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url" className="text-gray-300">Kép URL (opcionális)</Label>
        <Input 
          id="image_url"
          {...register('image_url')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.image_url && <p className="text-red-400 text-sm">{errors.image_url.message}</p>}
      </div>
      
      {/* Optional Coupon Link */}
      <div className="space-y-2">
        <Label htmlFor="coupon_id" className="text-gray-300">Opcionális Kupon Csatolása</Label>
        <Select 
          onValueChange={(value) => setValue('coupon_id', value === 'null' ? null : value)}
          value={watch('coupon_id') || 'null'}
          disabled={isCouponsLoading}
        >
          <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
            <SelectValue placeholder={isCouponsLoading ? "Kuponok betöltése..." : "Válassz kupont (opcionális)"} />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-cyan-500/30 text-white">
            <SelectItem value="null">Nincs kupon csatolva</SelectItem>
            {coupons.map(coupon => (
              <SelectItem key={coupon.id} value={coupon.id}>
                {coupon.title} ({coupon.coupon_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.coupon_id && <p className="text-red-400 text-sm">{errors.coupon_id.message}</p>}
      </div>
      
      {/* Email Notification Section for Events */}
      <div className="pt-4 border-t border-gray-700/50 space-y-4">
        <div className="flex items-center justify-between space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-pink-400" />
                <Label htmlFor="send_email_notification" className="text-gray-300 font-semibold">
                    Email értesítés küldése érdeklődéskor?
                </Label>
            </div>
            <Switch
                id="send_email_notification"
                checked={sendEmailNotification}
                onCheckedChange={(checked) => setValue('send_email_notification', checked, { shouldValidate: true })}
                className="data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-gray-600"
                {...register('send_email_notification')}
            />
        </div>
        
        {sendEmailNotification && (
            <div className="space-y-4 p-4 border border-pink-500/30 rounded-lg">
                <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-sm text-yellow-300 flex items-start">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
                    <p className="text-left">
                        Használható változók: <code>{{event_title}}</code> (az esemény címe) és <code>{{organization_name}}</code> (a szervezet neve).
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email_subject" className="text-gray-300">Email Tárgy *</Label>
                    <Input 
                      id="email_subject"
                      type="text" 
                      {...register('email_subject')}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                    />
                    {errors.email_subject && <p className="text-red-400 text-sm">{errors.email_subject.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email_body" className="text-gray-300">Email Törzs (HTML/Text) *</Label>
                    <Textarea 
                      id="email_body"
                      rows={6}
                      {...register('email_body')}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 font-mono"
                    />
                    {errors.email_body && <p className="text-red-400 text-sm">{errors.email_body.message}</p>}
                </div>
            </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
        disabled={isLoading || isCouponsLoading}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Mentés...' : (isEditing ? 'Esemény frissítése' : 'Esemény létrehozása')}
      </Button>
    </form>
  );
};

export default EventForm;