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
import LogoUploader from './LogoUploader'; // Import the new component
import { MemberRole } from '@/types/organization';

const ProfileSettingsPage: React.FC = () => {
  const { 
    user, 
    isLoading: isAuthLoading, 
    fetchProfile, 
    activeOrganizationProfile, 
    activeOrganizationId,
    checkPermission
  } = useAuth();
  
  // State for the currently active organization's settings
  const [organizationName, setOrganizationName] = useState(activeOrganizationProfile?.organization_name || '');
  const [logoUrl, setLogoUrl] = useState(activeOrganizationProfile?.logo_url || '');
  const [isPublic, setIsPublic] = useState(activeOrganizationProfile?.is_public ?? true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync state when active organization profile loads/changes
  React.useEffect(() => {
    if (activeOrganizationProfile) {
      setOrganizationName(activeOrganizationProfile.organization_name || '');
      setLogoUrl(activeOrganizationProfile.logo_url || '');
      setIsPublic(activeOrganizationProfile.is_public ?? true);
    }
  }, [activeOrganizationProfile]);
  
  // Check if the user is the owner of the active organization
  const isOwner = activeOrganizationProfile?.owner_id === user?.id;
  
  // Check if the user has permission to manage settings (owner or high-level admin)
  const canManageSettings = checkPermission('coupon_manager'); 

  // NEW: Function to immediately save the logo URL after successful upload/removal
  const saveLogoUrlImmediately = async (newUrl: string | null) => {
    if (!user || !activeOrganizationId || !canManageSettings) return;
    
    setIsSaving(true);
    try {
        const { error: orgError } = await supabase
            .from('organizations')
            .update({ logo_url: newUrl })
            .eq('id', activeOrganizationId);
            
        if (orgError) {
            showError(`Hiba a logó URL mentésekor: ${orgError.message}`);
            console.error('Logo URL update error:', orgError);
            return;
        }
        
        // Update local state and refetch profile to ensure consistency
        setLogoUrl(newUrl || '');
        await fetchProfile(user.id); 
        showSuccess('Logó sikeresen frissítve!');
        
    } catch (error) {
        showError('Váratlan hiba történt a logó mentése során.');
        console.error('Unexpected logo save error:', error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving || !activeOrganizationId || !canManageSettings) return;

    setIsSaving(true);
    
    const trimmedOrgName = organizationName.trim();
    
    const updates = {
      organization_name: trimmedOrgName || null, 
      // NOTE: logo_url is handled by saveLogoUrlImmediately, but we include it here 
      // in case the user changes the name and saves without touching the logo.
      logo_url: logoUrl || null, 
      is_public: isPublic,
    };

    try {
      // 1. Update the active organization's record in the new 'organizations' table
      const { error: orgError } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', activeOrganizationId);

      if (orgError) {
        if (orgError.code === '23505' && orgError.message.includes('organization_name')) {
            showError('Hiba: Ez a szervezet név már foglalt. Kérjük, válassz másikat.');
        } else {
            showError(`Hiba a szervezet profil frissítésekor: ${orgError.message}`);
            console.error('Organization profile update error:', orgError);
        }
        return;
      }
      
      showSuccess('Szervezet profil sikeresen frissítve!');
      // Re-fetch profile to update global state (this will refresh activeOrganizationProfile and allMemberships)
      await fetchProfile(user.id); 

    } catch (error) {
      showError('Váratlan hiba történt a mentés során.');
      console.error('Unexpected save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Profil adatok betöltése...</p>
      </div>
    );
  }
  
  if (!activeOrganizationProfile || !activeOrganizationId) {
      return <p className="text-gray-400">Kérjük, válassz egy aktív szervezetet a beállítások eléréséhez.</p>;
  }
  
  if (!canManageSettings) {
      return <p className="text-red-400">Nincs jogosultságod a szervezet beállításainak módosításához.</p>;
  }

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
          <User className="h-6 w-6" />
          Szervezet Beállítások ({activeOrganizationProfile.organization_name})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Organization Name */}
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
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">Ez a név jelenik meg a kuponoknál és az eseményeknél.</p>
          </div>

          {/* Logo Uploader Component */}
          <div className="space-y-2">
            <LogoUploader 
              currentLogoUrl={logoUrl}
              onUploadSuccess={saveLogoUrlImmediately} // Use immediate save handler
              onRemove={() => saveLogoUrlImmediately(null)} // Use immediate save handler for removal
            />
            <p className="text-xs text-gray-500">A logó feltöltése/eltávolítása azonnal mentésre kerül az adatbázisba.</p>
          </div>
          
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
                disabled={isSaving}
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