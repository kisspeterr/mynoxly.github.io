import React, { useState } from 'react';
import { useChallenges, ActiveChallenge } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ListChecks, Coins, CheckCircle, Gift, ArrowRight, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const CONDITION_LABELS: Record<ActiveChallenge['condition_type'], string> = {
    REDEEM_COUNT: 'Kupon beváltás',
    TOTAL_POINTS: 'Összegyűjtött pont',
    DIFFERENT_ORGANIZATIONS: 'Különböző szervezetek',
};

const ChallengeItem: React.FC<{ challenge: ActiveChallenge, onClaim: (id: string) => Promise<{ success: boolean }> }> = ({ challenge, onClaim }) => {
    const [isClaiming, setIsClaiming] = useState(false);
    
    const progress = challenge.user_progress?.progress_value || 0;
    const target = challenge.condition_value;
    const isCompleted = challenge.user_progress?.is_completed || false;
    const isClaimed = challenge.user_progress?.is_reward_claimed || false;
    
    const handleClaim = async () => {
        setIsClaiming(true);
        await onClaim(challenge.id);
        setIsClaiming(false);
    };
    
    const getConditionText = () => {
        const base = `${CONDITION_LABELS[challenge.condition_type]}: ${progress}/${target}`;
        
        if (challenge.condition_organizations.length > 0) {
            const orgCount = challenge.condition_organizations.length;
            return `${base} (${orgCount} adott szervezetnél)`;
        }
        return base;
    };
    
    const statusClasses = isClaimed ? 'border-green-500/30 opacity-80' : isCompleted ? 'border-yellow-500/30' : 'border-purple-500/30';

    return (
        <Card className={`bg-black/50 backdrop-blur-sm text-white flex flex-col ${statusClasses}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-purple-300 mr-2 break-words max-w-[70%]">{challenge.title}</CardTitle>
                {isClaimed ? (
                    <Badge className="bg-green-700 text-white flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Igényelve
                    </Badge>
                ) : isCompleted ? (
                    <Badge className="bg-yellow-600 text-white flex items-center gap-1 animate-pulse">
                        <Gift className="h-3 w-3" /> Kész!
                    </Badge>
                ) : (
                    <Badge className="bg-gray-600 text-white">Folyamatban</Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-3 text-left text-sm">
                <CardDescription className="text-gray-400">{challenge.description || 'Teljesítsd a kihívást!'}</CardDescription>
                
                <div className="pt-2 space-y-2 border-t border-gray-700/50">
                    {/* Progress */}
                    <div className="flex justify-between items-center text-sm text-gray-300">
                        <span>{getConditionText()}</span>
                        <span className="font-semibold text-white">{challenge.progress_percentage}%</span>
                    </div>
                    <Progress value={challenge.progress_percentage} className="h-2 bg-gray-700" indicatorClassName={isCompleted ? 'bg-green-500' : 'bg-purple-500'} />
                    
                    {/* Reward Info */}
                    <div className="flex items-center text-sm text-gray-300">
                        <Coins className="h-4 w-4 mr-2 text-green-400 flex-shrink-0" />
                        Jutalom: <span className="font-semibold ml-1 text-white">{challenge.reward_points} pont</span>
                        {challenge.reward_organization_profile && (
                            <Badge className="ml-2 bg-green-600/50 text-green-300 flex items-center gap-1">
                                <Building className="h-3 w-3 mr-1" /> {challenge.reward_organization_profile.organization_name}
                            </Badge>
                        )}
                    </div>
                </div>
                
                {/* Action Button */}
                <div className="pt-4">
                    {isClaimed ? (
                        <Button disabled className="w-full bg-gray-600/50 text-gray-300">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Jutalom igényelve
                        </Button>
                    ) : isCompleted ? (
                        <Button 
                            onClick={handleClaim}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            disabled={isClaiming}
                        >
                            {isClaiming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gift className="h-4 w-4 mr-2" />}
                            Jutalom igénylése
                        </Button>
                    ) : (
                        <Button disabled variant="outline" className="w-full border-purple-500/50 text-purple-300">
                            Folyamatban...
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const UserChallengesList: React.FC = () => {
  const { activeChallenges, isLoading, claimReward } = useChallenges();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
        <p className="ml-3 text-gray-300">Küldetések betöltése...</p>
      </div>
    );
  }
  
  // Sort challenges: Incomplete > Completed/Unclaimed > Claimed
  const sortedChallenges = [...activeChallenges].sort((a, b) => {
      const aStatus = a.user_progress?.is_completed ? (a.user_progress.is_reward_claimed ? 2 : 1) : 0;
      const bStatus = b.user_progress?.is_completed ? (b.user_progress.is_reward_claimed ? 2 : 1) : 0;
      
      // Sort by status (0 < 1 < 2)
      if (aStatus !== bStatus) {
          return aStatus - bStatus;
      }
      // Secondary sort by creation date
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
        <ListChecks className="h-6 w-6" />
        Küldetéseim ({activeChallenges.length})
      </h2>

      {activeChallenges.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Jelenleg nincsenek aktív küldetések.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedChallenges.map(challenge => (
            <ChallengeItem key={challenge.id} challenge={challenge} onClaim={claimReward} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserChallengesList;