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
    // Expected format: https://[project_id].supabase.co/storage/v1/object/public/[bucket_name]/[user_id]/[file_name]
    const urlParts = publicUrl.split('/');
    const bucketIndex = urlParts.indexOf('public') + 1;
    
    if (bucketIndex === 0 || bucketIndex >= urlParts.length) {
        return new Response(JSON.stringify({ error: 'Invalid public URL format.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const bucketName = urlParts[bucketIndex];
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    // 2. Security Check: Ensure the file path starts with the user's ID (folder name)
    // This prevents users from deleting files outside their own folder.
    if (!filePath.startsWith(userId)) {
        return new Response(JSON.stringify({ error: 'Forbidden: Cannot delete files outside your designated folder.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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