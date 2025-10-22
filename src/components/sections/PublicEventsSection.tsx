import React from 'react';
import { Calendar, MapPin, Clock, Tag, Loader2, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicEvents } from '@/hooks/use-public-events';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Event } from '@/types/events';

// Extend Event type to include organization profile data
interface PublicEvent extends Event {
  logo_url: string | null;
}

const PublicEventsSection = () => {
  const { events, isLoading } = usePublicEvents();

  return (
    <section id="events-section" className="py-20 px-6">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Calendar className="h-4 w-4 mr-2" />
          Események
        </Badge>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-300">
          Mi történik Pécsen?
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
          Ne maradj le a legjobb bulikról és programokról a városban!
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="ml-3 text-gray-300">Események betöltése...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Jelenleg nincsenek meghirdetett események.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const logoUrl = (event as PublicEvent).logo_url;
              
              return (
                <Card 
                  key={event.id} 
                  className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col"
                >
                  {event.image_url && (
                    <div className="h-40 w-full overflow-hidden rounded-t-xl">
                      <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-purple-300">{event.title}</CardTitle>
                    
                    {/* Organization Name with Logo and Link */}
                    <Link 
                      to={`/organization/${event.organization_name}`}
                      className="flex items-center text-gray-400 hover:text-purple-300 transition-colors duration-300 group"
                    >
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={event.organization_name} 
                          className="h-6 w-6 rounded-full object-cover mr-2 border border-gray-600 group-hover:border-purple-400"
                        />
                      ) : (
                        <Building className="h-5 w-5 mr-2 text-gray-500 group-hover:text-purple-400" />
                      )}
                      <CardDescription className="text-gray-400 group-hover:text-purple-300 transition-colors duration-300">
                        {event.organization_name}
                      </CardDescription>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow text-left">
                    <p className="text-gray-300">{event.description || 'Nincs leírás.'}</p>
                    
                    <div className="flex items-center text-sm text-gray-300 pt-2 border-t border-gray-700/50">
                      <Clock className="h-4 w-4 mr-2 text-cyan-400" />
                      Kezdés: <span className="font-semibold ml-1 text-white">{format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm')}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                        Helyszín: <span className="font-semibold ml-1 text-white">{event.location}</span>
                      </div>
                    )}

                    {event.coupon && (
                      <div className="flex items-center text-sm text-green-400">
                        <Tag className="h-4 w-4 mr-2" />
                        Kupon: <span className="font-semibold ml-1">{event.coupon.title}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicEventsSection;