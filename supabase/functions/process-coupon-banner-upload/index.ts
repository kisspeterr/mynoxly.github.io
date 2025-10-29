import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Max file size for the OUTPUT file (enforced client-side, but checked here for safety)
const MAX_FILE_SIZE_BYTES = 300 * 1024; // Slightly larger limit for banners (300KB)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // Kliens inicializálása a felhasználó JWT tokenjével (csak azonosításra)
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
    // Get user ID from JWT
    const { data: { user } } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response('Unauthorized: Invalid token', { status: 401, headers: corsHeaders });
    }
    const userId = user.id; // This is the user's profile ID

    const { base64Data, mimeType, oldBannerPath, couponId } = await req.json();

    if (!base64Data || !mimeType || !couponId) {
      return new Response(JSON.stringify({ error: 'Missing file data or coupon ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. BIZTONSÁGI ELLENŐRZÉS: Ellenőrizzük, hogy a felhasználó jogosult-e a kuponhoz
    // Ehhez le kell kérdezni a kupon szervezetének nevét, majd ellenőrizni a tagságot.
    const { data: couponData, error: couponError } = await serviceSupabaseClient
        .from('coupons')
        .select('organization_name')
        .eq('id', couponId)
        .single();
        
    if (couponError || !couponData) {
        return new Response(JSON.stringify({ error: 'Coupon not found or access denied.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Ellenőrizzük a tagságot (Service Role Key-vel)
    const { data: memberData } = await serviceSupabaseClient
        .from('organization_members')
        .select('roles, organization_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');
        
    const userOrganizations = memberData?.map(m => m.organization_id) || [];
    
    // Ellenőrizzük, hogy a felhasználó tagja-e a kupon szervezetének (a kupon organization_name alapján)
    const { data: orgProfile } = await serviceSupabaseClient
        .from('organizations')
        .select('id')
        .eq('organization_name', couponData.organization_name)
        .single();
        
    const organizationId = orgProfile?.id;
    
    if (!organizationId || !userOrganizations.includes(organizationId)) {
        return new Response(JSON.stringify({ error: 'Forbidden: User is not a member of the coupon\'s organization.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Ellenőrizzük, hogy van-e jogosultsága a kupon kezeléséhez
    const isManager = memberData?.some(m => m.organization_id === organizationId && (m.roles.includes('coupon_manager') || m.roles.includes('event_manager')));
    
    if (!isManager) {
        return new Response(JSON.stringify({ error: 'Forbidden: User does not have coupon management permissions.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 2. Base64 dekódolás és méret ellenőrzés
    let fileBuffer: Uint8Array;
    try {
        fileBuffer = decode(base64Data);
    } catch (e) {
        console.error('Base64 Decode Error:', e);
        return new Response(JSON.stringify({ error: 'Invalid Base64 data provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (fileBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return new Response(JSON.stringify({ error: `A feltöltött fájl mérete (${Math.ceil(fileBuffer.byteLength / 1024)} KB) meghaladja a 300 KB-os limitet.` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 3. Define new file path: organization_id/coupon_id.jpg
    const fileExt = 'jpg';
    // CRITICAL: Use organizationId (UUID) as the folder name for path security
    const filePath = `${organizationId}/${couponId}.${fileExt}`; 
    const bucketName = 'coupon_banners';

    // 4. Upload new file (SERVICE ROLE KEY-vel)
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

    // 5. Delete old file if path is provided
    if (oldBannerPath) {
        const urlParts = oldBannerPath.split('/');
        const bucketIndex = urlParts.indexOf(bucketName);
        
        if (bucketIndex !== -1) {
            const oldFilePath = urlParts.slice(bucketIndex + 1).join('/');
            
            // Double check that the path starts with the organization ID for security
            if (oldFilePath && oldFilePath.startsWith(organizationId)) {
                const { error: deleteError } = await serviceSupabaseClient.storage
                    .from(bucketName)
                    .remove([oldFilePath]);

                if (deleteError) {
                    console.warn('Warning: Failed to delete old banner:', deleteError);
                }
            }
        }
    }

    // 6. Get public URL and return
    const { data: publicUrlData } = userSupabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve public URL.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    // 7. Audit Log insertion REMOVED

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