import React, { useState, useEffect } from 'react';
import { Clock, XCircle, CheckCircle } from 'lucide-react';

interface UsageCountdownProps {
  redeemedAt: string;
  isUsed: boolean;
}

// 3 minutes in milliseconds
const REDEMPTION_DURATION_MS = 3 * 60 * 1000;

const UsageCountdown: React.FC<UsageCountdownProps> = ({ redeemedAt, isUsed }) => {
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isUsed) {
      setIsExpired(false);
      setTimeLeftMs(0);
      return;
    }

    const startTime = new Date(redeemedAt).getTime();
    const expiryTime = startTime + REDEMPTION_DURATION_MS;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = expiryTime - now;
      
      if (remaining <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        return 0;
      }
      return remaining;
    };

    setTimeLeftMs(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeftMs(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [redeemedAt, isUsed]);

  if (isUsed) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/50 text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" /> Beváltva
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/50 text-red-300">
        <XCircle className="h-3 w-3 mr-1" /> Lejárt
      </span>
    );
  }

  const totalSeconds = Math.ceil(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-600/50 text-yellow-300 animate-pulse">
      <Clock className="h-3 w-3 mr-1" /> {timeDisplay}
    </span>
  );
};

export default UsageCountdown;