import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Save } from 'lucide-react';
import { CouponInsert } from '@/types/coupons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const couponSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable(),
  coupon_code: z.string().min(4, 'A kuponkód túl rövid.'),
  image_url: z.string().url('Érvénytelen URL formátum.').nullable().optional().transform(e => e === "" ? null : e),
  expiry_date: z.date().nullable().optional().transform(date => date ? date.toISOString() : null),
  max_uses_per_user: z.coerce.number().int().min(1, 'Minimum 1 használat.'),
  total_max_uses: z.coerce.number().int().min(1, 'Minimum 1 használat.').nullable().optional().transform(e => e === 0 ? null : e),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  onSubmit: (data: CouponInsert) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({ onSubmit, onClose, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: '',
      description: null,
      coupon_code: '',
      image_url: null,
      expiry_date: null,
      max_uses_per_user: 1,
      total_max_uses: null,
    },
  });

  const expiryDate = watch('expiry_date');

  const handleFormSubmit = async (data: CouponFormData) => {
    const result = await onSubmit(data as CouponInsert);
    if (result.success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
        />
        {errors.coupon_code && <p className="text-red-400 text-sm">{errors.coupon_code.message}</p>}
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
        <Label htmlFor="image_url" className="text-gray-300">Kép URL (opcionális)</Label>
        <Input 
          id="image_url"
          {...register('image_url')}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        />
        {errors.image_url && <p className="text-red-400 text-sm">{errors.image_url.message}</p>}
      </div>

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
        {isLoading ? 'Mentés...' : 'Kupon létrehozása'}
      </Button>
    </form>
  );
};

export default CouponForm;