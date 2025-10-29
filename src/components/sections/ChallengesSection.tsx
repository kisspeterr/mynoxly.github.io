import React, { useState } from 'react';
import { ListChecks, Loader2, Coins, Building, CheckCircle, ArrowRight, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useChallenges, ActiveChallenge } from '@/hooks/use-challenges';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { showError } from '@/utils/toast';

const CONDITION_LABELS: Record<ActiveChallenge['condition_type'], string> = {
    REDEEM_COUNT: 'Kupon beváltás',
    TOTAL_POINTS: 'Összegyűjtött pont',
    DIFFERENT_ORGANIZATIONS: 'Különböző szervezetek',
};

const ChallengeCard: React.FC<{ challenge: ActiveChallenge, onClaim: (id: string) => Promise<{ success: boolean }> }> = ({ challenge, onClaim }) => {
    const { isAuthenticated } = useAuth();
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
            const orgNames = challenge.condition_organizations.map(id => challenge.reward_organization_profile?.organization_name || 'Szervezet').join(', ');
            return `${base} (${orgCount} adott szervezetnél)`;
        }
        return base;
    };

    return (
        <Card 
            className={`bg-black/50 backdrop-blur-sm text-white transition-shadow duration-300 flex flex-col ${isCompleted ? 'border-green-500/30' : 'border-purple-500/30'}`}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl text-purple-300">{challenge.title}</CardTitle>
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
            <CardContent className="space-y-3 flex-grow">
                <CardDescription className="text-gray-400 whitespace-normal break-words">{challenge.description || 'Teljesítsd a kihívást!'}</CardDescription>
                
                {/* Progress Bar */}
                {isAuthenticated && (
                    <div className="pt-2 space-y-2">
                        <div className="flex justify-between items-center text-sm text-gray-300">
                            <span>{getConditionText()}</span>
                            <span className="font-semibold text-white">{challenge.progress_percentage}%</span>
                        </div>
                        <Progress value={challenge.progress_percentage} className="h-2 bg-gray-700" indicatorClassName={isCompleted ? 'bg-green-500' : 'bg-purple-500'} />
                    </div>
                )}
                
                {/* Reward Info */}
                <div className="flex items-center text-sm text-gray-300 pt-2 border-t border-gray-700/50">
                    <Coins className="h-4 w-4 mr-2 text-green-400" />
                    Jutalom: <span className="font-semibold ml-1 text-white">{challenge.reward_points} pont</span>
                    {challenge.reward_organization_profile && (
                        <Badge className="ml-2 bg-green-600/50 text-green-300">{challenge.reward_organization_profile.organization_name}</Badge>
                    )}
                </div>
                
                {/* Action Button */}
                <div className="pt-4">
                    {!isAuthenticated ? (
                        <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
                            <Link to="/login">
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Kezdés (Bejelentkezés)
                            </Link>
                        </Button>
                    ) : isClaimed ? (
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


const ChallengesSection = () => {
  const { activeChallenges, isLoading, claimReward } = useChallenges();
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <section id="challenges-section" className="py-12 px-6">
        <div className="container mx-auto text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
            <p className="ml-3 text-gray-300 mt-4">Küldetések betöltése...</p>
        </div>
      </section>
    );
  }
  
  // Filter: Only show challenges that are NOT completed OR are completed but NOT claimed.
  const visibleChallenges = activeChallenges.filter(c => 
      !isAuthenticated || !c.user_progress || !c.user_progress.is_reward_claimed
  );
  
  if (visibleChallenges.length === 0) {
      return null; // Hide section if no relevant challenges are active
  }

  return (
    <section id="challenges-section" className="py-12 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <ListChecks className="h-4 w-4 mr-2" />
          Küldetések
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
          Teljesítsd a kihívásokat!
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Gyűjts extra hűségpontokat a Pécsi éjszakai élet felfedezésével.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleChallenges.map(challenge => (
            <ChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                onClaim={claimReward} 
            />
          ))}
        </div>
        
        {!isAuthenticated && (
            <div className="mt-12 p-6 bg-cyan-900/30 border border-cyan-500/50 rounded-xl max-w-lg mx-auto">
                <p className="text-lg text-cyan-300 font-semibold">Jelentkezz be az előrehaladásod nyomon követéséhez!</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default ChallengesSection;