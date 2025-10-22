import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Coupon } from '@/types/coupons';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface RedemptionModalProps {
  coupon: Coupon;
  redemptionCode: string;
  usageId: string;
  isOpen: boolean;
  onClose: (wasRedeemed?: boolean) => void;
}

const REDEMPTION_DURATION_SECONDS = 3 * 60;

const RedemptionModal: React.FC<RedemptionModalProps> = ({ coupon, redemptionCode, usageId, isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(REDEMPTION_DURATION_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const handleExpiration = useCallback(() => {
    setIsExpired(true);
    showError('A beváltási kód érvényessége lejárt.');
    onClose(false);
  }, [onClose]);

  // Realtime Subscription Effect
  useEffect(() => {
    if (!isOpen || !usageId) {
      return;
    }

    // Reset state on open
    setIsRedeemed(false);
    setIsExpired(false);
    setTimeLeft(REDEMPTION_DURATION_SECONDS);

    const channel = supabase.channel(`coupon_usage_${usageId}`);

    const handleUpdate = (payload: any) => {
      const updatedUsage = payload.new as { is_used: boolean };
      // Check if the update marks the coupon as used and we haven't already processed it
      if (updatedUsage.is_used === true && !isRedeemed) {
        setIsRedeemed(true);
        showSuccess(`Sikeres beváltás! Kupon: ${coupon.title}`);
        
        // Close the modal after a short delay to show the success message
        setTimeout(() => {
          onClose(true);
        }, 2000);
      }
    };

    channel
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'coupon_usages',
          filter: `id=eq.${usageId}`
        },
        handleUpdate
      )
      .subscribe();

    // Cleanup function to remove the channel subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, usageId, coupon.title, onClose]); // Rerunning the effect when these change

  // Countdown Timer Effect
  useEffect(() => {
    if (!isOpen || isRedeemed || isExpired) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleExpiration();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, isRedeemed, isExpired, handleExpiration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose(isRedeemed);
    }}>
      <DialogContent className="bg-black/90 border-green-500/50 backdrop-blur-xl max-w-lg p-8 text-center">
        <DialogHeader>
          <DialogTitle className={`text-3xl flex items-center justify-center gap-2 transition-colors duration-500 ${isRedeemed ? 'text-green-300' : 'text-green-400'}`}>
            {isRedeemed ? (
              <>
                <CheckCircle className="h-8 w-8 animate-bounce" />
                Beváltás Sikeres!
              </>
            ) : (
              <>
                <CheckCircle className="h-8 w-8" />
                Beváltási Kód ÉLŐ
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            {isRedeemed ? 'Köszönjük! Élvezd a kedvezményt.' : 'Mutasd fel ezt a képernyőt a személyzetnek. A kód 3 percig érvényes.'}
          </DialogDescription>
        </DialogHeader>

        <div className={`my-6 p-6 border-2 rounded-xl shadow-2xl transition-all duration-500 ${
          isRedeemed 
            ? 'bg-green-900/50 border-green-500/80' 
            : 'bg-green-900/30 border-green-500/50'
        }`}>
          <p className="text-xl font-semibold text-white mb-2">{coupon.title}</p>
          
          <div className={`text-6xl md:text-7xl font-mono font-extrabold p-4 rounded-lg border transition-all duration-500 ${
            isRedeemed 
              ? 'text-green-100 bg-green-700/50 border-green-300/50' 
              : 'text-green-300 bg-green-900/50 border-green-500/30 animate-pulse-slow'
          }`}>
            {redemptionCode}
          </div>
          
          <p className="text-sm text-gray-400 mt-2">Beváltási azonosító: {usageId.slice(0, 8)}...</p>
        </div>

        {!isRedeemed && !isExpired && (
          <>
            <div className="flex items-center justify-center text-2xl font-bold text-red-400 mb-4">
              <Clock className="h-6 w-6 mr-2 animate-spin-slow" />
              Érvényesség: {timeDisplay}
            </div>

            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-300 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-left">
                FIGYELEM! A kód 3 percig érvényes. Ha lejár, a személyzet nem tudja beváltani.
              </p>
            </div>
          </>
        )}
        
        {isRedeemed ? (
          <Button 
            variant="default"
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
            disabled
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Beváltva!
          </Button>
        ) : (
          <Button 
            onClick={() => onClose(false)}
            variant="destructive"
            className="w-full mt-4"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Bezárás
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionModal;