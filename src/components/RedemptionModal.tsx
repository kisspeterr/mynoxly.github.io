import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Coupon } from '@/types/coupons';
import { showError } from '@/utils/toast';

interface RedemptionModalProps {
  coupon: Coupon;
  redemptionCode: string; // Now using the short code
  usageId: string; // Still needed for potential cleanup/tracking
  isOpen: boolean;
  onClose: () => void;
}

// 3 minutes in seconds
const REDEMPTION_DURATION_SECONDS = 3 * 60;

const RedemptionModal: React.FC<RedemptionModalProps> = ({ coupon, redemptionCode, usageId, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(REDEMPTION_DURATION_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  // Function to handle invalidation (time ran out or user closed/left)
  const handleInvalidation = useCallback(() => {
    // We don't delete the usage record, we just mark it as expired client-side
    // The admin validation page will check if the code is still valid (based on redeemed_at time)
    setIsExpired(true);
    onClose();
    showError('A beváltási kód érvényessége lejárt vagy megszakadt.');
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setTimeLeft(REDEMPTION_DURATION_SECONDS);
      setIsExpired(false);
      return;
    }

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleInvalidation(); // Auto-invalidate
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Handle window/tab closing or navigation away (simulating loss of validity)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // If the user switches tabs or minimizes the app, invalidate the code
        clearInterval(timer);
        handleInvalidation();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, handleInvalidation]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // The short code is the unique visual element
  const uniqueCodeDisplay = redemptionCode;

  return (
    <Dialog open={isOpen && !isExpired} onOpenChange={(open) => {
      if (!open) handleInvalidation();
    }}>
      <DialogContent className="bg-black/90 border-green-500/50 backdrop-blur-xl max-w-lg p-8 text-center">
        <DialogHeader>
          <DialogTitle className="text-3xl text-green-400 flex items-center justify-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Beváltási Kód ÉLŐ
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            Mutasd fel ezt a képernyőt a személyzetnek. A kód 3 percig érvényes.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 p-6 bg-green-900/30 border-2 border-green-500/50 rounded-xl shadow-2xl">
          <p className="text-xl font-semibold text-white mb-2">{coupon.title}</p>
          
          {/* Animated, unique code display */}
          <div className="text-6xl md:text-7xl font-mono font-extrabold text-green-300 tracking-widest p-4 rounded-lg bg-green-900/50 border border-green-500/30 animate-pulse-slow">
            {uniqueCodeDisplay}
          </div>
          
          <p className="text-sm text-gray-400 mt-2">Beváltási azonosító: {usageId.slice(0, 8)}...</p>
        </div>

        <div className="flex items-center justify-center text-2xl font-bold text-red-400 mb-4">
          <Clock className="h-6 w-6 mr-2 animate-spin-slow" />
          Érvényesség: {timeDisplay}
        </div>

        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-300 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-left">
            FIGYELEM! Ha kilépsz az alkalmazásból, vagy lejár az idő, a kód érvénytelenné válik, és nem váltható be újra!
          </p>
        </div>

        <Button 
          onClick={handleInvalidation}
          variant="destructive"
          className="w-full mt-4"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Mégsem / Érvénytelenítés
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionModal;