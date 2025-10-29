import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to check if the user is an accepted member of the organization
async function isUserOrganizationMember(supabaseClient: any, userId: string, organizationId: string): Promise<boolean> {
    const { count, error } = await supabaseClient
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('status', 'accepted');
        
    if (error) {
        console.error('Membership check error:', error);
        return false;
    }
    return (count || 0) > 0;
}

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
    const publicIndex = urlParts.indexOf('public');
    
    if (publicIndex === -1 || publicIndex + 1 >= urlParts.length) {
        return new Response(JSON.stringify({ error: 'Invalid public URL format.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const bucketName = urlParts[publicIndex + 1];
    const filePath = urlParts.slice(publicIndex + 2).join('/');
    
    // The first segment of the file path is the organization ID (or user ID for old logos)
    const pathSegments = filePath.split('/');
    const organizationId = pathSegments[0];
    
    // 2. Security Check: Ensure the user has permission to delete this file.
    let isAuthorized = false;
    
    if (!organizationId) {
        return new Response(JSON.stringify({ error: 'Forbidden: Missing organization ID in path.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check 1: Is the user the owner of the organization? (Applies to all buckets)
    const { data: orgData, error: orgError } = await supabaseClient
        .from('organizations')
        .select('owner_id')
        .eq('id', organizationId)
        .single();
        
    if (orgData?.owner_id === userId) {
        isAuthorized = true;
    }
    
    // Check 2: Is the user an accepted member of the organization? (Applies to banners)
    if (!isAuthorized && (bucketName === 'coupon_banners' || bucketName === 'event_banners' || bucketName === 'logos')) {
        if (await isUserOrganizationMember(supabaseClient, userId, organizationId)) {
            isAuthorized = true;
        }
    }
    
    // Final authorization check
    if (!isAuthorized) {
        return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to delete this file.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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