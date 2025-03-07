
import { ModerationResult } from './models/moderationResult';
import { PromptService } from './services/promptService';
import { AIApiService } from './services/aiApiService';
import { ResponseProcessingService } from './services/responseProcessingService';
import { verificarTermosOfensivos } from './utils/textUtils';

/**
 * Service for AI-based content moderation
 */
export class AIService {
  private apiKey: string;
  private promptService: PromptService;
  private apiService: AIApiService;
  private responseProcessor: ResponseProcessingService;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.promptService = new PromptService();
    this.apiService = new AIApiService(apiKey);
    this.responseProcessor = new ResponseProcessingService();
  }
  
  /**
   * Moderates a comment using AI and fallback mechanisms
   * @param commentText The comment text to moderate
   * @returns Moderation result with appropriate status and reason
   */
  public async moderateComment(commentText: string): Promise<ModerationResult> {
    console.log("Enviando comentário para moderação:", commentText.substring(0, 50) + (commentText.length > 50 ? '...' : ''));
    
    // Verificação de tamanho do comentário
    if (commentText.length > 2000) {
      return {
        isAppropriate: false,
        reason: "Comentário muito longo. Por favor, limite seus comentários a 2000 caracteres."
      };
    }
    
    // Primeira tentativa
    let response = await this.apiService.callModerationAPI(
      this.promptService.createPrompt(commentText, false)
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`Error calling moderation API: ${errorData}`);
    }

    let data = await response.json();
    let aiResponse = data.choices[0].message.content;
    console.log("Resposta IA (primeira tentativa):", aiResponse);
    
    // Processa a resposta
    let moderationResult = await this.responseProcessor.processAIResponse(aiResponse);
    
    // Segunda tentativa se a primeira falhar
    if (!moderationResult) {
      console.log("Primeira tentativa falhou. Enviando segunda solicitação com instruções mais explícitas...");
      
      response = await this.apiService.callModerationAPI(
        this.promptService.createPrompt(commentText, true)
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error na segunda tentativa:', errorData);
        throw new Error(`Error calling moderation API (second attempt): ${errorData}`);
      }
      
      data = await response.json();
      aiResponse = data.choices[0].message.content;
      console.log("Resposta IA (segunda tentativa):", aiResponse);
      
      moderationResult = await this.responseProcessor.processAIResponse(aiResponse);
      
      // Se ainda falhar, tenta extrair do texto
      if (!moderationResult) {
        moderationResult = this.responseProcessor.extractResultFromText(aiResponse);
      }
    }
    
    // Fallback se todas as tentativas falharem
    if (!moderationResult) {
      console.log("Todas as tentativas de processamento falharam. Usando verificação direta...");
      
      const containsOffensiveTerm = verificarTermosOfensivos(commentText);
      
      if (containsOffensiveTerm) {
        return {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões ou termos discriminatórios não são permitidos."
        };
      } else {
        return { 
          isAppropriate: true, 
          reason: "" 
        };
      }
    }
    
    return moderationResult;
  }
}
