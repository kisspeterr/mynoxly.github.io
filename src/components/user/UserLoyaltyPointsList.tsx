import React from 'react';
import { useLoyaltyPoints } from '@/hooks/use-loyalty-points';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Coins, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserLoyaltyPointsList: React.FC = () => {
  const { points, isLoading } = useLoyaltyPoints();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
        <p className="ml-3 text-gray-300">Hűségpontok betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
        <Coins className="h-6 w-6" />
        Hűségpontjaim ({points.length})
      </h2>

      {points.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Még nincsenek hűségpontjaid.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map(pointRecord => (
            <Card 
              key={pointRecord.id} 
              className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white flex items-center justify-between p-4"
            >
              <Link to={`/organization/${pointRecord.profile.organization_name}`} className="flex items-center space-x-4 flex-grow min-w-0">
                {pointRecord.profile.logo_url ? (
                  <img 
                    src={pointRecord.profile.logo_url} 
                    alt={pointRecord.profile.organization_name} 
                    className="h-12 w-12 rounded-full object-cover border-2 border-purple-400"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-400">
                    <Building className="h-6 w-6 text-purple-400" />
                  </div>
                )}
                <div className="text-left min-w-0">
                  <CardTitle className="text-lg text-cyan-300 truncate">{pointRecord.profile.organization_name}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Összes pont:
                  </CardDescription>
                </div>
              </Link>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl font-bold text-purple-300">{pointRecord.points}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserLoyaltyPointsList;