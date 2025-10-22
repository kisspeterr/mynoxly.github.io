import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Save, Gift, Coins } from 'lucide-react';
import { Coupon, CouponInsert } from '@/types/coupons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUploaderWithCrop from '@/components/ImageUploaderWithCrop'; // Import new component

// Define the schema for form validation
const couponSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  coupon_code: z.string().min(4, 'A kuponkód túl rövid.'),
  // image_url is now handled by the uploader, but we keep it as a string (URL) in the schema
  image_url: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  expiry_date: z.date().nullable().optional().transform(date => date ? date.toISOString() : null),
  max_uses_per_user: z.coerce.number().int().min(1, 'Minimum 1 használat.'),
  total_max_uses: z.coerce.number().int().min(0, 'Minimum 0.').nullable().optional().transform(e => e === 0 ? null : e),
  
  // Loyalty fields
  points_reward: z.coerce.number().int().min(0, 'Minimum 0 pont.').default(0),
  points_cost: z.coerce.number().int().min(0, 'Minimum 0 pont.').default(0),
}).refine(data => {
    // Custom validation: Cannot be both a reward and a cost coupon
    if (data.points_cost > 0 && data.points_reward > 0) {
        return false; 
    }
    return true;
}, {
    message: "A kupon nem lehet egyszerre pont jutalom és pont költség alapú.",
    path: ["points_cost"],
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  onSubmit: (data: CouponInsert) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
  initialData?: Coupon; // Optional data for editing
}

const CouponForm: React.FC<CouponFormProps> = ({ onSubmit, onClose, isLoading, initialData }) => {
  
  // Prepare default values for editing
  const defaultValues: CouponFormData = {
    title: initialData?.title || '',
    description: initialData?.description || null,
    coupon_code: initialData?.coupon_code || '',
    image_url: initialData?.image_url || null,
    max_uses_per_user: initialData?.max_uses_per_user || 1,
    total_max_uses: initialData?.total_max_uses || null,
    expiry_date: initialData?.expiry_date ? new Date(initialData.expiry_date) : null,
    points_reward: initialData?.points_reward || 0,
    points_cost: initialData?.points_cost || 0,
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues,
  });

  const expiryDate = watch('expiry_date');
  const imageUrl = watch('image_url');
  const isEditing = !!initialData;

  const handleFormSubmit = async (data: CouponFormData) => {
    const result = await onSubmit(data as CouponInsert);
    if (result.success) {
      onClose();
    }
  };
  
  // Aspect ratio for coupon card image (40 units high, full width, roughly 16:9)
  const COUPON_ASPECT_RATIO = 16 / 9; 

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Image Uploader with Cropping */}
      <ImageUploaderWithCrop
        onUploadSuccess={(url) => setValue('image_url', url, { shouldValidate: true })}
        initialUrl={imageUrl}
        aspectRatio={COUPON_ASPECT_RATIO}
      />
      {errors.image_url && <p className="text-red-400 text-sm">{errors.image_url.message}</p>}
      
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Cím *</Label>
        <Input 
          id="title"
          {...register('title')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coupon_code" className="text-gray-300">Kuponkód *</Label>
        <Input 
          id="coupon_code"
          {...register('coupon_code')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          disabled={isEditing}
        />
        {errors.coupon_code && <p className="text-red-400 text-sm">{errors.coupon_code.message}</p>}
        {isEditing && <p className="text-gray-500 text-xs">A kuponkód szerkesztése nem engedélyezett.</p>}
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

      {/* Loyalty Points Configuration */}
      <div className="pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
          <Coins className="h-5 w-5 mr-2" /> Hűségpont Beállítások
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="points_reward" className="text-gray-300">Pont Jutalom (Beváltáskor)</Label>
            <Input 
              id="points_reward"
              type="number"
              {...register('points_reward', { valueAsNumber: true })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            {errors.points_reward && <p className="text-red-400 text-sm">{errors.points_reward.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="points_cost" className="text-gray-300">Pont Költség (Beváltáshoz)</Label>
            <Input 
              id="points_cost"
              type="number"
              {...register('points_cost', { valueAsNumber: true })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            {errors.points_cost && <p className="text-red-400 text-sm">{errors.points_cost.message}</p>}
          </div>
        </div>
        {errors.points_cost && errors.points_cost.message === "A kupon nem lehet egyszerre pont jutalom és pont költség alapú." && (
            <p className="text-red-400 text-sm mt-2">A kupon nem lehet egyszerre pont jutalom és pont költség alapú.</p>
        )}
      </div>
      
      {/* Usage Limits */}
      <div className="pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
          <Gift className="h-5 w-5 mr-2" /> Használati Korlátok
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_uses_per_user" className="text-gray-300">Max. felhasználás/felhasználó *</Label>
            <Input 
              id="max_uses_per_user"
              type="number"
              {...register('max_uses_per_user', { valueAsNumber: true })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            {errors.max_uses_per_user && <p className="text-red-400 text-sm">{errors.max_uses_per_user.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_max_uses" className="text-gray-300">Összes max. felhasználás (opcionális)</Label>
            <Input 
              id="total_max_uses"
              type="number"
              {...register('total_max_uses', { valueAsNumber: true })}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            {errors.total_max_uses && <p className="text-red-400 text-sm">{errors.total_max_uses.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiry_date" className="text-gray-300">Lejárati dátum (opcionális)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50",
                !expiryDate && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiryDate ? format(expiryDate, "PPP") : <span>Válassz dátumot</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-black/80 border-cyan-500/30 backdrop-blur-sm">
            <Calendar
              mode="single"
              selected={expiryDate || undefined}
              onSelect={(date) => setValue('expiry_date', date || null, { shouldValidate: true })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.expiry_date && <p className="text-red-400 text-sm">Érvénytelen dátum</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
        disabled={isLoading}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Mentés...' : (isEditing ? 'Kupon frissítése' : 'Kupon létrehozása')}
      </Button>
    </form>
  );
};

export default CouponForm;