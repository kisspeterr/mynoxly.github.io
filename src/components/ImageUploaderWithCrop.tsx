import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, centerCrop, make  Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Crop as CropIcon } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Helper function to convert canvas to blob (required for file upload)
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

// Helper function to get the cropped image data URL
function getCroppedImage(image: HTMLImageElement, crop: PixelCrop, scaleX: number, scaleY: number): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to the cropped area dimensions
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  // Convert canvas to Blob (JPEG for better compression)
  // We target a max width of 800px for optimization
  const targetWidth = 800;
  const ratio = targetWidth / crop.width;
  
  if (crop.width > targetWidth) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('No temp context');
      
      tempCanvas.width = targetWidth;
      tempCanvas.height = crop.height * ratio;
      
      tempCtx.drawImage(canvas, 0, 0, targetWidth, tempCanvas.height);
      
      return canvasToBlob(tempCanvas, 'image/jpeg', 0.8); // Quality 80%
  }

  return canvasToBlob(canvas, 'image/jpeg', 0.8); // Quality 80%
}

interface ImageUploaderWithCropProps {
  onUploadSuccess: (url: string) => void;
  initialUrl?: string | null;
  aspectRatio: number; // e.g., 16 / 9
}

const ImageUploaderWithCrop: React.FC<ImageUploaderWithCropProps> = ({ onUploadSuccess, initialUrl, aspectRatio }) => {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(initialUrl);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when initialUrl changes (e.g., when editing a different coupon)
  useEffect(() => {
    setSrc(initialUrl);
    setFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [initialUrl]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCrop(undefined); // Clear crop state
      setCompletedCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Center the crop area based on the aspect ratio
    const initialCrop = centerCrop(
      makeCrop(width, height, aspectRatio),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, [aspectRatio]);

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current || !file) {
      showError('Kérjük, válassz ki egy képet és jelöld ki a kivágási területet.');
      return;
    }

    setIsLoading(true);
    try {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 1. Get the cropped and optimized Blob
      const croppedBlob = await getCroppedImage(image, completedCrop, scaleX, scaleY);

      if (!croppedBlob) {
        showError('Hiba történt a kép feldolgozása során.');
        return;
      }

      // 2. Upload to Supabase Storage
      const fileExt = 'jpg'; // We force JPEG for optimization
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('coupons')
        .upload(filePath, croppedBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        showError(`Feltöltési hiba: ${uploadError.message}`);
        return;
      }

      // 3. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('coupons')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        showError('Hiba történt a nyilvános URL generálása során.');
        return;
      }

      onUploadSuccess(publicUrlData.publicUrl);
      showSuccess('Kép sikeresen feltöltve és kivágva!');
      setSrc(publicUrlData.publicUrl); // Update preview to the final URL
      setFile(null); // Clear file input
      setCrop(undefined);
      setCompletedCrop(undefined);

    } catch (e) {
      console.error('Upload error:', e);
      showError('Váratlan hiba történt a feltöltés során.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemove = () => {
    setSrc(null);
    setFile(null);
    onUploadSuccess(''); // Clear URL in parent form
  };

  return (
    <div className="space-y-4">
      <Label className="text-gray-300 flex items-center">
        <Upload className="h-4 w-4 mr-2" /> Kupon Kép Feltöltése (16:9 arány)
      </Label>
      
      {/* Current Image Preview / Upload Input */}
      {!src && (
        <Input 
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
          disabled={isLoading}
        />
      )}
      
      {/* Image Cropper / Preview */}
      {src && (
        <div className="relative p-4 border border-cyan-500/30 rounded-lg bg-gray-900/50">
          {file ? (
            // Cropping View
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={100}
              minHeight={100 / aspectRatio}
              className="max-h-[400px]"
            >
              <img 
                ref={imgRef} 
                alt="Crop me" 
                src={src} 
                onLoad={onImageLoad}
                className="max-w-full h-auto block"
              />
            </ReactCrop>
          ) : (
            // Final Preview
            <div className="relative">
                <img src={src} alt="Current Coupon Image" className="w-full h-40 object-cover rounded-lg" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleRemove}
                    className="absolute top-2 right-2 h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {file && !isLoading && (
        <div className="flex space-x-4">
          <Button 
            onClick={handleUpload}
            className="flex-grow bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
            disabled={!completedCrop || isLoading}
          >
            <CropIcon className="h-4 w-4 mr-2" />
            Kivágás és Feltöltés
          </Button>
          <Button 
            onClick={() => { setFile(null); setSrc(initialUrl); setCrop(undefined); setCompletedCrop(undefined); }}
            variant="outline"
            className="border-gray-700 text-gray-400 hover:bg-gray-800"
          >
            Mégsem
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mr-2" />
          <span className="text-gray-400">Kép feldolgozása és feltöltése...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderWithCrop;