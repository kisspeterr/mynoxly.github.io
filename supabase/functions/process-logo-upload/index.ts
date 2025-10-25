import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size for the OUTPUT file (enforced client-side, but checked here for safety)
const MAX_FILE_SIZE_BYTES = 200 * 1024; 

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
      return new Response(JSON.stringify({ error: 'Missing file data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let fileBuffer: Uint8Array;
    try {
        fileBuffer = decode(base64Data);
    } catch (e) {
        console.error('Base64 Decode Error:', e);
        return new Response(JSON.stringify({ error: 'Invalid Base64 data provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 1. Final size check (should be under 200KB due to client-side processing)
    if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return new Response(JSON.stringify({ error: `A feltöltött fájl mérete (${Math.ceil(fileBuffer.byteLength / 1024)} KB) meghaladja a 200 KB-os limitet a kliens oldali feldolgozás után is.` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 2. Define new file path (using JPG extension as client-side cropper outputs JPEG)
    const fileExt = 'jpg';
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    const bucketName = 'logos';

    // 3. Upload new file
    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'image/jpeg', // Assuming client-side cropper outputs JPEG
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

    // 4. Delete old file if path is provided
    if (oldLogoPath) {
        // Extract the path within the bucket (e.g., 'user_id/timestamp.jpg')
        const urlParts = oldLogoPath.split('/');
        const bucketIndex = urlParts.indexOf(bucketName);
        
        // Ensure we found the bucket name in the URL path before slicing
        if (bucketIndex !== -1) {
            const oldFilePath = urlParts.slice(bucketIndex + 1).join('/');
            
            // Double check that the path starts with the user ID for security
            if (oldFilePath && oldFilePath.startsWith(userId)) {
                const { error: deleteError } = await supabaseClient.storage
                    .from(bucketName)
                    .remove([oldFilePath]);

                if (deleteError) {
                    console.warn('Warning: Failed to delete old logo:', deleteError);
                }
            }
        }
    }

    // 5. Get public URL and return
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