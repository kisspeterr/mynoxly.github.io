import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

/**
 * Uploads a cropped and resized image to Supabase Storage.
 * @param file The original image file.
 * @param cropData The crop coordinates and dimensions.
 * @param targetWidth The desired final width (e.g., 800px).
 * @param targetHeight The desired final height (e.g., 400px).
 * @returns The public URL of the uploaded image.
 */
export const uploadCroppedImage = async (
  file: File,
  cropData: { x: number, y: number, width: number, height: number },
  targetWidth: number,
  targetHeight: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scaleX = img.naturalWidth / 100;
        const scaleY = img.naturalHeight / 100;

        // Calculate actual pixel values for cropping
        const cropX = cropData.x * scaleX;
        const cropY = cropData.y * scaleY;
        const cropWidth = cropData.width * scaleX;
        const cropHeight = cropData.height * scaleY;

        // Set canvas size to target size for resizing
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Canvas context not available.'));
        }

        // Draw the cropped area onto the resized canvas
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Convert canvas to Blob (JPEG format for optimization)
        canvas.toBlob(async (blob) => {
          if (!blob) {
            return reject(new Error('Failed to create image blob.'));
          }

          const fileExt = 'jpeg';
          const fileName = `${nanoid()}.${fileExt}`;
          const filePath = `coupons/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('coupons')
            .upload(filePath, blob, {
              cacheControl: '3600',
              upsert: false,
              contentType: `image/${fileExt}`,
            });

          if (error) {
            return reject(error);
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('coupons')
            .getPublicUrl(filePath);

          resolve(publicUrlData.publicUrl);

        }, 'image/jpeg', 0.85); // Quality 0.85

      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Deletes an image from Supabase Storage using its public URL.
 * @param publicUrl The public URL of the image.
 */
export const deleteImageByUrl = async (publicUrl: string): Promise<void> => {
  if (!publicUrl) return;

  try {
    // Extract the path from the URL (e.g., 'coupons/filename.jpeg')
    const urlParts = publicUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'coupons');
    
    if (bucketIndex === -1 || bucketIndex + 1 >= urlParts.length) {
        console.warn('Could not parse storage path from URL:', publicUrl);
        return;
    }
    
    // The path is everything after the bucket name
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('coupons')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image from storage:', error);
    }
  } catch (e) {
    console.error('Unexpected error during image deletion:', e);
  }
};