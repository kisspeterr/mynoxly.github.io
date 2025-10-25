import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Crop, ZoomIn, ZoomOut, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onClose: () => void;
}

// Max output size: 200 KB
const MAX_OUTPUT_SIZE_BYTES = 200 * 1024; 
const TARGET_SIZE = 300; // Target resolution for the final image

/**
 * Segédfüggvény a kivágott kép generálásához és tömörítéséhez.
 * @param imageSrc - A bemeneti kép URL-je.
 * @param pixelCrop - A kivágási terület pixel koordinátái.
 * @returns A kivágott és tömörített File objektum.
 */
const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Canvas context not available'));
      }

      // Set canvas size to the target resolution (300x300)
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      // Calculate scaling factor to fit the cropped area into the target canvas size
      const scaleX = TARGET_SIZE / pixelCrop.width;
      const scaleY = TARGET_SIZE / pixelCrop.height;
      
      // Draw the cropped image onto the canvas, scaling it to 300x300
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE
      );

      // Function to attempt compression until size limit is met or quality is too low
      const compressAndResolve = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Failed to create blob from canvas.'));
          }
          
          if (blob.size <= MAX_OUTPUT_SIZE_BYTES || quality <= 0.1) {
            // Success or reached minimum quality
            const croppedFile = new File([blob], 'logo.jpg', { type: 'image/jpeg' });
            resolve(croppedFile);
          } else {
            // Try lower quality
            const newQuality = quality - 0.1;
            compressAndResolve(newQuality);
          }
        }, 'image/jpeg', quality);
      };
      
      // Start compression attempt (starting at 0.9 quality)
      compressAndResolve(0.9);
    };
    image.onerror = (error) => reject(error);
    image.src = imageSrc;
  });
};


const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((newCrop: { x: number, y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFinalCrop = async () => {
    if (!croppedAreaPixels) {
      showError('Kérjük, válassz ki egy területet a kivágáshoz.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (croppedFile.size > MAX_OUTPUT_SIZE_BYTES) {
          // This should be caught by the compression loop, but as a final check:
          showError(`A kivágott kép mérete még mindig túl nagy (${Math.ceil(croppedFile.size / 1024)} KB). Kérjük, próbálj meg kisebb területet kivágni.`);
          return;
      }
      
      onCropComplete(croppedFile);
      onClose();
      
    } catch (e) {
      showError('Hiba történt a kép feldolgozása során.');
      console.error('Cropping error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/90 border-purple-500/30 backdrop-blur-sm max-w-xl p-6 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-300 flex items-center gap-2">
            <Crop className="h-6 w-6" /> Logó Kivágása
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio for logo
            cropShape="round" // Circular crop shape
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            showGrid={false}
            classes={{
                containerClassName: 'bg-gray-900',
                mediaClassName: 'opacity-80',
            }}
          />
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-4 mt-4">
          <ZoomOut className="h-5 w-5 text-gray-400" />
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            className="flex-grow"
          />
          <ZoomIn className="h-5 w-5 text-gray-400" />
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-2 sm:space-y-0">
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" /> Mégsem
          </Button>
          <Button 
            onClick={handleFinalCrop}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Feldolgozás...
                </>
            ) : (
                <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Kivágás és Feltöltés
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;