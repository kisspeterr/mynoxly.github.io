import React from 'react';
import { useOrganizationMembers } from '@/hooks/use-organization-members';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, Building, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberRole } from '@/types/organization';

const ROLE_MAP: Record<MemberRole, string> = {
    coupon_manager: 'Kupon kezelő',
    event_manager: 'Esemény kezelő',
    redemption_agent: 'Beváltó ügynök',
    viewer: 'Statisztika néző',
};

const UserInvitationsList: React.FC = () => {
  const { invitations, isLoading, acceptInvitation, rejectInvitation } = useOrganizationMembers();

  if (isLoading && invitations.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        <p className="ml-3 text-gray-300">Meghívások betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
        <Mail className="h-6 w-6" />
        Szervezeti Meghívások ({invitations.length})
      </h2>

      {invitations.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Nincsenek függőben lévő szervezeti meghívásaid.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map(invitation => (
            <Card 
              key={invitation.id} 
              className="bg-black/50 border-yellow-500/30 backdrop-blur-sm text-white flex flex-col"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                    {invitation.organization?.logo_url ? (
                        <img 
                            src={invitation.organization.logo_url} 
                            alt={invitation.organization.organization_name} 
                            className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-yellow-400">
                            <Building className="h-5 w-5 text-yellow-400" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-lg text-cyan-300">{invitation.organization?.organization_name || 'Ismeretlen Szervezet'}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">Meghívás érkezett</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-left text-sm">
                <div className="pt-2 border-t border-gray-700/50 space-y-2">
                    <h4 className="font-semibold text-gray-300 flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Jogosultságok:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {invitation.roles.map(role => (
                            <Badge key={role} className="bg-purple-600/50 text-purple-300">{ROLE_MAP[role]}</Badge>
                        ))}
                    </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                    <Button 
                        onClick={() => acceptInvitation(invitation.id)}
                        className="flex-grow bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Elfogadás
                    </Button>
                    <Button 
                        onClick={() => rejectInvitation(invitation.id)}
                        variant="destructive"
                        className="flex-grow"
                        disabled={isLoading}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Elutasítás
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInvitationsList;