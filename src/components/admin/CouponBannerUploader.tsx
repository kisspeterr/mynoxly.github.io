import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image, XCircle, Crop, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import BannerCropper from './BannerCropper'; // Import the new cropper

interface CouponBannerUploaderProps {
  couponId: string; // Required to generate unique path
  currentImageUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
}

// Max input file size: 5 MB
const MAX_INPUT_FILE_SIZE_BYTES = 5 * 1024 * 1024; 

const CouponBannerUploader: React.FC<CouponBannerUploaderProps> = ({ couponId, currentImageUrl, onUploadSuccess, onRemove }) => {
  const { user, activeOrganizationId } = useAuth();
  const [file, setFile] = useState<File | null>(null); // The file selected by the user (up to 5MB)
  const [croppedFile, setCroppedFile] = useState<File | null>(null); // The final, compressed file (max 300KB)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync currentImageUrl with previewUrl when it changes externally
  React.useEffect(() => {
    if (currentImageUrl) {
        setPreviewUrl(currentImageUrl);
    } else if (currentImageUrl === null) {
        setPreviewUrl(null);
    }
  }, [currentImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_INPUT_FILE_SIZE_BYTES) {
        showError(`A fájl mérete túl nagy (max. ${MAX_INPUT_FILE_SIZE_BYTES / 1024 / 1024} MB).`);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null);
        return;
      }
      
      // Set the file and open the cropper
      setFile(selectedFile);
      setIsCropperOpen(true);
    }
  };
  
  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleCropComplete = (file: File) => {
      setCroppedFile(file);
      // Update preview to the cropped image URL
      setPreviewUrl(URL.createObjectURL(file));
      // Clear the original file input value
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const handleUpload = async () => {
    if (!croppedFile || !user || !couponId || !activeOrganizationId) {
        showError('Hiányzó szervezet azonosító. Kérjük, válassz aktív szervezetet.');
        return;
    }

    setIsUploading(true);
    
    try {
      const base64Data = await fileToBase64(croppedFile);
      
      // 1. Get JWT token for Edge Function authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          showError('Nincs aktív munkamenet. Kérjük, jelentkezz be újra.');
          setIsUploading(false);
          return;
      }
      
      // 2. Call the Edge Function
      const edgeFunctionUrl = `https://ubpicfenhhsonfeeehfa.supabase.co/functions/v1/process-coupon-banner-upload`;
      
      const response = await fetch(
        edgeFunctionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            base64Data: base64Data,
            mimeType: croppedFile.type,
            oldBannerPath: currentImageUrl, // Pass current URL for deletion
            couponId: couponId, // Pass coupon ID for unique path generation
            organizationId: activeOrganizationId, // PASS ORGANIZATION ID
          }),
        }
      );

      // 3. Check response status
      if (!response.ok) {
        let errorDetail = `Szerverhiba (${response.status}).`;
        try {
            const errorBody = await response.json();
            errorDetail = errorBody.error || errorDetail;
        } catch (e) {
            errorDetail = await response.text() || errorDetail;
        }
        
        showError(`Feltöltési hiba: ${errorDetail}`);
        console.error('Edge Function Error:', errorDetail);
        return;
      }

      // 4. Success
      const result = await response.json();
      onUploadSuccess(result.publicUrl);
      setFile(null); // Clear original file state
      setCroppedFile(null); // Clear cropped file state
      showSuccess('Banner sikeresen feltöltve és feldolgozva!');

    } catch (e) {
      showError('Váratlan hiba történt a feltöltés során. Kérjük, ellenőrizd a konzolt a részletekért.');
      console.error('Unexpected upload error:', e);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveClick = async () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear file input
      }
      
      // If there is a current URL, attempt to delete it from storage
      if (currentImageUrl && user) {
          setIsUploading(true);
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                  showError('Nincs aktív munkamenet a törléshez.');
                  return;
              }
              
              const edgeFunctionUrl = `https://ubpicfenhhsonfeeehfa.supabase.co/functions/v1/delete-storage-file`;
              
              const response = await fetch(
                edgeFunctionUrl,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    publicUrl: currentImageUrl,
                  }),
                }
              );
              
              if (!response.ok) {
                  const errorBody = await response.json();
                  showError(`Törlési hiba: ${errorBody.error || 'Ismeretlen hiba'}`);
                  console.error('Delete Edge Function Error:', errorBody);
                  return;
              }
              
              showSuccess('Banner sikeresen törölve a tárhelyről.');
              
          } catch (e) {
              showError('Váratlan hiba történt a törlés során.');
              console.error('Unexpected delete error:', e);
              return;
          } finally {
              setIsUploading(false);
          }
      }
      
      setFile(null);
      setCroppedFile(null);
      setPreviewUrl(null);
      onRemove(); // Notify parent to clear URL
      showSuccess('Banner eltávolítva. Ne felejtsd el menteni a beállításokat!');
  };

  return (
    <div className="space-y-4">
      {/* Cropper Modal */}
      {isCropperOpen && file && (
        <BannerCropper
          imageSrc={URL.createObjectURL(file)}
          onCropComplete={handleCropComplete}
          onClose={() => setIsCropperOpen(false)}
        />
      )}
      
      <div className="space-y-2">
        <Label htmlFor="banner-upload" className="text-gray-300 flex items-center">
            <Gift className="h-4 w-4 mr-2 text-cyan-400" />
            Kupon Banner Feltöltése (16:9 arány, max. 300 KB kimenet)
        </Label>
        
        {/* Preview Area */}
        <div className="relative w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-cyan-500/50 overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Banner Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="h-10 w-10 text-gray-500" />
            )}
        </div>
        
        {/* File Input */}
        <Input 
          id="banner-upload"
          type="file" 
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="bg-gray-800/50 border-gray-700 text-white file:text-purple-400 file:bg-gray-700/50 file:border-0 file:rounded-md"
          disabled={isUploading}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-4 pt-2">
        {croppedFile ? (
          <Button 
            onClick={handleUpload}
            className="flex-grow bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {isUploading ? 'Feltöltés...' : 'Kivágott banner feltöltése'}
          </Button>
        ) : (
            <Button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-grow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={isUploading}
            >
                <Crop className="h-4 w-4 mr-2" />
                Kép kivágása
            </Button>
        )}
        
        {(currentImageUrl || file || croppedFile) && (
            <Button 
              onClick={handleRemoveClick}
              variant="destructive"
              className="w-1/3"
              disabled={isUploading}
            >
              <XCircle className="h-4 w-4" />
            </Button>
        )}
      </div>
      
      {!file && !croppedFile && currentImageUrl && (
          <p className="text-xs text-gray-500">Jelenlegi banner használatban. Új feltöltéshez válassz fájlt.</p>
      )}
      {croppedFile && (
          <p className="text-xs text-green-400">Kivágott kép készen áll a feltöltésre. Méret: {Math.ceil(croppedFile.size / 1024)} KB.</p>
      )}
    </div>
  );
};

export default CouponBannerUploader;