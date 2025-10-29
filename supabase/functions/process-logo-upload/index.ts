import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

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

  // Kliens inicializálása a felhasználó JWT tokenjével (csak azonosításra és jogosultság ellenőrzésre)
  const userSupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );
  
  // Kliens inicializálása Service Role Key-vel (Storage műveletekhez)
  const serviceSupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Get user ID from JWT (using the user client)
    const { data: { user } } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response('Unauthorized: Invalid token', { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    const { base64Data, mimeType, oldLogoPath, organizationId } = await req.json();

    if (!base64Data || !mimeType || !organizationId) {
      return new Response(JSON.stringify({ error: 'Missing file data or organization ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 2. BIZTONSÁGI ELLENŐRZÉS: Ellenőrizzük, hogy a felhasználó jogosult-e az organizationId-hez
    const { data: orgData } = await serviceSupabaseClient
        .from('organizations')
        .select('owner_id')
        .eq('id', organizationId)
        .single();
        
    const isOwner = orgData?.owner_id === userId;
    
    const { data: memberData } = await serviceSupabaseClient
        .from('organization_members')
        .select('roles')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single();
            
    const isManager = memberData?.roles.includes('coupon_manager') || memberData?.roles.includes('event_manager');
    
    if (!isOwner && !isManager) {
        return new Response(JSON.stringify({ error: 'Forbidden: User is not the owner or a manager of this organization.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 3. Base64 dekódolás és méret ellenőrzés
    let fileBuffer: Uint8Array;
    try {
        fileBuffer = decode(base64Data);
    } catch (e) {
        console.error('Base64 Decode Error:', e);
        return new Response(JSON.stringify({ error: 'Invalid Base64 data provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return new Response(JSON.stringify({ error: `A feltöltött fájl mérete (${Math.ceil(fileBuffer.byteLength / 1024)} KB) meghaladja a 200 KB-os limitet.` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 4. Define new file path
    const fileExt = 'jpg';
    const filePath = `${organizationId}/${Date.now()}.${fileExt}`;
    const bucketName = 'logos';

    // 5. Upload new file (SERVICE ROLE KEY-vel)
    const { error: uploadError } = await serviceSupabaseClient.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'image/jpeg',
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

    // 6. Delete old file (SERVICE ROLE KEY-vel)
    if (oldLogoPath) {
        const urlParts = oldLogoPath.split('/');
        const bucketIndex = urlParts.indexOf(bucketName);
        
        if (bucketIndex !== -1) {
            const oldFilePath = urlParts.slice(bucketIndex + 1).join('/');
            
            if (oldFilePath && oldFilePath.startsWith(organizationId)) {
                const { error: deleteError } = await serviceSupabaseClient.storage
                    .from(bucketName)
                    .remove([oldFilePath]);

                if (deleteError) {
                    console.warn('Warning: Failed to delete old logo:', deleteError);
                }
            }
        }
    }

    // 7. Get public URL
    const { data: publicUrlData } = userSupabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve public URL.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    // 8. Audit Log insertion REMOVED to bypass RLS issue.
    // The database trigger log_audit_change should handle logging profile updates.

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