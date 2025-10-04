import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Text input is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const DEPPSEEK_API_KEY = Deno.env.get("DEPPSEEEK_API_KEY"); // Changed to DEPPSEEK_API_KEY
    if (!DEPPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "DEPPSEEK_API_KEY not set in Supabase secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", { // Changed API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEPPSEEK_API_KEY}`, // Using DEPPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Changed model to DeepSeek's chat model
        messages: [
          { role: "system", content: "You are a sentiment analysis expert. Classify the following text as 'positive', 'negative', or 'neutral'. Respond with only one word: 'positive', 'negative', or 'neutral'." },
          { role: "user", content: text },
        ],
        max_tokens: 10, // Keep response short
        temperature: 0, // Make it deterministic
      }),
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json();
      console.error("DeepSeek API error:", errorData);
      return new Response(JSON.stringify({ error: errorData.error?.message || "Failed to get sentiment from DeepSeek." }), {
        status: deepseekResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await deepseekResponse.json();
    const sentiment = data.choices[0]?.message?.content?.toLowerCase().trim();

    if (!sentiment || !['positive', 'negative', 'neutral'].includes(sentiment)) {
      console.warn("Unexpected sentiment response from DeepSeek:", sentiment);
      return new Response(JSON.stringify({ sentiment: "unknown", rawResponse: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sentiment }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-sentiment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});