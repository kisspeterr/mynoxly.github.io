import React, { useEffect, useState } from 'react';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Calendar, Tag, Loader2, MapPin, Clock, Pencil, RefreshCw, CheckCircle, XCircle, Archive, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import EventForm from './EventForm';
import { format } from 'date-fns';
import { Event, EventInsert } from '@/types/events';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

interface EventEditDialogProps {
  event: Event;
  onUpdate: (id: string, data: Partial<EventInsert>) => Promise<{ success: boolean }>;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventEditDialog: React.FC<EventEditDialogProps> = ({ event, onUpdate, isLoading, isOpen, onOpenChange }) => {
  const handleSubmit = async (data: EventInsert) => {
    // We only send fields that might have changed, excluding organization_name, is_active, is_archived
    const updateData: Partial<EventInsert> = {
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      image_url: data.image_url,
      coupon_id: data.coupon_id,
      event_link: data.event_link,
      link_title: data.link_title,
    };
    
    const result = await onUpdate(event.id, updateData);
    if (result.success) {
      onOpenChange(false);
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* Only render trigger if dialog is not already open */}
        {!isOpen && (
            <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
              <Pencil className="h-4 w-4" />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Esemény szerkesztése</DialogTitle>
          <DialogDescription className="text-gray-400">
            Frissítsd a "{event.title}" esemény adatait.
          </DialogDescription>
        </DialogHeader>
        <EventForm 
          onSubmit={handleSubmit} 
          onClose={() => onOpenChange(false)} 
          isLoading={isLoading}
          initialData={event}
        />
      </DialogContent>
    </Dialog>
  );
};


interface EventCardProps {
  event: Event;
  onDelete: (id: string, isArchived: boolean) => Promise<{ success: boolean }>;
  onUpdate: (id: string, data: Partial<EventInsert>) => Promise<{ success: boolean }>;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
  onArchive: (id: string) => Promise<{ success: boolean }>;
  onUnarchive: (id: string) => Promise<{ success: boolean }>;
  isLoading: boolean;
  canManage: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete, onUpdate, onToggleActive, onArchive, onUnarchive, isLoading, canManage }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const startTime = format(new Date(event.start_time), 'yyyy. MM. dd. HH:mm');
  const isArchived = event.is_archived;
  const isActive = event.is_active;
  
  const statusBadge = () => {
    if (isArchived) {
      return <Badge className="bg-gray-600 text-white">Archiválva</Badge>;
    }
    if (isActive) {
      return <Badge className="bg-green-600 text-white">Aktív (Publikálva)</Badge>;
    }
    return <Badge className="bg-yellow-600 text-white">Piszkozat (Inaktív)</Badge>;
  };
  
  const statusClasses = isArchived ? 'opacity-50 border-gray-700/50' : isActive ? 'border-green-500/30' : 'border-yellow-500/30';


  return (
    <Card className={`bg-black/50 backdrop-blur-sm text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 flex flex-col ${statusClasses}`}>
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
        {statusBadge()}
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <CardDescription className="text-gray-400 whitespace-normal break-words">{event.description || 'Nincs leírás.'}</CardDescription>
        
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
        
        {/* Actions */}
        {canManage && (
            <div className="flex space-x-2 pt-4 border-t border-gray-700/50">
              <EventEditDialog 
                event={event} 
                onUpdate={onUpdate} 
                isLoading={isLoading}
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
              />
              
              {/* Publish / Deactivate / Archive Button */}
              {!isArchived && (
                <>
                  {isActive ? (
                    // Active -> Deactivate
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => onToggleActive(event.id, isActive)}
                      disabled={isLoading}
                      className="h-8 w-8 bg-red-600/50 hover:bg-red-600/70"
                      title="Inaktiválás (Piszkozat)"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    // Inactive (Draft) -> Publish
                    <Button 
                      variant="default" 
                      size="icon" 
                      onClick={() => onToggleActive(event.id, isActive)}
                      disabled={isLoading}
                      className="h-8 w-8 bg-green-600/50 hover:bg-green-600/70"
                      title="Publikálás (Aktiválás)"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Archive Button (Only if not archived) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-gray-500/50 text-gray-400 hover:bg-gray-500/10" disabled={isLoading}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 border-gray-500/30 backdrop-blur-sm max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-gray-400">Esemény archiválása</DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Biztosan archiválni szeretnéd a "{event.title}" eseményt? Ez inaktiválja és elrejti a nyilvános nézetből.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                        </DialogClose>
                        <Button 
                          variant="default" 
                          onClick={() => onArchive(event.id)}
                          disabled={isLoading}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          Archiválás megerősítése
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {/* Unarchive Button (Only if archived) */}
              {isArchived && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => onUnarchive(event.id)}
                  disabled={isLoading}
                  className="h-8 w-8 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                  title="Visszaállítás a piszkozatok közé"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              
              {/* Permanent Delete Button (Only if archived) */}
              {isArchived && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8" disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/80 border-red-500/30 backdrop-blur-sm max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-red-400">Végleges törlés</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Biztosan VÉGLEGESEN törölni szeretnéd a "{event.title}" archivált eseményt? Ez a művelet nem visszavonható.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800">Mégsem</Button>
                      </DialogClose>
                      <Button 
                        variant="destructive" 
                        onClick={() => onDelete(event.id, true)}
                        disabled={isLoading}
                      >
                        Végleges Törlés
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

const EventsPage = () => {
  const { events, isLoading, fetchEvents, createEvent, updateEvent, toggleActiveStatus, archiveEvent, unarchiveEvent, deleteEvent, organizationName } = useEvents();
  const { checkPermission, activeOrganizationProfile } = useAuth();
  const [isCreateFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  
  const canManageEvents = checkPermission('event_manager');

  const activeEvents = events.filter(e => e.is_active && !e.is_archived);
  const draftEvents = events.filter(e => !e.is_active && !e.is_archived);
  const archivedEvents = events.filter(e => e.is_archived);
  
  const handleCreateEvent = async (data: EventInsert) => {
      const result = await createEvent(data);
      if (result.success && result.newEventId) {
          // Find the newly created event in the local state
          // We rely on the hook refreshing the list
          setIsFormOpen(false);
          return { success: true };
      }
      return { success: false };
  };
  
  const handleUpdateEvent = async (id: string, data: Partial<EventInsert>) => {
      const result = await updateEvent(id, data);
      if (result.success) {
          setEventToEdit(null);
      }
      return result;
  };

  if (!activeOrganizationProfile) {
    return (
        <Card className="text-center p-10 bg-gray-800/50 rounded-lg border border-red-500/30 mt-6">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-300 mb-2">Nincs aktív szervezet</h3>
            <p className="text-gray-400">Kérjük, válassz egy szervezetet a Dashboard tetején az események kezeléséhez.</p>
        </Card>
    );
  }

  // Check if the user has permission to view the list
  if (!checkPermission('event_manager') && !checkPermission('viewer')) {
      return <p className="text-red-400 text-center mt-10">Nincs jogosultságod az események megtekintéséhez.</p>;
  }

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
        <div className="flex space-x-3">
            <Button 
                onClick={fetchEvents} 
                variant="outline" 
                size="icon"
                className="border-gray-700 text-gray-400 hover:bg-gray-800"
                disabled={isLoading}
            >
                <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
            {canManageEvents && (
                <Dialog open={isCreateFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Új Esemény
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/80 border-purple-500/30 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-purple-300">Új Esemény Létrehozása</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Hozd létre az új eseményt a {organizationName} számára.
                      </DialogDescription>
                    </DialogHeader>
                    <EventForm 
                      onSubmit={handleCreateEvent} 
                      onClose={() => setIsFormOpen(false)} 
                      isLoading={isLoading}
                    />
                  </DialogContent>
                </Dialog>
            )}
        </div>
      </div>
      
      {/* Active Events */}
      <h3 className="text-2xl font-bold text-green-300 mb-4">Aktív (Publikált) Események ({activeEvents.length})</h3>
      {activeEvents.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10 mb-12">Jelenleg nincsenek publikált események.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={deleteEvent} 
              onUpdate={handleUpdateEvent}
              onToggleActive={toggleActiveStatus}
              onArchive={archiveEvent}
              onUnarchive={unarchiveEvent}
              isLoading={isLoading}
              canManage={canManageEvents}
            />
          ))}
        </div>
      )}
      
      {/* Draft Events */}
      <h3 className="text-2xl font-bold text-yellow-300 mb-4">Piszkozatok ({draftEvents.length})</h3>
      {draftEvents.length === 0 && !isLoading ? (
        <p className="text-gray-400 text-center mt-10 mb-12">Nincsenek piszkozat állapotú események.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {draftEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={deleteEvent} 
              onUpdate={handleUpdateEvent}
              onToggleActive={toggleActiveStatus}
              onArchive={archiveEvent}
              onUnarchive={unarchiveEvent}
              isLoading={isLoading}
              canManage={canManageEvents}
            />
          ))}
        </div>
      )}
      
      {/* Archived Events */}
      <h3 className="text-2xl font-bold text-gray-400 mb-4 flex items-center gap-2">
        <Archive className="h-5 w-5" /> Archivált Események ({archivedEvents.length})
      </h3>
      {archivedEvents.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">Nincsenek archivált események.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={deleteEvent} 
              onUpdate={handleUpdateEvent}
              onToggleActive={toggleActiveStatus}
              onArchive={archiveEvent}
              onUnarchive={unarchiveEvent}
              isLoading={isLoading}
              canManage={canManageEvents}
            />
          ))}
        </div>
      )}
      
      {/* Dedicated Edit Dialog for newly created event (if needed) */}
      {eventToEdit && (
          <EventEditDialog 
              event={eventToEdit} 
              onUpdate={handleUpdateEvent} 
              isLoading={isLoading} 
              isOpen={true}
              onOpenChange={(open) => {
                  if (!open) setEventToEdit(null);
              }}
          />
      )}
    </div>
  );
};

export default EventsPage;