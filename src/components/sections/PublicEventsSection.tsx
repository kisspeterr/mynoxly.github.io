import React from 'react';
import { Calendar, MapPin, Clock, Tag, Loader2, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicEvents } from '@/hooks/use-public-events';
import { format } from 'date-fns';
import DynamicPublicEventMap from '@/components/DynamicPublicEventMap'; // Import the dynamic map component

const PublicEventsSection = () => {
  const { events, isLoading } = usePublicEvents();

  return (
    <section id="events-section" className="py-20 px-6 bg-black/50">
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
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col"
              >
                {event.image_url && (
                  <div className="h-40 w-full overflow-hidden rounded-t-xl">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-purple-300">{event.title}</CardTitle>
                  <CardDescription className="text-gray-400">{event.organization_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow text-left">
                  <p className="text-gray-300">{event.description || 'Nincs leírás.'}</p>
                  
                  {/* Map Display */}
                  {(event.latitude && event.longitude && event.location) && (
                    <DynamicPublicEventMap 
                      lat={event.latitude} 
                      lng={event.longitude} 
                      locationName={event.location} 
                    />
                  )}
                  
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
                  
                  {event.event_link && (
                    <Button asChild className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      <a href={event.event_link} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Esemény Linkje
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicEventsSection;