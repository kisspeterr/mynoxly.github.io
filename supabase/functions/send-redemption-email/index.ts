import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// NOTE: This email must be verified in Resend.
const SENDER_EMAIL = 'noxlynightlife@gmail.com'; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual authentication handling (since verify_jwt is false)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('Unauthorized access: Missing Authorization header.');
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables.');
    return new Response('Email service not configured (Missing API Key)', { status: 500, headers: corsHeaders });
  }
  
  // Log the key status (only first few chars for security)
  console.log(`RESEND_API_KEY status: Loaded (starts with ${RESEND_API_KEY.substring(0, 4)}...)`);

  try {
    const { 
      user_email, 
      coupon_title, // Used for both coupon title and event title
      organization_name, 
      subject, 
      body 
    } = await req.json();

    if (!user_email || !coupon_title || !organization_name || !subject || !body) {
      console.error('Missing required fields in request body:', { user_email, coupon_title, organization_name, subject, body });
      return new Response('Missing required fields in request body', { status: 400, headers: corsHeaders });
    }
    
    console.log(`Attempting to send email to: ${user_email} for ${coupon_title} (${organization_name})`);

    // Replace placeholders in the email body
    const finalBody = body
      .replace(/{{coupon_title}}/g, coupon_title)
      .replace(/{{event_title}}/g, coupon_title) // Handle event title placeholder as well
      .replace(/{{organization_name}}/g, organization_name);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: user_email,
        subject: subject,
        html: finalBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errorText }), { 
        status: resendResponse.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    console.log('Email sent successfully via Resend.');

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});