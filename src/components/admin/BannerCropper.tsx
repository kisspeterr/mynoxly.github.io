import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Crop, ZoomIn, ZoomOut, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface BannerCropperProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onClose: () => void;
}

// Max output size: 300 KB
const MAX_OUTPUT_SIZE_BYTES = 300 * 1024; 
const TARGET_WIDTH = 800; // Target resolution width for the final image (16:9 ratio)
const TARGET_HEIGHT = 450; // Target resolution height

/**
 * Helper function to generate the cropped and compressed image file.
 * @param imageSrc - The URL of the input image.
 * @param pixelCrop - The pixel coordinates of the crop area.
 * @returns The cropped and compressed File object.
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

      // Set canvas size to the target resolution (800x450)
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Draw the cropped image onto the canvas, scaling it to the target size
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // Function to attempt compression until size limit is met or quality is too low
      const compressAndResolve = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Failed to create blob from canvas.'));
          }
          
          if (blob.size <= MAX_OUTPUT_SIZE_BYTES || quality <= 0.1) {
            // Success or reached minimum quality
            const croppedFile = new File([blob], 'banner.jpg', { type: 'image/jpeg' });
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


const BannerCropper: React.FC<BannerCropperProps> = ({ imageSrc, onCropComplete, onClose }) => {
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
      <DialogContent className="bg-black/90 border-purple-500/30 backdrop-blur-sm max-w-3xl p-6 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-300 flex items-center gap-2">
            <Crop className="h-6 w-6" /> Banner Kivágása (16:9)
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9} // 16:9 aspect ratio for banner
            cropShape="rect" // Rectangular crop shape
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            showGrid={true}
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

export default BannerCropper;