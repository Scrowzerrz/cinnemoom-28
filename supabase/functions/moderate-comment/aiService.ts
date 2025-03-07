
import { ModerationResult } from './models/moderationResult.ts';
import { PromptService } from './services/promptService.ts';
import { AIApiService } from './services/aiApiService.ts';
import { ResponseProcessingService } from './services/responseProcessingService.ts';
import { verificarTermosOfensivos } from './utils/textUtils.ts';

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
    
    if (!apiKey || apiKey.trim() === "") {
      console.warn("AVISO: Chave da API de moderação não fornecida ao AIService");
    }
    
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
    
    // Verificação de chave de API
    if (!this.apiKey || this.apiKey.trim() === "") {
      console.error("Não foi possível moderar: Chave de API não configurada");
      return this.useFallbackVerification(commentText);
    }
    
    // Verificação de tamanho do comentário
    if (commentText.length > 2000) {
      return {
        isAppropriate: false,
        reason: "Comentário muito longo. Por favor, limite seus comentários a 2000 caracteres."
      };
    }
    
    try {
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
      
      // Verificar se os dados têm o formato esperado
      if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
        console.error('Formato de resposta da API inesperado:', JSON.stringify(data));
        throw new Error('Formato de resposta da API inválido');
      }
      
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
        
        // Verificar novamente se os dados têm o formato esperado
        if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
          console.error('Formato de resposta da API inesperado na segunda tentativa:', JSON.stringify(data));
          throw new Error('Formato de resposta da API inválido na segunda tentativa');
        }
        
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
        return this.useFallbackVerification(commentText);
      }
      
      return moderationResult;
    } catch (error) {
      console.error('Erro ao processar moderação via IA:', error);
      return this.useFallbackVerification(commentText);
    }
  }
  
  /**
   * Método de fallback para verificar comentários quando a IA falha
   * @param commentText Texto do comentário para verificar
   * @returns Resultado da moderação
   */
  private useFallbackVerification(commentText: string): ModerationResult {
    console.log("Usando verificação direta de termos ofensivos (fallback)...");
    
    // Fallback para verificação manual direta
    if (verificarTermosOfensivos(commentText)) {
      return {
        isAppropriate: false,
        reason: "Linguagem ofensiva detectada. Comentários com palavrões ou termos discriminatórios não são permitidos."
      };
    }
    
    // Se não foi possível verificar, permite o comentário mas registra o erro
    return { 
      isAppropriate: true, 
      reason: "" 
    };
  }
}
