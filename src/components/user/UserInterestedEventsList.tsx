import React from 'react';
import { useInterestedEvents, InterestedEventRecord } from '@/hooks/use-interested-events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Heart, Calendar, MapPin, Clock, Building, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import EventCountdown from '@/components/EventCountdown';

const InterestedEventCard: React.FC<{ record: InterestedEventRecord, toggleInterest: (eventId: string, eventTitle: string) => Promise<void> }> = ({ record, toggleInterest }) => {
  const event = record.event;
  const logoUrl = event.logo_url;
  
  const handleRemove = () => {
    toggleInterest(event.id, event.title);
  };

  return (
    <Card 
      className="bg-black/50 border-red-500/30 backdrop-blur-sm text-white flex flex-col"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link to={`/organization/${event.organization_name}`} className="flex flex-col items-start flex-grow min-w-0 mr-4">
            <CardTitle className="text-xl text-cyan-300 truncate">{event.title}</CardTitle>
            <CardDescription className="text-gray-400 flex items-center text-sm mt-1">
                {logoUrl ? (
                    <img src={logoUrl} alt={event.organization_name} className="h-4 w-4 rounded-full object-cover mr-1" />
                ) : (
                    <Building className="h-4 w-4 mr-1" />
                )}
                {event.organization_name}
            </CardDescription>
        </Link>
        
        <EventCountdown startTime={event.start_time} endTime={event.end_time} />
      </CardHeader>
      <CardContent className="space-y-3 text-left text-sm">
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
            Kezdés: <span className="font-semibold ml-1 text-white break-all">{format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm')}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
              Helyszín: <span className="font-semibold ml-1 text-white break-all">{event.location}</span>
            </div>
          )}
        </div>
        
        <Button 
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="w-full mt-4"
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Érdeklődés eltávolítása
        </Button>
      </CardContent>
    </Card>
  );
};

const UserInterestedEventsList: React.FC = () => {
  const { interestedEvents, isLoading, toggleInterest } = useInterestedEvents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-red-400" />
        <p className="ml-3 text-gray-300">Érdeklődő események betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-red-300 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Érdeklődő Eseményeim ({interestedEvents.length})
      </h2>

      {interestedEvents.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Még nem jelöltél be eseményt érdeklődőnek.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interestedEvents.map(record => (
            <InterestedEventCard 
                key={record.id} 
                record={record} 
                toggleInterest={toggleInterest} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInterestedEventsList;