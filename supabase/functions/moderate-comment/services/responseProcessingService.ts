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
      // Try to parse JSON directly
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiResponse.match(/{[\s\S]*"isAppropriate"[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanJson);
        
        if (typeof result.isAppropriate === 'boolean' && typeof result.reason === 'string') {
          return result as ModerationResult;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error processing AI response:', error);
      return null;
    }
  }
  
  /**
   * Fallback method to extract moderation result from text
   * @param aiResponse The raw response from the AI
   * @returns Extracted moderation result or default result
   */
  public extractResultFromText(aiResponse: string): ModerationResult {
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
