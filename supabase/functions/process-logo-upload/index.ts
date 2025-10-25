import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { Image } from "https://deno.land/x/images@v1.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size for the OUTPUT file
const MAX_FILE_SIZE_BYTES = 200 * 1024; 
const TARGET_SIZE = 300; // 300x300 px

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user ID from JWT
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response('Unauthorized: Invalid token', { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    const { base64Data, mimeType, oldLogoPath } = await req.json();

    if (!base64Data || !mimeType) {
      return new Response('Missing file data', { status: 400, headers: corsHeaders });
    }

    const fileBuffer = decode(base64Data);

    // 1. Process and Resize Image (This is the automatic size reduction step)
    const image = new Image();
    image.load(fileBuffer);
    
    // Resize to 300x300
    image.resize(TARGET_SIZE, TARGET_SIZE);
    
    // Encode as JPEG with 80% quality
    const processedBuffer = image.encode(Image.Format.Jpeg, 80);
    const newMimeType = 'image/jpeg';
    const fileExt = 'jpg';

    // 2. Check output size after processing
    if (processedBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
        // This is highly unlikely after resizing to 300x300, but serves as a final safety check.
        return new Response(JSON.stringify({ error: `Feldolgozás után is túl nagy a fájl mérete (${Math.ceil(processedBuffer.byteLength / 1024)} KB). Kérjük, próbálj meg kisebb felbontású képet feltölteni.` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 3. Define new file path
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    const bucketName = 'logos';

    // 4. Upload new file
    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, processedBuffer, {
        contentType: newMimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: `Upload failed: ${uploadError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Delete old file if path is provided
    if (oldLogoPath) {
        // Extract the path within the bucket (e.g., 'user_id/timestamp.jpg')
        const urlParts = oldLogoPath.split('/');
        const oldFilePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
        
        if (oldFilePath && oldFilePath.startsWith(userId)) {
            const { error: deleteError } = await supabaseClient.storage
                .from(bucketName)
                .remove([oldFilePath]);

            if (deleteError) {
                console.warn('Warning: Failed to delete old logo:', deleteError);
            }
        }
    }

    // 6. Get public URL and return
    const { data: publicUrlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve public URL.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ publicUrl: publicUrlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});