
/**
 * Service responsible for creating AI prompts for comment moderation
 */
export class PromptService {
  /**
   * Creates a prompt for the AI moderator based on comment text
   * @param commentText The text to be moderated
   * @param retry Whether this is a retry attempt (changes formatting instructions)
   * @returns Formatted prompt for AI moderation
   */
  public createPrompt(commentText: string, retry = false): string {
    const basePrompt = `
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
    `;
    
    const format = `
      IMPORTANTE: Responda APENAS com um objeto JSON no seguinte formato, SEM MARKDOWN, SEM FORMATAÇÃO ADICIONAL, apenas o JSON puro:
      {"isAppropriate": true/false, "reason": "Explicação detalhada se o comentário for inapropriado"}
      
      Se o comentário contiver qualquer violação das diretrizes, isAppropriate deve ser false e você deve explicar exatamente qual regra foi violada e por quê.
    `;
    
    // Adiciona ênfase extra no formato em caso de retry
    const retryFormat = `
      ATENÇÃO - ERRO ANTERIOR NO FORMATO! EXTREMAMENTE IMPORTANTE!
      
      Responda APENAS com um objeto JSON puro, SEM nenhuma formatação ou markdown. 
      NÃO use BLOCKS DE CÓDIGO ou qualquer outra coisa além do JSON bruto.
      
      Formato OBRIGATÓRIO:
      {"isAppropriate": true/false, "reason": "Explicação detalhada se o comentário for inapropriado"}
      
      Apenas esses caracteres são permitidos: {, }, ", :, ,, letras, números e pontuação básica.
      
      REPITO: NÃO USE MARKDOWN. NÃO USE BLOCKS DE CÓDIGO. APENAS JSON PURO.
    `;
    
    return basePrompt + (retry ? retryFormat : format);
  }
}
