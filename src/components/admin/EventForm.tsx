import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, Save, MapPin, Link as LinkIcon } from 'lucide-react';
import { Event, EventInsert } from '@/types/events';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoupons } from '@/hooks/use-coupons';
import { showError } from '@/utils/toast';
import LocationPickerMap from './LocationPickerMap'; // Import the new map component

const eventSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  location: z.string().nullable().optional().transform(e => e === "" ? null : e),
  image_url: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  coupon_id: z.string().nullable().optional().transform(e => e === "" ? null : e),
  event_link: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  
  // Map coordinates
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  
  // Date and Time handling
  startDate: z.date({ required_error: "A kezdő dátum kötelező." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Érvénytelen idő formátum (HH:MM)."),
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
  
  const defaultValues: EventFormData = {
    title: initialData?.title || '',
    description: initialData?.description || null,
    location: initialData?.location || null,
    image_url: initialData?.image_url || null,
    coupon_id: initialData?.coupon_id || null,
    event_link: initialData?.event_link || null,
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    startDate: initialData?.start_time ? defaultStartTime : undefined,
    time: format(defaultStartTime, 'HH:mm'),
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, setError } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const startDate = watch('startDate');
  const isEditing = !!initialData;
  const currentLat = watch('latitude');
  const currentLng = watch('longitude');

  const handleLocationChange = (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: EventFormData) => {
    const [hours, minutes] = data.time.split(':').map(Number);
    
    if (!data.startDate) {
      setError('startDate', { message: 'A kezdő dátum kötelező.' });
      return;
    }

    // Combine date and time
    const startDateTime = new Date(data.startDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    if (isNaN(startDateTime.getTime())) {
      showError('Érvénytelen dátum vagy időpont.');
      return;
    }

    const eventInsert: EventInsert = {
      title: data.title,
      description: data.description,
      location: data.location,
      image_url: data.image_url,
      coupon_id: data.coupon_id,
      event_link: data.event_link, // New field
      latitude: data.latitude,     // New field
      longitude: data.longitude,   // New field
      start_time: startDateTime.toISOString(),
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
        <Label htmlFor="location" className="text-gray-300">Helyszín megnevezése (Pl: Pécsi Sörház) (opcionális)</Label>
        <Input 
          id="location"
          {...register('location')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.location && <p className="text-red-400 text-sm">{errors.location.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event_link" className="text-gray-300 flex items-center">
          <LinkIcon className="h-4 w-4 mr-1" /> Esemény linkje (Jegyvásárlás/Facebook URL) (opcionális)
        </Label>
        <Input 
          id="event_link"
          {...register('event_link')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          placeholder="https://jegyvasarlas.hu/esemeny"
        />
        {errors.event_link && <p className="text-red-400 text-sm">{errors.event_link.message}</p>}
      </div>

      {/* Map Picker Section */}
      <div className="space-y-2">
        <Label className="text-gray-300 flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> Helyszín kiválasztása térképen (opcionális)
        </Label>
        <LocationPickerMap 
          initialLat={currentLat}
          initialLng={currentLng}
          onLocationChange={handleLocationChange}
        />
        <div className="text-xs text-gray-500 mt-1">
          Kattints a térképre a pontos koordináták beállításához. 
          Koordináták: {currentLat?.toFixed(4) || 'N/A'}, {currentLng?.toFixed(4) || 'N/A'}
        </div>
        {/* Hidden inputs for validation/submission */}
        <input type="hidden" {...register('latitude')} />
        <input type="hidden" {...register('longitude')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
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
            <PopoverContent className="w-auto p-0 bg-black/80 border-cyan-500/30 backdrop-blur-sm">
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

        {/* Time Input */}
        <div className="space-y-2">
          <Label htmlFor="time" className="text-gray-300">Idő (HH:MM) *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              id="time"
              type="text"
              placeholder="20:00"
              {...register('time')}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
          {errors.time && <p className="text-red-400 text-sm">{errors.time.message}</p>}
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