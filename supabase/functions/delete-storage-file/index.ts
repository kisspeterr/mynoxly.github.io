import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { publicUrl } = await req.json();

    if (!publicUrl) {
      return new Response(JSON.stringify({ error: 'Missing publicUrl' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 1. Extract bucket name and file path from the public URL
    // Expected format: https://[project_id].supabase.co/storage/v1/object/public/[bucket_name]/[organization_id]/[file_name]
    const urlParts = publicUrl.split('/');
    const bucketIndex = urlParts.indexOf('public') + 1;
    
    if (bucketIndex === 0 || bucketIndex >= urlParts.length) {
        return new Response(JSON.stringify({ error: 'Invalid public URL format.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const bucketName = urlParts[bucketIndex];
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    // The first segment of the file path is the organization ID (or user ID for old logos)
    const pathSegments = filePath.split('/');
    const organizationId = pathSegments[0];
    
    // 2. Security Check: Ensure the user has permission to delete this file.
    // We check if the user is the owner of the organization associated with the path.
    
    const { data: orgData, error: orgError } = await supabaseClient
        .from('organizations')
        .select('owner_id')
        .eq('id', organizationId)
        .single();
        
    // If the organization doesn't exist or the user is not the owner, deny access.
    if (orgError || orgData?.owner_id !== userId) {
        // Fallback check for old user-based logo paths (where organizationId == userId)
        if (bucketName === 'logos' && organizationId === userId) {
            // Allow deletion if it's the user's old logo path
        } else {
            return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to delete this file.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }

    // 3. Delete the file
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return new Response(JSON.stringify({ error: `Delete failed: ${deleteError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // 4. Log to audit_logs (using service role key for direct DB access)
    const serviceSupabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Determine record ID based on bucket (for logos/banners, it's the organization ID or coupon/event ID)
    let recordId = organizationId;
    if (bucketName === 'coupon_banners' || bucketName === 'event_banners') {
        // The file path is expected to be organizationId/couponId.jpg or organizationId/eventId.jpg
        const fileName = pathSegments.pop();
        if (fileName) {
            recordId = fileName.split('.')[0]; // couponId or eventId
        }
    }

    await serviceSupabaseClient.from('audit_logs').insert({
        user_id: userId,
        action: 'STORAGE_DELETE',
        table_name: bucketName,
        record_id: recordId,
        payload: { 
            deleted_url: publicUrl,
            file_path: filePath
        }
    });


    return new Response(JSON.stringify({ success: true }), {
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