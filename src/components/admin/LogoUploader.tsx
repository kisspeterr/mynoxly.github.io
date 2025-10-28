import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image, XCircle, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import ImageCropper from './ImageCropper'; // Import the new cropper

interface LogoUploaderProps {
  currentLogoUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
}

// Max input file size: 2 MB
const MAX_INPUT_FILE_SIZE_BYTES = 2 * 1024 * 1024; 

// Max output size: 200 KB (This is enforced by the Cropper/Edge Function)

const LogoUploader: React.FC<LogoUploaderProps> = ({ currentLogoUrl, onUploadSuccess, onRemove }) => {
  const { user, activeOrganizationId } = useAuth();
  const [file, setFile] = useState<File | null>(null); // The file selected by the user (up to 2MB)
  const [croppedFile, setCroppedFile] = useState<File | null>(null); // The final, compressed file (max 200KB)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync currentLogoUrl with previewUrl when it changes externally
  React.useEffect(() => {
    if (currentLogoUrl) {
        setPreviewUrl(currentLogoUrl);
    } else if (currentLogoUrl === null) {
        setPreviewUrl(null);
    }
  }, [currentLogoUrl]);

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
    if (!croppedFile || !user || !activeOrganizationId) {
        showError('Hiányzó adatok a feltöltéshez.');
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
      const edgeFunctionUrl = `https://ubpicfenhhsonfeeehfa.supabase.co/functions/v1/process-logo-upload`;
      
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
            oldLogoPath: currentLogoUrl, // Pass current URL for deletion
            organizationId: activeOrganizationId, // Pass organization ID for path
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
            // If response body is not JSON (e.g., plain text or empty)
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
      showSuccess('Logó sikeresen feltöltve és feldolgozva!');

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
      if (currentLogoUrl && user) {
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
                    publicUrl: currentLogoUrl,
                  }),
                }
              );
              
              if (!response.ok) {
                  const errorBody = await response.json();
                  showError(`Törlési hiba: ${errorBody.error || 'Ismeretlen hiba'}`);
                  console.error('Delete Edge Function Error:', errorBody);
                  return;
              }
              
              showSuccess('Logó sikeresen törölve a tárhelyről.');
              
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
      onRemove(); // Notify parent to clear URL in form state
      showSuccess('Logó eltávolítva. Ne felejtsd el menteni a beállításokat!');
  };

  return (
    <div className="space-y-4">
      {/* Cropper Modal */}
      {isCropperOpen && file && (
        <ImageCropper
          imageSrc={URL.createObjectURL(file)}
          onCropComplete={handleCropComplete}
          onClose={() => setIsCropperOpen(false)}
        />
      )}
      
      <div className="flex items-center space-x-4">
        {/* Preview Area (Simulated Cropping/Overlay) */}
        <div className="relative h-24 w-24 flex-shrink-0">
          <div className="h-full w-full rounded-full bg-gray-800 flex items-center justify-center border-2 border-purple-500/50 overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Logo Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="h-10 w-10 text-gray-500" />
            )}
          </div>
          {/* Simulated Overlay (Visual feedback for circular crop) */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 pointer-events-none"></div>
        </div>

        {/* File Input and Upload Button */}
        <div className="flex-grow space-y-2">
          <Label htmlFor="logo-upload" className="text-gray-300">Logó feltöltése (max. 2 MB bemenet, 200 KB kimenet)</Label>
          <Input 
            id="logo-upload"
            type="file" 
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="bg-gray-800/50 border-gray-700 text-white file:text-cyan-400 file:bg-gray-700/50 file:border-0 file:rounded-md"
            disabled={isUploading}
          />
        </div>
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
            {isUploading ? 'Feltöltés...' : 'Kivágott logó feltöltése'}
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
        
        {(currentLogoUrl || file || croppedFile) && (
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
      
      {!file && !croppedFile && currentLogoUrl && (
          <p className="text-xs text-gray-500">Jelenlegi logó használatban. Új feltöltéshez válassz fájlt.</p>
      )}
      {croppedFile && (
          <p className="text-xs text-green-400">Kivágott kép készen áll a feltöltésre. Méret: {Math.ceil(croppedFile.size / 1024)} KB.</p>
      )}
    </div>
  );
};

export default LogoUploader;