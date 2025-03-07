
import { AIService } from './aiService.ts';
import { ModerationResult } from './models/moderationResult.ts';
import { verificarTermosOfensivos } from './utils/textUtils.ts';
import { 
  verificarCaracteresRepetitivos, 
  verificarCapitalizacaoExcessiva, 
  verificarTamanhoComentario 
} from './utils/validationUtils.ts';

/**
 * Main service for comment moderation
 */
export class ModerationService {
  private aiService: AIService;
  
  constructor(apiKey: string) {
    this.aiService = new AIService(apiKey);
  }
  
  /**
   * Moderates a comment using AI and complementary rules
   * @param commentText The comment text to moderate
   * @returns Moderation result with appropriate status and reason
   */
  public async moderateComment(commentText: string): Promise<ModerationResult> {
    // Verificações iniciais diretas (rápidas)
    
    // 1. Verificar tamanho do comentário
    if (!verificarTamanhoComentario(commentText)) {
      return {
        isAppropriate: false,
        reason: "Comentário muito longo. Por favor, limite seus comentários a 2000 caracteres."
      };
    }
    
    // 2. Verificar caracteres repetitivos (possível spam)
    if (verificarCaracteresRepetitivos(commentText)) {
      return {
        isAppropriate: false,
        reason: "Comentário com caracteres repetitivos detectados. Possível spam."
      };
    }
    
    // 3. Verificar capitalização excessiva (gritando)
    if (verificarCapitalizacaoExcessiva(commentText)) {
      return {
        isAppropriate: false,
        reason: "Uso excessivo de letras maiúsculas. Evite 'gritar' nos comentários."
      };
    }
    
    try {
      // Usar o serviço de IA para moderação
      const aiResult = await this.aiService.moderateComment(commentText);
      
      // Verificação secundária: verificar termos ofensivos mesmo que a IA aprove
      if (aiResult.isAppropriate && verificarTermosOfensivos(commentText)) {
        console.warn('Substituição manual: IA não detectou termo ofensivo no comentário');
        return {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões ou termos discriminatórios não são permitidos."
        };
      }
      
      return aiResult;
    } catch (error) {
      console.error('Erro ao processar moderação via IA:', error);
      
      // Fallback para verificação manual direta se a IA falhar
      if (verificarTermosOfensivos(commentText)) {
        return {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões não são permitidos."
        };
      }
      
      // Se não for possível verificar, permite o comentário mas registra o erro
      return { 
        isAppropriate: true, 
        reason: "" 
      };
    }
  }
}
