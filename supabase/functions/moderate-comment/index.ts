
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsRequest, createJsonResponse } from './cors.ts';
import { ModerationService } from './moderationService.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    const { commentText } = await req.json();
    
    if (!commentText || typeof commentText !== 'string') {
      return createJsonResponse(
        { error: 'Comment text is required' }, 
        400
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API Key not found');
      return createJsonResponse(
        { error: 'API configuration error' },
        500
      );
    }

    // Inicializar serviço de moderação
    const moderationService = new ModerationService(OPENROUTER_API_KEY);
    
    // Processar moderação
    const moderationResult = await moderationService.moderateComment(commentText);
    
    console.log("Resultado final da moderação:", JSON.stringify(moderationResult));
    
    return createJsonResponse(moderationResult);
  } catch (error) {
    console.error('Erro na função moderate-comment:', error);
    return createJsonResponse(
      { 
        error: error.message,
        isAppropriate: false,
        reason: "Erro ao processar o comentário. Por favor, tente novamente com um comentário mais curto."
      },
      500
    );
  }
});
