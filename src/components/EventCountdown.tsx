import React, { useState, useEffect } from 'react';
import { Clock, Calendar, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { differenceInSeconds, format, isPast, isFuture, isSameDay, isSameHour } from 'date-fns';

interface EventCountdownProps {
  startTime: string;
  endTime: string | null;
}

// Helper functions to check status
export const isEventRunning = (start: Date, end: Date | null): boolean => {
    return isPast(start) && (end ? isFuture(end) : true);
};

export const isEventFinished = (start: Date, end: Date | null): boolean => {
    return end ? isPast(end) : isPast(start);
};

export const isEventUpcoming = (start: Date): boolean => {
    return isFuture(start);
};


const EventCountdown: React.FC<EventCountdownProps> = ({ startTime, endTime }) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const running = isEventRunning(start, end);
  const finished = isEventFinished(start, end);
  const upcoming = isEventUpcoming(start);

  if (running) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/50 text-green-300 animate-pulse">
        <PlayCircle className="h-3 w-3 mr-1" /> ÉLŐBEN
      </span>
    );
  }

  if (finished) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/50 text-gray-300">
        <XCircle className="h-3 w-3 mr-1" /> Lejárt
      </span>
    );
  }
  
  // Calculate time remaining for upcoming events
  if (upcoming) {
    const totalSeconds = differenceInSeconds(start, now);
    
    if (totalSeconds <= 0) {
        // Should be caught by isEventRunning, but as a fallback
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/50 text-green-300">
                <PlayCircle className="h-3 w-3 mr-1" /> Hamarosan
            </span>
        );
    }

    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    let countdownText = '';
    let badgeClass = 'bg-cyan-600/50 text-cyan-300';

    if (days > 0) {
      countdownText = `${days} nap ${hours} óra`;
    } else if (hours > 0) {
      countdownText = `${hours} óra ${minutes} perc`;
      badgeClass = 'bg-yellow-600/50 text-yellow-300 animate-pulse';
    } else {
      countdownText = `${minutes} perc ${seconds} mp`;
      badgeClass = 'bg-red-600/50 text-red-300 animate-pulse';
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeClass} whitespace-nowrap`}>
        <Clock className="h-3 w-3 mr-1" /> {countdownText}
      </span>
    );
  }

  return null;
};

export default EventCountdown;