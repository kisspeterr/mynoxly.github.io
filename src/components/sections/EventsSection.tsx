import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Tag, Loader2, Building, Heart, Loader2 as Spinner, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicEvents } from '@/hooks/use-public-events';
import { useInterestedEvents } from '@/hooks/use-interested-events'; // Import new hook
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Event } from '@/types/events';
import EventCountdown from '@/components/EventCountdown'; // Import Countdown
import EventDetailsModal from '@/components/EventDetailsModal'; // NEW IMPORT

// Extend Event type to include organization profile data
interface PublicEvent extends Event {
  logo_url: string | null;
}

const EventsSection = () => {
  const { events, isLoading } = usePublicEvents();
  const { isAuthenticated } = useAuth();
  const { isInterested, toggleInterest } = useInterestedEvents();
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  const openDetailsModal = (event: PublicEvent) => {
      setSelectedEvent(event);
      setIsDetailsModalOpen(true);
  };
  
  const closeDetailsModal = () => {
      setIsDetailsModalOpen(false);
      setSelectedEvent(null);
  };

  return (
    <section id="events-section" className="py-12 px-6">
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
          <div className="flex flex-wrap justify-center gap-8">
            {events.map((event) => {
              const logoUrl = (event as PublicEvent).logo_url;
              const interested = isInterested(event.id);
              
              return (
                <div 
                    key={event.id} 
                    className="relative w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm transition-all duration-300 hover:scale-[1.02]"
                >
                    
                    <Card 
                      className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col w-full cursor-pointer"
                      onClick={() => openDetailsModal(event)}
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Calendar className="h-12 w-12 text-purple-400" />
                            </div>
                        )}
                        
                        {/* Organization Info Overlay (Top Left) */}
                        <Link 
                            to={`/organization/${event.organization_name}`}
                            className="absolute top-3 left-3 z-10 flex items-center p-2 bg-black/50 rounded-full backdrop-blur-sm border border-purple-400/50 group-hover:bg-black/70 transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Logo */}
                            <div className="w-8 h-8 rounded-full bg-gray-900 p-0.5 border border-purple-400 overflow-hidden flex-shrink-0">
                                {logoUrl ? (
                                    <img 
                                        src={logoUrl} 
                                        alt={event.organization_name} 
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center">
                                        <Building className="h-4 w-4 text-purple-400" />
                                    </div>
                                )}
                            </div>
                            {/* Organization Name */}
                            <span className="text-sm font-semibold text-gray-300 ml-2 group-hover:text-purple-300 transition-colors truncate max-w-[100px] hidden sm:block">
                                {event.organization_name}
                            </span>
                        </Link>
                        
                        {/* Countdown Overlay (Top Right) */}
                        <div className="absolute top-3 right-3 z-10">
                            <EventCountdown startTime={event.start_time} endTime={event.end_time} />
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4 pt-4">
                        <CardTitle className="text-2xl text-purple-300 w-full break-words text-left">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-grow text-left">
                        
                        <div className="flex items-center text-sm text-gray-300">
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
                            Kupon csatolva
                          </div>
                        )}
                        
                        {/* Details Button */}
                        <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); openDetailsModal(event); }}
                            className="w-full mt-4 border-purple-400 text-purple-400 hover:bg-purple-400/10"
                        >
                            Részletek <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Event Details Modal */}
        {selectedEvent && (
            <EventDetailsModal
                event={selectedEvent}
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
            />
        )}
      </div>
    </section>
  );
};

export default EventsSection;