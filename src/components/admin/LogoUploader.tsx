import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Image, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';

interface LogoUploaderProps {
  currentLogoUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
}

// Max file size check (client-side pre-check)
const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200 KB

const LogoUploader: React.FC<LogoUploaderProps> = ({ currentLogoUrl, onUploadSuccess, onRemove }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync currentLogoUrl with previewUrl when it changes externally
  React.useEffect(() => {
    setPreviewUrl(currentLogoUrl);
  }, [currentLogoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        showError(`A fájl mérete túl nagy (max. ${MAX_FILE_SIZE_BYTES / 1024} KB).`);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
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

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    
    try {
      const base64Data = await fileToBase64(file);
      
      // 1. Get JWT token for Edge Function authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          showError('Nincs aktív munkamenet. Kérjük, jelentkezz be újra.');
          return;
      }
      
      // 2. Call the Edge Function
      const response = await fetch(
        // Hardcoded URL for the Edge Function
        `https://ubpicfenhhsonfeeehfa.supabase.co/functions/v1/process-logo-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            base64Data: base64Data,
            mimeType: file.type,
            oldLogoPath: currentLogoUrl, // Pass current URL for deletion
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showError(`Feltöltési hiba: ${result.error || 'Ismeretlen hiba történt a szerveren.'}`);
        console.error('Edge Function Error:', result.error);
        return;
      }

      // 3. Success
      onUploadSuccess(result.publicUrl);
      setFile(null); // Clear file state after successful upload
      showSuccess('Logó sikeresen feltöltve és feldolgozva!');

    } catch (e) {
      showError('Váratlan hiba történt a feltöltés során.');
      console.error('Upload error:', e);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear file input
      }
      setFile(null);
      setPreviewUrl(null);
      onRemove(); // Notify parent to clear URL
      showSuccess('Logó eltávolítva. Ne felejtsd el menteni a beállításokat!');
  };

  return (
    <div className="space-y-4">
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
          <Label htmlFor="logo-upload" className="text-gray-300">Logó feltöltése (max. 200 KB, automatikus átméretezés)</Label>
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
        {file && (
          <Button 
            onClick={handleUpload}
            className="flex-grow bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {isUploading ? 'Feltöltés...' : 'Feltöltés megerősítése'}
          </Button>
        )}
        
        {(currentLogoUrl || file) && (
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
      
      {!file && currentLogoUrl && (
          <p className="text-xs text-gray-500">Jelenlegi logó használatban. Új feltöltéshez válassz fájlt.</p>
      )}
    </div>
  );
};

export default LogoUploader;