import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@3.3.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");
const FROM = Deno.env.get("RESEND_FROM") || "send@noxly.hu"; // Default to user's domain
const SECRET = Deno.env.get("FUNCTION_SECRET") || "";

type Payload = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string[]; 
  bcc?: string[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // 1) Secret ellenőrzés
    const headerSecret = req.headers.get("x-function-secret") || "";
    if (!SECRET || headerSecret !== SECRET) {
      console.error("Unauthorized access: Invalid or missing x-function-secret.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2) Input beolvasás
    const body = (await req.json()) as Payload;

    if (!body?.to || !body?.subject || (!body.html && !body.text)) {
      console.error("Missing required fields in request body.");
      return new Response(JSON.stringify({ error: "Missing fields (to, subject, html/text)" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3) Küldés Resenddel
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      cc: body.cc,
      bcc: body.bcc,
    });

    if (error) {
      console.error("[RESEND ERROR] API call failed:", error);
      return new Response(JSON.stringify({ error }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    console.error("[FATAL ERROR] Edge function error:", e.message);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});