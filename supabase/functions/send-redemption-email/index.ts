import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend"; // Using npm:resend package

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// NOTE: Using a generic Resend-verified address for reliability.
const SENDER_EMAIL = 'noreply@resend.dev'; 

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual authentication check (required by the RPC caller)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('Unauthorized access: Missing Authorization header.');
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables.');
    return new Response('Email service not configured (Missing API Key)', { status: 500, headers: corsHeaders });
  }
  
  console.log(`[START] Edge Function invoked using npm:resend.`);

  try {
    // Payload structure from RPC:
    const { 
      user_email, 
      coupon_title, // Used for both coupon title and event title
      organization_name, 
      subject, 
      body 
    } = await req.json();

    if (!user_email || !coupon_title || !organization_name || !subject || !body) {
      console.error('Missing required fields in request body.');
      return new Response('Missing required fields in request body', { status: 400, headers: corsHeaders });
    }
    
    // Replace placeholders in the email body
    const finalBody = body
      .replace(/{{coupon_title}}/g, coupon_title)
      .replace(/{{event_title}}/g, coupon_title) 
      .replace(/{{organization_name}}/g, organization_name);

    console.log(`[RESEND] Attempting to send email to: ${user_email} from ${SENDER_EMAIL}`);

    // Use the Resend client to send the email
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: user_email,
      subject: subject,
      html: finalBody,
    });

    if (error) {
      console.error('[RESEND ERROR] API call failed:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: error }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    console.log('[RESEND] Email sent successfully via Resend.', data);

    return new Response(JSON.stringify({ message: 'Email sent successfully', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FATAL ERROR] Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
      console.log(`[END] Edge Function finished execution.`);
  }
});