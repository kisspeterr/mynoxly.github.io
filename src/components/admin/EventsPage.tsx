import React, { useEffect, useState } from 'react';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, Tag, Loader2, MapPin, Clock, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import EventForm from './EventForm';
import { format } from 'date-fns';
import { Event, EventInsert } from '@/types/events';

interface EventEditDialogProps {
  event: Event;
  onUpdate: (id: string, data: Partial<EventInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
}

const EventEditDialog: React.FC<EventEditDialogProps> = ({ event, onUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: EventInsert) => {
    // We only send fields that might have changed, excluding organization_name
    const updateData: Partial<EventInsert> = {
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      location: data.location,
      image_url: data.image_url,
      coupon_id: data.coupon_id,
    };
    
    const result = await onUpdate(event.id, updateData);
    if (result.success) {
      setIsOpen(false);
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Esemény szerkesztése</DialogTitle>
          <DialogDescription className="text-gray-400">
            Frissítsd a "{event.title}" esemény adatait.
          </DialogDescription>
        </DialogHeader>
        <EventForm 
          onSubmit={handleSubmit} 
          onClose={() => setIsOpen(false)} 
          isLoading={isLoading}
          initialData={event}
        />
      </DialogContent>
    </Dialog>
  );
};


const EventCard: React.FC<{ event: Event, onDelete: (id: string) => void, onUpdate: (id: string, data: Partial<EventInsert>) => Promise<{ success: boolean }>, isLoading: boolean }> = ({ event, onDelete, onUpdate, isLoading }) => {
  const startTime = format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm');

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col">
      {event.image_url && (
        <div className="h-40 w-full overflow-hidden rounded-t-xl">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl text-purple-300">{event.title}</CardTitle>
        <div className="flex space-x-2">
          <EventEditDialog event={event} onUpdate={onUpdate} isLoading={isLoading} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-red-400">Esemény törlése</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Biztosan törölni szeretnéd a "{event.title}" eseményt? Ez a művelet nem visszavonható.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={() => onDelete(event.id)}
                >
                  Törlés megerősítése
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <CardDescription className="text-gray-400">{event.description || 'Nincs leírás.'}</CardDescription>
        
        <div className="flex items-center text-sm text-gray-300">
          <Clock className="h-4 w-4 mr-2 text-cyan-400" />
          Kezdés: <span className="font-semibold ml-1 text-white">{startTime}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
            Helyszín: <span className="font-semibold ml-1 text-white">{event.location}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-700/50">
          {event.coupon ? (
            <div className="flex items-center text-sm text-green-400">
              <Tag className="h-4 w-4 mr-2" />
              Kupon csatolva: <span className="font-semibold ml-1">{event.coupon.title}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nincs kupon csatolva.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EventsPage = () => {
  const { events, isLoading, fetchEvents, createEvent, updateEvent, deleteEvent, organizationName } = useEvents();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="ml-3 text-gray-300">Események betöltése...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Esemény Kezelés
        </h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Új Esemény
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Új Esemény Létrehozása</DialogTitle>
              <DialogDescription className="text-gray-400">
                Hozd létre az új eseményt a {organizationName} számára.
              </DialogDescription>
            </DialogHeader>
            <EventForm 
              onSubmit={createEvent} 
              onClose={() => setIsFormOpen(false)} 
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10">Még nincsenek események ehhez a szervezethez.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={deleteEvent} 
              onUpdate={updateEvent}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;