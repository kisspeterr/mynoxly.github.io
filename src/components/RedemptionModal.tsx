import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Coupon } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface RedemptionModalProps {
  coupon: Coupon;
  redemptionCode: string; // Now using the short code
  usageId: string; // Still needed for potential cleanup/tracking
  isOpen: boolean;
  onClose: (wasRedeemed?: boolean) => void; // Updated signature
}

// 3 minutes in seconds
const REDEMPTION_DURATION_SECONDS = 3 * 60;

const RedemptionModal: React.FC<RedemptionModalProps> = ({ coupon, redemptionCode, usageId, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(REDEMPTION_DURATION_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  // Function to handle expiration (time ran out client-side)
  const handleExpiration = useCallback(() => {
    setIsExpired(true);
    // We notify the user that the client-side timer ran out, but the code might still be valid for a few seconds server-side.
    showError('A beváltási kód érvényessége lejárt a telefonodon. Kérjük, kérdezd meg a személyzetet.');
    onClose(false); // Closed due to expiration
  }, [onClose]);

  // --- Realtime Subscription Effect ---
  useEffect(() => {
    if (!isOpen || !usageId) return;

    // 1. Setup Realtime Channel
    const channel = supabase
      .channel(`coupon_usage_${usageId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'coupon_usages',
          filter: `id=eq.${usageId}`
        },
        (payload) => {
          const updatedUsage = payload.new as { is_used: boolean };
          if (updatedUsage.is_used === true) {
            // Admin finalized the redemption!
            showSuccess(`Sikeres beváltás! Kupon: ${coupon.title}`);
            onClose(true); // Close the modal and signal successful redemption
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, usageId, coupon.title, onClose]);
  // ------------------------------------


  // --- Countdown Timer Effect ---
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
          handleExpiration(); // Auto-expire client-side
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, handleExpiration]);
  // ------------------------------------

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const uniqueCodeDisplay = redemptionCode;

  return (
    <Dialog open={isOpen && !isExpired} onOpenChange={(open) => {
      if (!open) onClose(false); // Simply close the modal, not redeemed via Realtime
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
            FIGYELEM! A kód 3 percig érvényes a generálástól számítva. Ha lejár, a személyzet nem tudja beváltani.
          </p>
        </div>

        <Button 
          onClick={() => onClose(false)} // Just close the modal, not redeemed via Realtime
          variant="destructive"
          className="w-full mt-4"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Bezárás
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionModal;