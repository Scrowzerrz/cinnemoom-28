
import { sanitizeJSONString, extractJSONPattern } from './utils.ts';

// Interface para o resultado da moderação
export interface ModerationResult {
  isAppropriate: boolean;
  reason: string;
}

// Classe para interagir com a API de IA para moderação
export class AIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // Cria o prompt para a IA com base no texto do comentário
  private createPrompt(commentText: string, retry = false): string {
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
  
  // Chama a API OpenRouter para moderação com o modelo Deepseek R1
  private async callModerationAPI(prompt: string): Promise<Response> {
    return await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://cinemoon.app",
        "X-Title": "CineMoon",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "max_tokens": 164000
      })
    });
  }
  
  // Processa a resposta da API para extrair o resultado da moderação
  private async processAIResponse(aiResponse: string): Promise<ModerationResult | null> {
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
  
  // Tenta extrair um resultado de moderação do texto da resposta usando regex
  private extractResultFromText(aiResponse: string): ModerationResult | null {
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
  
  // Método público para moderar um comentário
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
    let response = await this.callModerationAPI(this.createPrompt(commentText, false));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`Error calling moderation API: ${errorData}`);
    }

    let data = await response.json();
    
    // Verificar se data e data.choices existem para evitar o erro
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Resposta inválida da API:', JSON.stringify(data));
      throw new Error('Resposta inválida da API de moderação');
    }
    
    // Verificar se a primeira escolha e sua mensagem existem
    if (!data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Formato de resposta inválido:', JSON.stringify(data.choices));
      throw new Error('Formato de resposta inválido da API de moderação');
    }
    
    let aiResponse = data.choices[0].message.content;
    console.log("Resposta IA (primeira tentativa):", aiResponse);
    
    // Processa a resposta
    let moderationResult = await this.processAIResponse(aiResponse);
    
    // Segunda tentativa se a primeira falhar
    if (!moderationResult) {
      console.log("Primeira tentativa falhou. Enviando segunda solicitação com instruções mais explícitas...");
      
      response = await this.callModerationAPI(this.createPrompt(commentText, true));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error na segunda tentativa:', errorData);
        throw new Error(`Error calling moderation API (second attempt): ${errorData}`);
      }
      
      data = await response.json();
      
      // Verificar se data e data.choices existem para evitar o erro
      if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('Resposta inválida da API (segunda tentativa):', JSON.stringify(data));
        throw new Error('Resposta inválida da API de moderação na segunda tentativa');
      }
      
      // Verificar se a primeira escolha e sua mensagem existem
      if (!data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Formato de resposta inválido (segunda tentativa):', JSON.stringify(data.choices));
        throw new Error('Formato de resposta inválido da API de moderação na segunda tentativa');
      }
      
      aiResponse = data.choices[0].message.content;
      console.log("Resposta IA (segunda tentativa):", aiResponse);
      
      moderationResult = await this.processAIResponse(aiResponse);
      
      // Se ainda falhar, tenta extrair do texto
      if (!moderationResult) {
        moderationResult = this.extractResultFromText(aiResponse);
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

// Função auxiliar para verificar termos ofensivos
function verificarTermosOfensivos(texto: string): boolean {
  const lowerCaseComment = texto.toLowerCase();
  const offensiveTerms = [
    'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
    'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete', 
    'pinto', 'retardado', 'corno', 'vagabunda', 'vadia', 'otário', 
    'imbecil', 'babaca', 'pica', 'idiota', 'bosta', 'burro', 'foda',
    'negro', 'preto', 'macaco'
  ];
  
  return offensiveTerms.some(term => {
    const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`, 'i');
    return termRegex.test(lowerCaseComment);
  });
}
