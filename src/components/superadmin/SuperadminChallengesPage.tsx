import React, { useState } from 'react';
import { useSuperadminChallenges } from '@/hooks/use-superadmin-challenges';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2, Pencil, CheckCircle, XCircle, RefreshCw, ListChecks, Building, Coins, ArrowLeftRight, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import ChallengeForm from './ChallengeForm';
import { Challenge, ChallengeInsert, ConditionType } from '@/types/challenges';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CONDITION_LABELS: Record<ConditionType, string> = {
    REDEEM_COUNT: 'Kupon beváltás',
    TOTAL_POINTS: 'Összegyűjtött pont',
    DIFFERENT_ORGANIZATIONS: 'Különböző szervezetek',
};

interface ChallengeEditDialogProps {
  challenge: Challenge;
  onUpdate: (id: string, data: Partial<ChallengeInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
  organizations: any[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChallengeEditDialog: React.FC<ChallengeEditDialogProps> = ({ challenge, onUpdate, isLoading, organizations, isOpen, onOpenChange }) => {
  const handleSubmit = async (data: ChallengeInsert) => {
    const updateData: Partial<ChallengeInsert> = {
      title: data.title,
      description: data.description,
      is_active: data.is_active,
      reward_points: data.reward_points,
      reward_organization_id: data.reward_organization_id,
      condition_type: data.condition_type,
      condition_value: data.condition_value,
      condition_organizations: data.condition_organizations,
    };
    
    const result = await onUpdate(challenge.id, updateData);
    if (result.success) {
      onOpenChange(false);
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {!isOpen && (
            <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
              <Pencil className="h-4 w-4" />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Küldetés szerkesztése</DialogTitle>
          <DialogDescription className="text-gray-400">
            Frissítsd a "{challenge.title}" küldetés adatait.
          </DialogDescription>
        </DialogHeader>
        <ChallengeForm 
          onSubmit={handleSubmit} 
          onClose={() => onOpenChange(false)} 
          isLoading={isLoading}
          initialData={challenge}
          organizations={organizations}
        />
      </DialogContent>
    </Dialog>
  );
};


interface ChallengeCardProps {
  challenge: Challenge;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
  onDelete: (id: string) => Promise<{ success: boolean }>;
  onUpdate: (id: string, data: Partial<ChallengeInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
  organizations: any[];
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onToggleActive, onDelete, onUpdate, isLoading, organizations }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isOrganizationSpecific = challenge.condition_organizations.length > 0;
  
  const getOrgName = (id: string) => organizations.find(o => o.id === id)?.organization_name || 'Ismeretlen szervezet';

  return (
    <Card className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 ${challenge.is_active ? 'border-green-500/30' : 'border-yellow-500/30 opacity-70'}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-purple-300">{challenge.title}</CardTitle>
        {challenge.is_active ? (
            <Badge className="bg-green-600 text-white flex items-center gap-1"><Eye className="h-3 w-3" /> Aktív</Badge>
        ) : (
            <Badge className="bg-yellow-600 text-white flex items-center gap-1"><EyeOff className="h-3 w-3" /> Inaktív</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-gray-400 whitespace-normal break-words">{challenge.description || 'Nincs leírás.'}</CardDescription>
        
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
            {/* Condition */}
            <div className="flex items-center text-sm text-gray-300">
                <ListChecks className="h-4 w-4 mr-2 text-cyan-400" />
                Feltétel: <span className="font-semibold ml-1 text-white">
                    {CONDITION_LABELS[challenge.condition_type]} ({challenge.condition_value})
                </span>
            </div>
            
            {/* Condition Organizations */}
            {(challenge.condition_type === 'REDEEM_COUNT' || challenge.condition_type === 'TOTAL_POINTS') && (
                <div className="flex items-start text-sm text-gray-300">
                    <Building className="h-4 w-4 mr-2 mt-1 text-cyan-400 flex-shrink-0" />
                    Szervezetek: 
                    <span className="ml-1 font-semibold text-white flex flex-wrap gap-1">
                        {isOrganizationSpecific ? (
                            challenge.condition_organizations.map(id => (
                                <Badge key={id} className="bg-purple-600/50 text-purple-300">{getOrgName(id)}</Badge>
                            ))
                        ) : (
                            <Badge className="bg-gray-600/50 text-gray-300">Összes szervezet</Badge>
                        )}
                    </span>
                </div>
            )}
            
            {/* Reward */}
            <div className="flex items-center text-sm text-gray-300">
                <Coins className="h-4 w-4 mr-2 text-green-400" />
                Jutalom: <span className="font-semibold ml-1 text-white">
                    {challenge.reward_points} pont
                </span>
                {challenge.reward_organization_profile && (
                    <Badge className="ml-2 bg-green-600/50 text-green-300">{challenge.reward_organization_profile.organization_name}</Badge>
                )}
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700/50">
            <ChallengeEditDialog 
                challenge={challenge} 
                onUpdate={onUpdate} 
                isLoading={isLoading} 
                organizations={organizations}
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onToggleActive(challenge.id, challenge.is_active)}
              disabled={isLoading}
              className={`h-8 w-8 ${challenge.is_active ? 'bg-red-600/50 hover:bg-red-600/70 text-white' : 'bg-green-600/50 hover:bg-green-600/70 text-white'}`}
              title={challenge.is_active ? "Inaktiválás" : "Aktiválás"}
            >
              {challenge.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8" disabled={isLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-red-400">Küldetés törlése</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Biztosan VÉGLEGESEN törölni szeretnéd a "{challenge.title}" küldetést? Ez a művelet nem visszavonható.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                  </DialogClose>
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(challenge.id)}
                    disabled={isLoading}
                  >
                    Végleges Törlés
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};


const SuperadminChallengesPage: React.FC = () => {
  const { challenges, organizations, isLoading, fetchChallenges, createChallenge, updateChallenge, toggleActiveStatus, deleteChallenge } = useSuperadminChallenges();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  
  const activeChallenges = challenges.filter(c => c.is_active);
  const inactiveChallenges = challenges.filter(c => !c.is_active);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          Küldetések Kezelése ({challenges.length})
        </h2>
        <div className="flex space-x-3">
            <Button 
                onClick={fetchChallenges} 
                variant="outline" 
                size="icon"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                disabled={isLoading}
            >
                <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Új Küldetés
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-purple-300">Új Küldetés Létrehozása</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Hozd létre az új felhasználói kihívást.
                  </DialogDescription>
                </DialogHeader>
                <ChallengeForm 
                  onSubmit={createChallenge} 
                  onClose={() => setIsCreateFormOpen(false)} 
                  isLoading={isLoading}
                  organizations={organizations}
                />
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {isLoading && challenges.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="ml-3 text-gray-300">Küldetések betöltése...</p>
        </div>
      ) : (
        <div className="space-y-8">
            {/* Active Challenges */}
            <h3 className="text-2xl font-bold text-green-300 mb-4">Aktív Küldetések ({activeChallenges.length})</h3>
            {activeChallenges.length === 0 ? (
                <p className="text-gray-400 mb-8">Nincsenek aktív küldetések.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            onDelete={deleteChallenge} 
                            onUpdate={updateChallenge}
                            onToggleActive={toggleActiveStatus}
                            isLoading={isLoading}
                            organizations={organizations}
                        />
                    ))}
                </div>
            )}
            
            {/* Inactive Challenges */}
            <h3 className="text-2xl font-bold text-yellow-300 mb-4 pt-4 border-t border-gray-700/50">Inaktív Küldetések ({inactiveChallenges.length})</h3>
            {inactiveChallenges.length === 0 ? (
                <p className="text-gray-400">Nincsenek inaktív küldetések.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inactiveChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            onDelete={deleteChallenge} 
                            onUpdate={updateChallenge}
                            onToggleActive={toggleActiveStatus}
                            isLoading={isLoading}
                            organizations={organizations}
                        />
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SuperadminChallengesPage;