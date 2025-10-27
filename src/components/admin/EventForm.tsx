import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, Save, MapPin, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Event, EventInsert } from '@/types/events';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoupons } from '@/hooks/use-coupons';
import { showError } from '@/utils/toast';
import EventBannerUploader from './EventBannerUploader'; // NEW IMPORT

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const eventSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  location: z.string().nullable().optional().transform(e => e === "" ? null : e),
  image_url: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  coupon_id: z.string().nullable().optional().transform(e => e === "" ? null : e),
  
  // NEW FIELDS
  event_link: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  link_title: z.string().max(50, 'A link címe maximum 50 karakter lehet.').nullable().optional().transform(e => e === "" ? null : e),
  
  // Start Date and Time handling
  startDate: z.date({ required_error: "A kezdő dátum kötelező." }),
  startTime: z.string().regex(timeRegex, "Érvénytelen kezdő idő formátum (HH:MM)."),
  
  // End Date and Time handling (Optional)
  endDate: z.date().nullable().optional(),
  endTime: z.string().regex(timeRegex, "Érvénytelen vég idő formátum (HH:MM).").nullable().optional().transform(e => e === "" ? null : e),
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
    // Custom validation: If event_link is provided, link_title must also be provided
    if (data.event_link && !data.link_title) {
        return false;
    }
    return true;
}, {
    message: "Ha megadsz esemény linket, a link címe is kötelező.",
    path: ["link_title"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: EventInsert) => Promise<{ success: boolean, newEvent?: Event }>;
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
    event_link: initialData?.event_link || null, // NEW
    link_title: initialData?.link_title || null, // Use actual link_title
    startDate: initialData?.start_time ? defaultStartTime : undefined,
    startTime: format(defaultStartTime, 'HH:mm'),
    endDate: defaultEndTime,
    endTime: defaultEndTime ? format(defaultEndTime, 'HH:mm') : null,
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, setError } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const eventLink = watch('event_link');
  const imageUrl = watch('image_url'); // Watch image_url state
  const isEditing = !!initialData;
  const eventId = initialData?.id; // Get ID for uploader if editing

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

    const eventInsert: EventInsert = {
      title: data.title,
      description: data.description,
      location: data.location,
      image_url: imageUrl, // Use the state managed by the uploader
      coupon_id: data.coupon_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime ? endDateTime.toISOString() : null,
      event_link: data.event_link, // NEW
      link_title: data.link_title, // NEW
    };

    const result = await onSubmit(eventInsert);
    if (result.success) {
      onClose();
    }
  };
  
  const handleImageUploadSuccess = (url: string) => {
      setValue('image_url', url, { shouldValidate: true });
  };
  
  const handleImageRemove = () => {
      setValue('image_url', null, { shouldValidate: true });
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
      
      {/* Event Banner Uploader - Always visible, but only functional if eventId exists */}
      {eventId ? (
        <EventBannerUploader
            eventId={eventId}
            currentImageUrl={imageUrl}
            onUploadSuccess={handleImageUploadSuccess}
            onRemove={handleImageRemove}
        />
      ) : (
        <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-sm text-yellow-300 flex items-center">
            <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
            Kérjük, először mentsd el az esemény alapadatait. A képfeltöltés a következő lépésben (a szerkesztőben) lesz elérhető.
        </div>
      )}
      {errors.image_url && <p className="text-red-400 text-sm">{errors.image_url.message}</p>}
      
      {/* Event Link and Link Title */}
      <div className="space-y-4 border border-cyan-500/20 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Esemény Link (opcionális)
        </h4>
        <div className="space-y-2">
            <Label htmlFor="event_link" className="text-gray-300">Link URL</Label>
            <Input 
              id="event_link"
              type="url"
              {...register('event_link')}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              placeholder="https://esemeny.hu/jegyek"
            />
            {errors.event_link && <p className="text-red-400 text-sm">{errors.event_link.message}</p>}
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="link_title" className="text-gray-300">Link címe {eventLink ? '*' : '(opcionális)'}</Label>
            <Input 
              id="link_title"
              {...register('link_title')}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              placeholder="Jegyvásárlás"
            />
            {errors.link_title && <p className="text-red-400 text-sm">{errors.link_title.message}</p>}
        </div>
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