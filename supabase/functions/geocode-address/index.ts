import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // No authentication needed for this public geocoding service, but we check for POST method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { lat, lng } = await req.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing or invalid lat/lng parameters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Reverse Geocoding using OpenStreetMap Nominatim
    // NOTE: Nominatim requires a user-agent header for proper usage.
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
        headers: {
            'User-Agent': 'NoxlyApp/1.0 (hello@noxly.hu)', // Required by Nominatim policy
        }
    });

    if (!response.ok) {
        console.error('Nominatim API error:', response.status, await response.text());
        return new Response(JSON.stringify({ error: 'Failed to fetch address from geocoding service.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const data = await response.json();
    
    // Extract relevant address components
    const address = data.address || {};
    const formattedAddress = data.display_name || `${lat}, ${lng}`;
    
    const result = {
        formatted_address: formattedAddress,
        city: address.city || address.town || address.village || null,
        country: address.country || null,
        street: address.road || null,
        postal_code: address.postcode || null,
    };

    return new Response(JSON.stringify(result), {
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