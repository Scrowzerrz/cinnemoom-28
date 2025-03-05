
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commentText } = await req.json();
    
    if (!commentText || typeof commentText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Comment text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API Key not found');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
      Analise o seguinte comentário e determine se ele viola as diretrizes da comunidade. 
      O comentário não deve conter:
      1. Discurso de ódio
      2. Linguagem ofensiva ou agressiva
      3. Assédio ou bullying
      4. Conteúdo sexual explícito
      5. Ameaças de violência
      6. Desinformação perigosa
      
      Comentário: "${commentText}"
      
      Responda APENAS com um JSON no seguinte formato:
      {
        "isAppropriate": true/false,
        "reason": "Breve explicação se o comentário for inapropriado"
      }
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://cinemoon.app",
        "X-Title": "CineMoon",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-1.5-pro-latest",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error calling moderation API', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let moderationResult;

    try {
      // Extract the content from the OpenRouter response
      const aiResponse = data.choices[0].message.content;
      
      // Parse the JSON response from the AI
      moderationResult = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', data);
      
      // Fallback: Assume the comment is appropriate if we can't parse the response
      moderationResult = { 
        isAppropriate: true, 
        reason: "Erro ao analisar a resposta da IA" 
      };
    }

    return new Response(
      JSON.stringify(moderationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in moderate-comment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
