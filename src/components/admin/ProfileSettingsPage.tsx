import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, User, MapPin, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Switch } from '@/components/ui/switch';
import LogoUploader from './LogoUploader';
import LocationPicker from './LocationPicker'; // Import LocationPicker

const ProfileSettingsPage: React.FC = () => {
  const { profile, user, isLoading: isAuthLoading, fetchProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [organizationName, setOrganizationName] = useState(profile?.organization_name || '');
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '');
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  
  // NEW: Location states
  const [latitude, setLatitude] = useState<number | null>(profile?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(profile?.longitude || null);
  
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when profile loads/changes
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setOrganizationName(profile.organization_name || '');
      setLogoUrl(profile.logo_url || '');
      setIsPublic(profile.is_public ?? true);
      setLatitude(profile.latitude || null);
      setLongitude(profile.longitude || null);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    
    const updates = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      organization_name: organizationName.trim() || null,
      logo_url: logoUrl || null,
      is_public: isPublic,
      latitude: latitude, // NEW
      longitude: longitude, // NEW
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        showError(`Hiba a profil frissítésekor: ${error.message}`);
        console.error('Profile update error:', error);
        return;
      }

      // Also update auth metadata for first/last name consistency (optional but good practice)
      await supabase.auth.updateUser({
        data: {
          first_name: updates.first_name,
          last_name: updates.last_name,
        }
      });

      showSuccess('Profil sikeresen frissítve!');
      // Re-fetch profile to update global state using the new refetch function
      await fetchProfile(user.id); 

    } catch (error) {
      showError('Váratlan hiba történt a mentés során.');
      console.error('Unexpected save error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLocationChange = (lat: number | null, lng: number | null) => {
      setLatitude(lat);
      setLongitude(lng);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Profil adatok betöltése...</p>
      </div>
    );
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
          <User className="h-6 w-6" />
          Admin Profil Beállítások
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">Keresztnév</Label>
              <Input 
                id="firstName"
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">Vezetéknév</Label>
              <Input 
                id="lastName"
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName" className="text-gray-300 flex items-center">
              <MapPin className="h-4 w-4 mr-2" /> Szervezet neve *
            </Label>
            <Input 
              id="organizationName"
              type="text" 
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-500">Ez a név jelenik meg a kuponoknál és az eseményeknél.</p>
          </div>

          {/* Logo Uploader Component */}
          <div className="space-y-2">
            <LogoUploader 
              currentLogoUrl={logoUrl}
              onUploadSuccess={setLogoUrl}
              onRemove={() => setLogoUrl(null)}
            />
            <p className="text-xs text-gray-500">A feltöltés után ne felejtsd el menteni a beállításokat!</p>
          </div>
          
          {/* Location Picker */}
          <LocationPicker 
            initialLat={latitude}
            initialLng={longitude}
            onLocationChange={handleLocationChange}
          />
          
          {/* Public Visibility Switch */}
          <div className="flex items-center justify-between space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2">
                {isPublic ? (
                    <Eye className="h-5 w-5 text-green-400" />
                ) : (
                    <EyeOff className="h-5 w-5 text-red-400" />
                )}
                <Label htmlFor="is_public" className="text-gray-300 font-semibold">
                    Megjelenés a főoldalon (Partnerek)
                </Label>
            </div>
            <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            disabled={isSaving || !organizationName.trim()}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Beállítások mentése
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsPage;