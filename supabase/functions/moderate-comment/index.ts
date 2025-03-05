
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

    // Enhanced system prompt with clearer instructions
    const prompt = `
      Você é um moderador de conteúdo rigoroso para uma plataforma de comentários de filmes e séries.
      
      Sua tarefa é analisar o seguinte comentário e determinar se ele viola nossas diretrizes da comunidade.
      Seja RIGOROSO na sua análise. Se houver qualquer possibilidade do comentário violar as regras, você deve marcá-lo como inapropriado.
      
      Diretrizes da Comunidade - O comentário é inapropriado se contiver:
      1. Discurso de ódio, palavras pejorativas ou linguagem discriminatória contra qualquer grupo
      2. Palavrões, insultos, xingamentos ou linguagem ofensiva
      3. Assédio, bullying ou comportamento persecutório
      4. Conteúdo sexual explícito ou sugestivo 
      5. Ameaças de violência, mesmo em tom de brincadeira
      6. Desinformação perigosa sobre saúde, eleições ou outros temas sensíveis
      7. Spam, links maliciosos ou conteúdo promocional não solicitado
      8. Informações pessoais de terceiros
      
      Comentário: "${commentText}"
      
      IMPORTANTE: Responda APENAS com um objeto JSON no seguinte formato, SEM MARKDOWN, SEM FORMATAÇÃO ADICIONAL, apenas o JSON puro:
      {"isAppropriate": true/false, "reason": "Explicação detalhada se o comentário for inapropriado"}
      
      Se o comentário contiver qualquer violação das diretrizes, isAppropriate deve ser false e você deve explicar exatamente qual regra foi violada e por quê.
    `;

    console.log("Sending comment for moderation:", commentText.substring(0, 50) + (commentText.length > 50 ? '...' : ''));
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://cinemoon.app",
        "X-Title": "CineMoon",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-pro-exp-02-05:free",
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
      console.log("Raw AI response:", aiResponse);
      
      // Clean up the AI response to handle markdown or other formatting
      const cleanedResponse = aiResponse
        .replace(/```json/g, '') // Remove markdown json tags
        .replace(/```/g, '')     // Remove closing markdown tags
        .trim();                 // Trim whitespace
      
      // FIRST VERIFICATION: Try to parse the JSON response
      try {
        // Parse the cleaned JSON response
        moderationResult = JSON.parse(cleanedResponse);
        
        // Validate the response structure
        if (typeof moderationResult.isAppropriate !== 'boolean' || typeof moderationResult.reason !== 'string') {
          console.error('Invalid AI response format - structure is incorrect:', moderationResult);
          throw new Error('Invalid response structure');
        }
        
      } catch (jsonError) {
        console.error('Error parsing AI response JSON:', jsonError);
        console.log('Raw AI response that failed parsing:', aiResponse);
        
        // Try a second time with an even more aggressive clean-up
        try {
          const moreAggressiveCleanup = cleanedResponse
            .replace(/['"]\s*isAppropriate\s*['"]\s*:\s*/g, '"isAppropriate":')
            .replace(/['"]\s*reason\s*['"]\s*:\s*/g, '"reason":')
            .replace(/\n/g, '')
            .replace(/\r/g, '')
            .replace(/\t/g, '')
            .replace(/,\s*}/g, '}');
          
          moderationResult = JSON.parse(moreAggressiveCleanup);
          
          if (typeof moderationResult.isAppropriate !== 'boolean' || typeof moderationResult.reason !== 'string') {
            throw new Error('Invalid response structure after aggressive cleanup');
          }
          
          console.log('Successfully parsed response after aggressive cleanup');
        } catch (secondError) {
          console.error('Failed second attempt at parsing:', secondError);
          
          // Fall back to direct text pattern matching if JSON parsing still fails
          if (cleanedResponse.includes('true') && !cleanedResponse.includes('false')) {
            moderationResult = {
              isAppropriate: true,
              reason: ""
            };
          } else if (cleanedResponse.includes('false')) {
            // Try to extract reason from the text
            const reasonMatch = cleanedResponse.match(/"reason"\s*:\s*"([^"]+)"/);
            const reason = reasonMatch ? reasonMatch[1] : "Conteúdo impróprio detectado";
            
            moderationResult = {
              isAppropriate: false,
              reason: reason
            };
          } else {
            // Default to block if we can't determine
            moderationResult = {
              isAppropriate: false,
              reason: "Não foi possível determinar se o conteúdo é apropriado"
            };
          }
        }
      }
      
      // SECOND VERIFICATION: Check for offensive terms directly
      // This overrides the AI decision if we detect obviously offensive content
      const lowerCaseComment = commentText.toLowerCase();
      const offensiveTerms = [
        'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
        'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete', 
        'pinto', 'retardado', 'corno', 'vagabunda', 'vadia', 'otário', 
        'imbecil', 'babaca', 'pica'
      ];
      
      const containsOffensiveTerm = offensiveTerms.some(term => {
        // Exact term match or term with common separators
        const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`);
        return termRegex.test(lowerCaseComment);
      });
      
      if (containsOffensiveTerm && moderationResult.isAppropriate) {
        console.warn('Manual override: AI missed offensive term in comment');
        moderationResult = {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões não são permitidos."
        };
      }
      
      // Third verification: Content length and character checks
      if (moderationResult.isAppropriate) {
        // Check for repetitive characters (potential spam)
        const repetitiveCharsRegex = /([a-zA-Z0-9])\1{4,}/;
        if (repetitiveCharsRegex.test(commentText)) {
          console.warn('Repetitive characters detected - potential spam');
          moderationResult = {
            isAppropriate: false,
            reason: "Comentário com caracteres repetitivos detectados. Possível spam."
          };
        }
        
        // Check for excessive capitalization (shouting)
        const words = commentText.split(/\s+/);
        const capsWords = words.filter(word => word.length > 2 && word === word.toUpperCase());
        if (words.length >= 5 && capsWords.length / words.length > 0.5) {
          console.warn('Excessive capitalization detected');
          moderationResult = {
            isAppropriate: false,
            reason: "Uso excessivo de letras maiúsculas. Evite 'gritar' nos comentários."
          };
        }
      }
      
    } catch (error) {
      console.error('General error processing AI response:', error);
      console.log('Raw OpenAI API response:', data);
      
      // Fallback: Perform our own content check if AI processing fails completely
      const lowerCaseComment = commentText.toLowerCase();
      const offensiveTerms = [
        'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
        'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete'
      ];
      
      const containsOffensiveTerm = offensiveTerms.some(term => lowerCaseComment.includes(term));
      
      if (containsOffensiveTerm) {
        moderationResult = {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões não são permitidos."
        };
      } else {
        // Default fallback response
        moderationResult = { 
          isAppropriate: false, 
          reason: "Erro ao processar o comentário - bloqueado preventivamente" 
        };
      }
    }

    console.log("Final moderation result:", JSON.stringify(moderationResult));
    
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
