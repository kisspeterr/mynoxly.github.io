import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with Service Role Key for privileged access
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
        persistSession: false,
    },
});

// Function to fetch user email from auth.users table (requires service role)
async function getUserEmail(userId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) {
        console.error("Error fetching user email:", error.message);
        return null;
    }
    return data.user?.email || null;
}

// Function to fetch coupon details
async function getCouponDetails(couponId: string): Promise<{ title: string, organization_name: string } | null> {
    const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('title, organization_name')
        .eq('id', couponId)
        .single();
        
    if (error) {
        console.error("Error fetching coupon details:", error.message);
        return null;
    }
    return data;
}

// Simple HTML template for the email
function generateEmailHtml(couponTitle: string, organizationName: string, redeemedAt: string) {
    return `
        <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #e2e8f0; border-radius: 8px; max-width: 600px; margin: auto;">
            <h1 style="color: #22d3ee; border-bottom: 2px solid #475569; padding-bottom: 10px;">Sikeres Kupon Beváltás!</h1>
            <p style="font-size: 16px; line-height: 1.5;">Kedves Felhasználó,</p>
            <p style="font-size: 16px; line-height: 1.5;">Értesítünk, hogy sikeresen beváltottad a következő kupont:</p>
            
            <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 18px; font-weight: bold; color: #a78bfa;">${couponTitle}</p>
                <p style="color: #94a3b8;">Szervezet: ${organizationName}</p>
                <p style="color: #94a3b8;">Beváltás ideje: ${new Date(redeemedAt).toLocaleString('hu-HU')}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5;">Köszönjük, hogy a NOXLY-t használod! Élvezd a kedvezményt.</p>
            <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Üdvözlettel,<br>A NOXLY Csapat</p>
        </div>
    `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    if (!record || !record.user_id || !record.coupon_id || !record.redeemed_at) {
        return new Response(JSON.stringify({ error: 'Missing required fields in payload' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { user_id, coupon_id, redeemed_at } = record;

    // 1. Fetch user email and coupon details
    const userEmail = await getUserEmail(user_id);
    const couponDetails = await getCouponDetails(coupon_id);

    if (!userEmail || !couponDetails) {
        console.error("Failed to retrieve necessary data for email.");
        return new Response(JSON.stringify({ error: 'Failed to retrieve user or coupon data' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    const emailHtml = generateEmailHtml(couponDetails.title, couponDetails.organization_name, redeemed_at);

    // 2. Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NOXLY <noreply@noxly.hu>', // Use your domain here
        to: [userEmail],
        subject: `Sikeres kupon beváltás: ${couponDetails.title}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.json();
      console.error('Resend API error:', resendError);
      return new Response(JSON.stringify({ error: 'Failed to send email via Resend' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});