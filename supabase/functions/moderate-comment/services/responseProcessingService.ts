
import { ModerationResult } from '../models/moderationResult.ts';

/**
 * Service for processing AI responses for content moderation
 */
export class ResponseProcessingService {
  /**
   * Processes the AI response to extract moderation result
   * @param aiResponse The raw response from the AI
   * @returns Moderation result or null if processing failed
   */
  public async processAIResponse(aiResponse: string): Promise<ModerationResult | null> {
    try {
      if (!aiResponse) {
        console.error('AI response is empty or undefined');
        return null;
      }
      
      console.log("Processando resposta de AI com tamanho:", aiResponse.length);
      
      // Try to parse JSON directly
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiResponse.match(/{[\s\S]*"isAppropriate"[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
        
        try {
          const result = JSON.parse(cleanJson);
          
          if (typeof result.isAppropriate === 'boolean' && typeof result.reason === 'string') {
            console.log("JSON válido extraído com sucesso");
            return result as ModerationResult;
          } else {
            console.error('JSON extraído não contém as propriedades esperadas:', result);
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON extraído:', parseError, 'Raw JSON:', cleanJson);
        }
      } else {
        console.log("Não foi possível encontrar JSON na resposta");
      }
      
      return null;
    } catch (error) {
      console.error('Erro processando resposta de AI:', error);
      return null;
    }
  }
  
  /**
   * Fallback method to extract moderation result from text
   * @param aiResponse The raw response from the AI
   * @returns Extracted moderation result or default result
   */
  public extractResultFromText(aiResponse: string): ModerationResult {
    if (!aiResponse) {
      console.warn('AI response is empty in extractResultFromText, defaulting to appropriate');
      return {
        isAppropriate: true,
        reason: ""
      };
    }
    
    const lowerResponse = aiResponse.toLowerCase();
    
    // Check for inappropriate indicators
    const inappropriateIndicators = [
      'inappropriate', 'not appropriate', 'offensive', 
      'violates', 'violation', 'not allowed', 'prohibited',
      'impróprio', 'ofensivo', 'inadequado', 'viola', 'proibido'
    ];
    
    const isInappropriate = inappropriateIndicators.some(indicator => 
      lowerResponse.includes(indicator)
    );
    
    // Extract reason if possible
    let reason = "";
    
    if (isInappropriate) {
      // Try to find a reason in the response
      const reasonMatches = aiResponse.match(/reason:?\s*"?([^"]+)"?/i) ||
                           aiResponse.match(/because:?\s*"?([^"]+)"?/i) ||
                           aiResponse.match(/motivo:?\s*"?([^"]+)"?/i);
      
      if (reasonMatches && reasonMatches[1]) {
        reason = reasonMatches[1].trim();
      } else {
        reason = "Conteúdo impróprio detectado.";
      }
    }
    
    return {
      isAppropriate: !isInappropriate,
      reason: reason
    };
  }
}
