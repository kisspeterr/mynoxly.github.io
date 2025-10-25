import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { differenceInDays, addDays } from 'date-fns';
import { format } from 'date-fns/format';

const USERNAME_CHANGE_LIMIT_DAYS = 7;
const MAX_CHANGES_BEFORE_COOLDOWN = 3;

const UserSettingsForm: React.FC = () => {
  const { profile, user, isLoading: isAuthLoading, fetchProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync state when profile loads/changes
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  if (isAuthLoading || !profile || !user) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <p className="ml-3 text-gray-300">Beállítások betöltése...</p>
      </div>
    );
  }
  
  const currentChangeCount = profile.username_change_count || 0;
  const lastChangeDate = profile.last_username_change ? new Date(profile.last_username_change) : null;
  const daysSinceLastChange = lastChangeDate ? differenceInDays(new Date(), lastChangeDate) : USERNAME_CHANGE_LIMIT_DAYS;
  
  // Check if the cooldown period is active
  const isCooldownActive = currentChangeCount >= MAX_CHANGES_BEFORE_COOLDOWN;
  const isCooldownOver = daysSinceLastChange >= USERNAME_CHANGE_LIMIT_DAYS;
  
  // Can change username if:
  // 1. Cooldown is NOT active OR
  // 2. Cooldown IS active AND the cooldown period is over.
  const canChangeUsername = !isCooldownActive || isCooldownOver;
  
  let nextChangeText = 'azonnal';
  if (isCooldownActive && !isCooldownOver) {
      const nextChangeDate = lastChangeDate ? addDays(lastChangeDate, USERNAME_CHANGE_LIMIT_DAYS) : null;
      nextChangeText = nextChangeDate ? format(nextChangeDate, 'yyyy. MM. dd.') : 'ismeretlen időpontban';
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    
    const trimmedUsername = username.trim();
    const isUsernameChanged = trimmedUsername !== profile.username;
    
    if (isUsernameChanged && !canChangeUsername) {
        showError(`A felhasználónevet csak 7 naponta lehet módosítani, miután elérted a ${MAX_CHANGES_BEFORE_COOLDOWN} változtatási limitet. Legközelebb: ${nextChangeText}.`);
        setIsSaving(false);
        return;
    }
    
    // Basic client-side validation for username format
    if (isUsernameChanged && !/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        showError('A felhasználónév csak betűket, számokat és aláhúzást (_) tartalmazhat.');
        setIsSaving(false);
        return;
    }
    
    if (isUsernameChanged && (trimmedUsername.length < 3 || trimmedUsername.length > 30)) {
        showError('A felhasználónévnek 3 és 30 karakter között kell lennie.');
        setIsSaving(false);
        return;
    }

    const updates: Record<string, any> = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      updated_at: new Date().toISOString(),
    };
    
    if (isUsernameChanged) {
        // If cooldown is over, reset count to 1 and update timestamp
        if (isCooldownOver) {
            updates.username_change_count = 1;
            updates.last_username_change = new Date().toISOString();
        } else {
            // If cooldown is NOT active (count < 3), increment count and update timestamp
            updates.username_change_count = currentChangeCount + 1;
            updates.last_username_change = new Date().toISOString();
        }
        updates.username = trimmedUsername;
    }

    try {
      // 1. Update profile in DB
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505' && error.message.includes('unique_username')) {
            showError('Hiba: Ez a felhasználónév már foglalt. Kérjük, válassz másikat.');
        } else {
            showError(`Hiba a profil frissítésekor: ${error.message}`);
            console.error('Profile update error:', error);
        }
        return;
      }

      // 2. Update auth metadata (for first/last name consistency)
      await supabase.auth.updateUser({
        data: {
          first_name: updates.first_name,
          last_name: updates.last_name,
        }
      });

      showSuccess('Profil sikeresen frissítve!');
      await fetchProfile(user.id); 

    } catch (error) {
      showError('Váratlan hiba történt a mentés során.');
      console.error('Unexpected save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-300 flex items-center gap-2">
          <User className="h-6 w-6" />
          Személyes Beállítások
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
          
          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">Felhasználónév *</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <Input 
                  id="username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-6 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  disabled={!canChangeUsername || isSaving}
                />
            </div>
            
            {/* Status Messages */}
            {isCooldownActive && !isCooldownOver && (
                <p className="text-sm text-red-400 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Elérted a heti {MAX_CHANGES_BEFORE_COOLDOWN} változtatási limitet. Legközelebb: {nextChangeText}.
                </p>
            )}
            {!isCooldownActive && (
                <p className="text-sm text-green-400">
                    Még {MAX_CHANGES_BEFORE_COOLDOWN - currentChangeCount} változtatás engedélyezett a 7 napos korlát előtt.
                </p>
            )}
            {isCooldownActive && isCooldownOver && (
                <p className="text-sm text-green-400">
                    A korlát lejárt. A következő változtatás után a számláló újraindul.
                </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Mentés
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserSettingsForm;