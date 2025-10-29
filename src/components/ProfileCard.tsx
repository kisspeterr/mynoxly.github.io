import React from 'react';
import { User, Mail, Shield, AtSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'superadmin';
  username: string;
}

interface ProfileCardProps {
  profile: Profile;
  email?: string | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, email }) => {
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const displayName = fullName || 'Felhasználó';
  
  let roleColor = 'text-cyan-400';
  if (profile.role === 'admin') roleColor = 'text-purple-400';
  if (profile.role === 'superadmin') roleColor = 'text-red-400';

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white">
      <CardHeader className="flex flex-col items-center text-center">
        {/* Centered, larger avatar */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-1 mb-4 shadow-xl">
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="h-14 w-14 text-gray-400" />
            )}
          </div>
        </div>
        <CardTitle className="text-3xl text-white">{displayName}</CardTitle>
        <p className={`text-sm font-semibold ${roleColor} flex items-center mt-1`}>
            <Shield className="h-4 w-4 mr-1" />
            {profile.role === 'superadmin' ? 'Superadmin' : (profile.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-left border-t border-gray-700/50 pt-4">
        <div className="flex items-center text-gray-300">
          <AtSign className="h-5 w-5 mr-3 text-purple-400" />
          <span className="font-medium">Felhasználónév:</span> <span className="ml-1 break-all text-white">@{profile.username}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <Mail className="h-5 w-5 mr-3 text-purple-400" />
          <span className="font-medium">Email:</span> <span className="ml-1 break-all">{email || 'Nincs megadva'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;