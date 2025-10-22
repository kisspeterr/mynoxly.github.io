import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SENDER_EMAIL = 'noreply@noxly.hu'; // Replace with your verified sender email

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
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set.');
    return new Response('Email service not configured', { status: 500, headers: corsHeaders });
  }

  try {
    const { 
      user_email, 
      coupon_title, 
      organization_name, 
      subject, 
      body 
    } = await req.json();

    if (!user_email || !coupon_title || !organization_name || !subject || !body) {
      return new Response('Missing required fields in request body', { status: 400, headers: corsHeaders });
    }

    // Replace placeholders in the email body
    const finalBody = body
      .replace(/{{coupon_title}}/g, coupon_title)
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
      const errorData = await resendResponse.json();
      console.error('Resend API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errorData }), { 
        status: resendResponse.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});