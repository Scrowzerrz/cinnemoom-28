
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

    // Enhanced system prompt com instruções mais claras
    const createPrompt = (retry = false) => {
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
        NÃO use blocos de código, aspas triplas, ou qualquer outra coisa além do JSON bruto.
        
        Formato OBRIGATÓRIO:
        {"isAppropriate": true/false, "reason": "Explicação detalhada se o comentário for inapropriado"}
        
        Apenas esses caracteres são permitidos: {, }, ", :, ,, letras, números e pontuação básica.
        
        REPITO: NÃO USE MARKDOWN. NÃO USE ```json ou ```. APENAS JSON PURO.
      `;
      
      return basePrompt + (retry ? retryFormat : format);
    };

    console.log("Enviando comentário para moderação:", commentText.substring(0, 50) + (commentText.length > 50 ? '...' : ''));
    
    // Função para chamar a API OpenRouter/Gemini
    const callModerationAPI = async (prompt) => {
      return await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    };

    // Primeira tentativa
    let response = await callModerationAPI(createPrompt(false));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error calling moderation API', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let data = await response.json();
    let aiResponse = data.choices[0].message.content;
    console.log("Resposta IA (primeira tentativa):", aiResponse);
    
    // Tenta processar a resposta
    let moderationResult;
    let needsRetry = false;
    
    try {
      // Limpa a resposta da IA para remover markdown ou outras formatações
      const cleanedResponse = aiResponse
        .replace(/```json/g, '') // Remove tags markdown json
        .replace(/```/g, '')     // Remove tags markdown
        .trim();                 // Remove espaços em branco
      
      // PRIMEIRA VERIFICAÇÃO: Tenta analisar a resposta JSON
      try {
        // Analisa a resposta JSON limpa
        moderationResult = JSON.parse(cleanedResponse);
        
        // Valida a estrutura da resposta
        if (typeof moderationResult.isAppropriate !== 'boolean' || typeof moderationResult.reason !== 'string') {
          console.error('Formato de resposta IA inválido - estrutura incorreta:', moderationResult);
          needsRetry = true;
        }
        
      } catch (jsonError) {
        console.error('Erro ao analisar JSON da resposta da IA:', jsonError);
        console.log('Resposta bruta da IA que falhou na análise:', aiResponse);
        needsRetry = true;
      }
    } catch (error) {
      console.error('Erro geral ao processar resposta da IA:', error);
      needsRetry = true;
    }
    
    // Segunda tentativa se a primeira falhou
    if (needsRetry) {
      console.log("Primeira tentativa falhou. Enviando segunda solicitação para IA com instruções mais explícitas...");
      
      response = await callModerationAPI(createPrompt(true));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error na segunda tentativa:', errorData);
        // Continue para o fallback
      } else {
        data = await response.json();
        aiResponse = data.choices[0].message.content;
        console.log("Resposta IA (segunda tentativa):", aiResponse);
        
        try {
          // Limpeza ainda mais agressiva
          const moreAggressiveCleanup = aiResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/['"]\s*isAppropriate\s*['"]\s*:\s*/g, '"isAppropriate":')
            .replace(/['"]\s*reason\s*['"]\s*:\s*/g, '"reason":')
            .replace(/\n/g, '')
            .replace(/\r/g, '')
            .replace(/\t/g, '')
            .replace(/,\s*}/g, '}')
            .trim();
          
          moderationResult = JSON.parse(moreAggressiveCleanup);
          
          if (typeof moderationResult.isAppropriate !== 'boolean' || typeof moderationResult.reason !== 'string') {
            throw new Error('Estrutura de resposta inválida após limpeza agressiva');
          }
          
          console.log('Resposta analisada com sucesso após limpeza agressiva');
          needsRetry = false;
        } catch (secondError) {
          console.error('Falha na segunda tentativa de análise:', secondError);
          // Continue para o fallback
        }
      }
    }
    
    // Se ambas as tentativas falharam, use verificação direta e fallback
    if (needsRetry || !moderationResult) {
      console.log("Ambas as tentativas de IA falharam. Usando verificação direta...");
      
      // Verificação direta de padrões de texto se a análise JSON ainda falhar
      if (aiResponse.includes('"isAppropriate":true') || 
          aiResponse.includes('"isAppropriate": true') || 
          aiResponse.includes("'isAppropriate': true") ||
          aiResponse.includes("isAppropriate: true")) {
        moderationResult = {
          isAppropriate: true,
          reason: ""
        };
      } else if (aiResponse.includes('"isAppropriate":false') || 
                aiResponse.includes('"isAppropriate": false') || 
                aiResponse.includes("'isAppropriate': false") ||
                aiResponse.includes("isAppropriate: false")) {
        // Tenta extrair o motivo do texto
        const reasonPattern = /"reason":\s*"([^"]*)"|'reason':\s*'([^']*)'|reason:\s*["']([^"']*)["']/;
        const reasonMatch = aiResponse.match(reasonPattern);
        const reason = reasonMatch ? (reasonMatch[1] || reasonMatch[2] || reasonMatch[3]) : "Conteúdo impróprio detectado";
        
        moderationResult = {
          isAppropriate: false,
          reason: reason
        };
      } else {
        // Fallback final para verificação direta de termos ofensivos
        const lowerCaseComment = commentText.toLowerCase();
        const offensiveTerms = [
          'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
          'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete', 
          'pinto', 'retardado', 'corno', 'vagabunda', 'vadia', 'otário', 
          'imbecil', 'babaca', 'pica', 'idiota', 'bosta', 'burro', 'foda',
          'negro', 'preto', 'macaco'
        ];
        
        const containsOffensiveTerm = offensiveTerms.some(term => {
          // Correspondência exata do termo ou termo com separadores comuns
          const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`, 'i');
          return termRegex.test(lowerCaseComment);
        });
        
        if (containsOffensiveTerm) {
          moderationResult = {
            isAppropriate: false,
            reason: "Linguagem ofensiva detectada. Comentários com palavrões ou termos discriminatórios não são permitidos."
          };
        } else {
          // Fallback padrão se todas as verificações falharem
          moderationResult = { 
            isAppropriate: true, 
            reason: "" 
          };
        }
      }
    }

    // VERIFICAÇÃO ADICIONAL: Verificação direta de termos ofensivos
    // Isso substitui a decisão da IA se detectarmos conteúdo obviamente ofensivo
    if (moderationResult.isAppropriate) {
      const lowerCaseComment = commentText.toLowerCase();
      const offensiveTerms = [
        'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
        'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete', 
        'pinto', 'retardado', 'corno', 'vagabunda', 'vadia', 'otário', 
        'imbecil', 'babaca', 'pica', 'idiota', 'bosta', 'burro', 'foda',
        'negro', 'preto', 'macaco'
      ];
      
      const containsOffensiveTerm = offensiveTerms.some(term => {
        // Correspondência exata do termo ou termo com separadores comuns
        const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`, 'i');
        return termRegex.test(lowerCaseComment);
      });
      
      if (containsOffensiveTerm) {
        console.warn('Substituição manual: IA não detectou termo ofensivo no comentário');
        moderationResult = {
          isAppropriate: false,
          reason: "Linguagem ofensiva detectada. Comentários com palavrões ou termos discriminatórios não são permitidos."
        };
      }
      
      // Terceira verificação: Verificações de comprimento e caracteres
      // Verifica caracteres repetitivos (potencial spam)
      const repetitiveCharsRegex = /([a-zA-Z0-9])\1{4,}/;
      if (repetitiveCharsRegex.test(commentText)) {
        console.warn('Caracteres repetitivos detectados - possível spam');
        moderationResult = {
          isAppropriate: false,
          reason: "Comentário com caracteres repetitivos detectados. Possível spam."
        };
      }
      
      // Verifica capitalização excessiva (gritando)
      const words = commentText.split(/\s+/);
      const capsWords = words.filter(word => word.length > 2 && word === word.toUpperCase());
      if (words.length >= 5 && capsWords.length / words.length > 0.5) {
        console.warn('Capitalização excessiva detectada');
        moderationResult = {
          isAppropriate: false,
          reason: "Uso excessivo de letras maiúsculas. Evite 'gritar' nos comentários."
        };
      }
    }

    console.log("Resultado final da moderação:", JSON.stringify(moderationResult));
    
    return new Response(
      JSON.stringify(moderationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na função moderate-comment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
