import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Gift, Coins, ListChecks, Building, CheckCircle, ArrowRight } from 'lucide-react';
import { Challenge, ChallengeInsert, ConditionType } from '@/types/challenges';
import { OrganizationProfileData } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select'; // Assuming MultiSelect exists or creating a simple version

// Define the schema for form validation
const challengeSchema = z.object({
  title: z.string().min(3, 'A cím túl rövid.'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  is_active: z.boolean().default(true),
  
  // Reward
  reward_points: z.coerce.number().int().min(1, 'A jutalom pont minimum 1.'),
  reward_organization_id: z.string().uuid('Érvénytelen szervezet ID.').nullable().optional().transform(e => e === 'null' ? null : e),
  
  // Condition
  condition_type: z.custom<ConditionType>(),
  condition_value: z.coerce.number().int().min(1, 'A feltétel értékének minimum 1-nek kell lennie.'),
  condition_organizations: z.array(z.string().uuid('Érvénytelen szervezet ID.')).default([]),
}).refine(data => {
    // Custom validation: If reward_points > 0, reward_organization_id must be set
    if (data.reward_points > 0 && !data.reward_organization_id) {
        return false;
    }
    return true;
}, {
    message: "Ha pont jutalmat adsz, kötelező megadni a jutalmat adó szervezetet.",
    path: ["reward_organization_id"],
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface ChallengeFormProps {
  onSubmit: (data: ChallengeInsert) => Promise<{ success: boolean }>;
  onClose: () => void;
  isLoading: boolean;
  initialData?: Challenge;
  organizations: OrganizationProfileData[];
}

const CONDITION_OPTIONS: { value: ConditionType, label: string, description: string }[] = [
    { value: 'REDEEM_COUNT', label: 'Kupon beváltás (db)', description: 'Beváltott kuponok száma (bármelyik vagy adott szervezetnél).' },
    { value: 'DIFFERENT_ORGANIZATIONS', label: 'Különböző szervezetek', description: 'Beváltott kuponok száma különböző szervezeteknél.' },
    { value: 'TOTAL_POINTS', label: 'Összegyűjtött pont', description: 'Összegyűjtött hűségpontok száma adott szervezetnél.' },
];

// Simple MultiSelect implementation (since we don't have the shadcn/ui version)
const SimpleMultiSelect: React.FC<{ 
    options: { value: string, label: string }[], 
    value: string[], 
    onChange: (values: string[]) => void,
    placeholder: string
}> = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean);

    return (
        <div className="relative">
            <Button
                variant="outline"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-start bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50"
            >
                {selectedLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {selectedLabels.map(label => (
                            <Badge key={label} className="bg-purple-600/50 text-purple-300">{label}</Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-500">{placeholder}</span>
                )}
            </Button>
            {isOpen && (
                <Card className="absolute z-10 w-full mt-1 bg-black/90 border-purple-500/30 max-h-48 overflow-y-auto">
                    <CardContent className="p-2 space-y-1">
                        {options.map(option => (
                            <div 
                                key={option.value} 
                                className="flex items-center space-x-2 p-2 hover:bg-gray-800/50 rounded-md cursor-pointer"
                                onClick={() => {
                                    const newValues = value.includes(option.value)
                                        ? value.filter(v => v !== option.value)
                                        : [...value, option.value];
                                    onChange(newValues);
                                }}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={value.includes(option.value)} 
                                    readOnly
                                    className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                />
                                <Label className="text-white">{option.label}</Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};


const ChallengeForm: React.FC<ChallengeFormProps> = ({ onSubmit, onClose, isLoading, initialData, organizations }) => {
  
  const defaultValues: ChallengeFormData = {
    title: initialData?.title || '',
    description: initialData?.description || null,
    is_active: initialData?.is_active ?? true,
    reward_points: initialData?.reward_points || 0,
    reward_organization_id: initialData?.reward_organization_id || 'null',
    condition_type: initialData?.condition_type || 'REDEEM_COUNT',
    condition_value: initialData?.condition_value || 1,
    condition_organizations: initialData?.condition_organizations || [],
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues,
  });

  const conditionType = watch('condition_type');
  const rewardPoints = watch('reward_points');
  const conditionOrganizations = watch('condition_organizations');
  const isEditing = !!initialData;
  
  const organizationOptions = organizations.map(org => ({
      value: org.id,
      label: org.organization_name,
  }));

  const handleFormSubmit = async (data: ChallengeFormData) => {
    const insertData: ChallengeInsert = {
        ...data,
        reward_organization_id: data.reward_organization_id === 'null' ? null : data.reward_organization_id,
        // Ensure condition_organizations is null if empty array, or if condition type doesn't need it
        condition_organizations: data.condition_organizations.length > 0 ? data.condition_organizations : [],
    };
    
    await onSubmit(insertData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* General Info */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-300">Küldetés címe *</Label>
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
      
      {/* Status Switch */}
      <div className="flex items-center justify-between space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <Label htmlFor="is_active" className="text-gray-300 font-semibold">
                Aktív / Publikálva
            </Label>
        </div>
        <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
        />
      </div>

      {/* Reward Configuration */}
      <div className="pt-4 border-t border-gray-700/50 space-y-4">
        <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
            <Coins className="h-5 w-5" /> Jutalom Beállítások
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="reward_points" className="text-gray-300">Jutalom Pont (db) *</Label>
                <Input 
                  id="reward_points"
                  type="number"
                  {...register('reward_points', { valueAsNumber: true })}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
                {errors.reward_points && <p className="text-red-400 text-sm">{errors.reward_points.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="reward_organization_id" className="text-gray-300">Jutalmat adó szervezet {rewardPoints > 0 ? '*' : '(opcionális)'}</Label>
                <Select 
                  onValueChange={(value) => setValue('reward_organization_id', value, { shouldValidate: true })}
                  value={watch('reward_organization_id') || 'null'}
                >
                  <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                    <SelectValue placeholder="Válassz szervezetet" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-cyan-500/30 text-white">
                    <SelectItem value="null">Nincs jutalom (vagy globális)</SelectItem>
                    {organizationOptions.map(org => (
                      <SelectItem key={org.value} value={org.value}>
                        {org.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reward_organization_id && <p className="text-red-400 text-sm">{errors.reward_organization_id.message}</p>}
            </div>
        </div>
      </div>
      
      {/* Condition Configuration */}
      <div className="pt-4 border-t border-gray-700/50 space-y-4">
        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> Feltétel Beállítások
        </h3>
        
        <div className="space-y-2">
            <Label htmlFor="condition_type" className="text-gray-300">Feltétel típusa *</Label>
            <Select 
              onValueChange={(value) => setValue('condition_type', value as ConditionType, { shouldValidate: true })}
              value={conditionType}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50">
                <SelectValue placeholder="Válassz feltételt" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-purple-500/30 text-white">
                {CONDITION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condition_type && <p className="text-red-400 text-sm">{errors.condition_type.message}</p>}
            <p className="text-xs text-gray-500">{CONDITION_OPTIONS.find(o => o.value === conditionType)?.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="condition_value" className="text-gray-300">Szükséges érték (db/pont) *</Label>
                <Input 
                  id="condition_value"
                  type="number"
                  {...register('condition_value', { valueAsNumber: true })}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                />
                {errors.condition_value && <p className="text-red-400 text-sm">{errors.condition_value.message}</p>}
            </div>
        </div>
        
        {/* Conditional Organization Selector */}
        {(conditionType === 'REDEEM_COUNT' || conditionType === 'TOTAL_POINTS') && (
            <div className="space-y-2">
                <Label htmlFor="condition_organizations" className="text-gray-300">
                    Feltételhez kötött szervezetek (opcionális)
                </Label>
                <SimpleMultiSelect
                    options={organizationOptions}
                    value={conditionOrganizations}
                    onChange={(values) => setValue('condition_organizations', values, { shouldValidate: true })}
                    placeholder="Válassz szervezeteket (üresen hagyva: összes szervezet)"
                />
                <p className="text-xs text-gray-500">
                    Csak az itt kiválasztott szervezeteknél végrehajtott műveletek számítanak bele a feltételbe.
                </p>
            </div>
        )}
        
        {conditionType === 'DIFFERENT_ORGANIZATIONS' && (
            <p className="text-xs text-gray-500">
                Ez a feltétel automatikusan az összes szervezetre vonatkozik, ahol kupon beváltás történt.
            </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        disabled={isLoading}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading ? 'Mentés...' : (isEditing ? 'Küldetés frissítése' : 'Küldetés létrehozása')}
      </Button>
    </form>
  );
};

export default ChallengeForm;