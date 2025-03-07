
import { ModerationResult } from '../models/moderationResult';
import { sanitizeJSONString, extractJSONPattern, verificarTermosOfensivos } from '../utils/textUtils';

/**
 * Service for processing and extracting moderation results from AI responses
 */
export class ResponseProcessingService {
  /**
   * Processes an AI response to extract moderation results
   * @param aiResponse Raw response text from AI
   * @returns Parsed moderation result or null if parsing failed
   */
  public async processAIResponse(aiResponse: string): Promise<ModerationResult | null> {
    try {
      // Tenta primeiro o método normal
      try {
        const cleanedResponse = aiResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const result = JSON.parse(cleanedResponse);
        
        // Valida a estrutura
        if (typeof result.isAppropriate !== 'boolean' || 
            typeof result.reason !== 'string') {
          throw new Error('Estrutura inválida do JSON');
        }
        
        return result;
      } catch (jsonError) {
        console.error('Falha no parsing JSON padrão:', jsonError);
        
        // Tenta com sanitização avançada
        try {
          const sanitizedJSON = sanitizeJSONString(aiResponse);
          console.log('JSON sanitizado:', sanitizedJSON);
          const result = JSON.parse(sanitizedJSON);
          
          // Valida a estrutura
          if (typeof result.isAppropriate !== 'boolean' || 
              typeof result.reason !== 'string') {
            throw new Error('Estrutura inválida após sanitização');
          }
          
          return result;
        } catch (sanitizeError) {
          console.error('Falha no parsing JSON sanitizado:', sanitizeError);
          return null;
        }
      }
    } catch (error) {
      console.error('Erro geral ao processar resposta da IA:', error);
      return null;
    }
  }
  
  /**
   * Attempts to extract moderation results from text using pattern matching
   * @param aiResponse Raw AI response text
   * @returns Extracted moderation result or null if extraction failed
   */
  public extractResultFromText(aiResponse: string): ModerationResult | null {
    // Verificação direta de padrões de texto
    if (aiResponse.includes('"isAppropriate":true') || 
        aiResponse.includes('"isAppropriate": true') || 
        aiResponse.includes("'isAppropriate': true") ||
        aiResponse.includes("isAppropriate: true") ||
        aiResponse.toLowerCase().includes("appropriate") && 
        !aiResponse.toLowerCase().includes("inappropriate")) {
      return {
        isAppropriate: true,
        reason: ""
      };
    } else if (aiResponse.includes('"isAppropriate":false') || 
              aiResponse.includes('"isAppropriate": false') || 
              aiResponse.includes("'isAppropriate': false") ||
              aiResponse.includes("isAppropriate: false") ||
              aiResponse.toLowerCase().includes("inappropriate")) {
      // Tenta extrair o motivo do texto
      const reasonPattern = /"reason":\s*"([^"]*)"|'reason':\s*'([^']*)'|reason:\s*["']([^"']*)["']/;
      const reasonMatch = aiResponse.match(reasonPattern);
      const reason = reasonMatch ? (reasonMatch[1] || reasonMatch[2] || reasonMatch[3]) : "Conteúdo impróprio detectado";
      
      return {
        isAppropriate: false,
        reason: reason
      };
    }
    
    // Tenta extrair JSON usando expressão regular
    const extractedJSON = extractJSONPattern(aiResponse);
    if (extractedJSON) {
      try {
        console.log('JSON extraído com regex:', extractedJSON);
        const result = JSON.parse(extractedJSON);
        
        if (typeof result.isAppropriate !== 'boolean') {
          throw new Error('Propriedade isAppropriate não é booleana');
        }
        
        if (!result.reason) {
          result.reason = result.isAppropriate ? 
            "" : "Conteúdo impróprio detectado";
        }
        
        return result;
      } catch (error) {
        console.error('Erro ao processar JSON extraído:', error);
      }
    }
    
    return null;
  }
}
