import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, centerCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, XCircle, Image } from 'lucide-react';
import { uploadCroppedImage, deleteImageByUrl } from '@/utils/supabase-storage';
import { showError, showSuccess } from '@/utils/toast';

interface ImageCropperProps {
  aspectRatio: number; // e.g., 2 / 1 for coupon card ratio
  onUploadSuccess: (url: string) => void;
  initialImageUrl: string | null;
  onDelete: () => void;
}

// Target dimensions for optimization (e.g., 800x400 for a 2:1 ratio)
const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 400;

const ImageCropper: React.FC<ImageCropperProps> = ({ aspectRatio, onUploadSuccess, initialImageUrl, onDelete }) => {
  const [upImg, setUpImg] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialImageUrl);

  useEffect(() => {
    setUploadedUrl(initialImageUrl);
  }, [initialImageUrl]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCrop(undefined); // Reset crop state
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    
    const crop = centerCrop(
      {
        unit: '%',
        width: 90,
      },
      width,
      height,
      aspectRatio
    );
    
    setCrop(crop);
    setCompletedCrop(undefined);
  }, [aspectRatio]);

  const handleUpload = async () => {
    if (!completedCrop || !file || !imgRef.current) {
      showError('Kérjük, válassz ki egy képet és jelöld ki a vágási területet.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Delete old image if exists
      if (uploadedUrl) {
        await deleteImageByUrl(uploadedUrl);
      }
      
      // 2. Upload new cropped and resized image
      const url = await uploadCroppedImage(
        file,
        completedCrop,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      setUploadedUrl(url);
      onUploadSuccess(url);
      setUpImg(null); // Clear the cropper view
      setFile(null);
      showSuccess('Kép sikeresen feltöltve és optimalizálva!');
    } catch (error) {
      showError('Hiba történt a kép feltöltésekor.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemove = async () => {
    if (uploadedUrl) {
        setIsUploading(true);
        await deleteImageByUrl(uploadedUrl);
        setIsUploading(false);
    }
    setUploadedUrl(null);
    setUpImg(null);
    setFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    onDelete();
    showSuccess('Kép eltávolítva.');
  };

  // --- Display Logic ---
  
  if (uploadedUrl && !upImg) {
    return (
      <div className="space-y-4">
        <Label className="text-gray-300 flex items-center">
            <Image className="h-4 w-4 mr-2" /> Jelenlegi kép
        </Label>
        <div className="relative w-full rounded-lg overflow-hidden border border-cyan-500/30">
          <img 
            src={uploadedUrl} 
            alt="Uploaded Coupon" 
            className="w-full object-cover"
            style={{ aspectRatio: aspectRatio }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Button 
                onClick={handleRemove} 
                variant="destructive" 
                size="lg"
                disabled={isUploading}
            >
                {isUploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <XCircle className="h-5 w-5 mr-2" />}
                Eltávolítás
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="image_upload" className="text-gray-300 flex items-center">
        <Upload className="h-4 w-4 mr-2" /> Kupon Kép Feltöltése (2:1 arány)
      </Label>
      
      <Input 
        id="image_upload"
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
        disabled={isUploading}
      />

      {upImg && (
        <div className="mt-4 p-4 border border-purple-500/30 rounded-lg bg-black/30">
          <h4 className="text-lg font-semibold text-purple-300 mb-3">Kép vágása (2:1 arány)</h4>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={100}
              minHeight={50}
              ruleOfThirds
            >
              <img 
                ref={imgRef} 
                alt="Crop me" 
                src={upImg} 
                onLoad={onImageLoad} 
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
          
          <Button 
            onClick={handleUpload}
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
            disabled={isUploading || !completedCrop || completedCrop.width === 0}
          >
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Feltöltés és Vágás
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;