import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Tag, Building, Heart, Loader2, Info, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useInterestedEvents } from '@/hooks/use-interested-events';
import { useAuth } from '@/hooks/use-auth';
import { showError } from '@/utils/toast';

// Extend Event type to include organization profile data
interface PublicEvent extends Event {
  logo_url: string | null;
}

interface EventDetailsModalProps {
  event: PublicEvent;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { isInterested, toggleInterest } = useInterestedEvents();
  const [isToggling, setIsToggling] = useState(false);
  
  const interested = isInterested(event.id);

  const handleToggleInterest = async () => {
    if (!isAuthenticated) {
      showError('Kérjük, jelentkezz be az érdeklődés jelöléséhez.');
      return;
    }
    setIsToggling(true);
    await toggleInterest(event.id, event.title);
    setIsToggling(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-purple-500/30 backdrop-blur-xl max-w-lg w-[95vw] md:w-full p-0 text-white overflow-hidden">
        
        <div className="max-h-[90vh] overflow-y-auto">
            
            {/* Image Header */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                {event.image_url ? (
                    <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-purple-400" />
                    </div>
                )}
                
                {/* Organization Info Overlay (Top Left) */}
                <Link 
                    to={`/organization/${event.organization_name}`}
                    className="absolute top-3 left-3 z-10 flex items-center p-2 bg-black/50 rounded-full backdrop-blur-sm border border-purple-400/50 hover:bg-black/70 transition-all duration-300"
                    onClick={onClose} // Close modal when navigating
                >
                    {/* Logo */}
                    <div className="w-8 h-8 rounded-full bg-gray-900 p-0.5 border border-purple-400 overflow-hidden flex-shrink-0">
                        {event.logo_url ? (
                            <img 
                                src={event.logo_url} 
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
                    <span className="text-sm font-semibold text-gray-300 ml-2 hover:text-purple-300 transition-colors truncate max-w-[100px] hidden sm:block">
                        {event.organization_name}
                    </span>
                </Link>
            </div>
            
            <div className="p-6 pt-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-purple-300 mb-2">{event.title}</DialogTitle>
                    
                    {/* Interest Button */}
                    <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
                        <Button
                            onClick={handleToggleInterest}
                            disabled={isToggling || !isAuthenticated}
                            className={`w-full sm:w-auto transition-colors duration-300 ${
                                interested 
                                    ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30' 
                                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-red-400'
                            }`}
                        >
                            {isToggling ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Heart className={`h-4 w-4 mr-2 ${interested ? 'fill-red-400' : ''}`} />
                            )}
                            {interested ? 'Érdeklődés eltávolítása' : 'Érdekel'}
                        </Button>
                    </div>
                </DialogHeader>

                {/* Full Description */}
                <div className="space-y-3 max-h-40 overflow-y-auto pr-4 border border-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Info className="h-5 w-5 text-cyan-400" />
                        Leírás:
                    </h4>
                    <p className="text-gray-300 whitespace-normal break-words text-sm">
                        {event.description && event.description.trim() !== '' ? event.description : 'Nincs részletes leírás megadva.'}
                    </p>
                </div>
                
                {/* Details Grid */}
                <div className="space-y-4 border-t border-b border-gray-700/50 py-4 text-sm">
                    <div className="flex items-center text-gray-300">
                        <Clock className="h-4 w-4 mr-2 text-purple-400" />
                        Kezdés: <span className="font-semibold ml-1 text-white">{format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm')}</span>
                        {event.end_time && (
                            <span className="ml-2 text-gray-500"> - {format(new Date(event.end_time), 'HH:mm')}</span>
                        )}
                    </div>
                    
                    {event.location && (
                        <div className="flex items-center text-gray-300">
                            <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                            Helyszín: <span className="font-semibold ml-1 text-white">{event.location}</span>
                        </div>
                    )}
                    
                    {event.coupon && (
                        <div className="flex items-center text-green-400">
                            <Tag className="h-4 w-4 mr-2" />
                            Kupon csatolva: <span className="font-semibold ml-1">{event.coupon.title}</span>
                        </div>
                    )}
                    
                    {event.event_link && (
                        <div className="flex items-center text-cyan-400">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            <a 
                                href={event.event_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-semibold hover:underline break-all"
                            >
                                Esemény link
                            </a>
                        </div>
                    )}
                </div>

                <Button 
                    onClick={onClose}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                    Bezárás
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;