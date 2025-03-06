
// Funções utilitárias para processamento de texto e verificações de conteúdo

// Função para verificar termos ofensivos em um comentário
export function verificarTermosOfensivos(texto: string): boolean {
  const lowerCaseComment = texto.toLowerCase();
  const offensiveTerms = [
    'porra', 'caralho', 'merda', 'fdp', 'puta', 'viado', 'bicha', 
    'cú', 'cu', 'foda-se', 'fuck', 'buceta', 'piroca', 'cacete', 
    'pinto', 'retardado', 'corno', 'vagabunda', 'vadia', 'otário', 
    'imbecil', 'babaca', 'pica', 'idiota', 'bosta', 'burro', 'foda',
    'negro', 'preto', 'macaco'
  ];
  
  return offensiveTerms.some(term => {
    // Correspondência exata do termo ou termo com separadores comuns
    const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`, 'i');
    return termRegex.test(lowerCaseComment);
  });
}

// Função para verificar caracteres repetitivos (possível spam)
export function verificarCaracteresRepetitivos(texto: string): boolean {
  const repetitiveCharsRegex = /([a-zA-Z0-9])\1{4,}/;
  return repetitiveCharsRegex.test(texto);
}

// Função para verificar capitalização excessiva (gritando)
export function verificarCapitalizacaoExcessiva(texto: string): boolean {
  const words = texto.split(/\s+/);
  const capsWords = words.filter(word => word.length > 2 && word === word.toUpperCase());
  return words.length >= 5 && capsWords.length / words.length > 0.5;
}

// Função para limpar e extrair JSON de uma string
export function sanitizeJSONString(str: string): string {
  // Remove qualquer coisa antes da primeira chave
  let cleaned = str.substring(str.indexOf('{'));
  // Remove qualquer coisa depois da última chave
  cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
  // Remove markdown e formatações
  cleaned = cleaned.replace(/```json|```/g, '');
  // Remove quebras de linha e espaços extras
  cleaned = cleaned.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '').trim();
  // Corrige aspas inconsistentes
  cleaned = cleaned.replace(/([''])/g, '"');
  // Garante que todas as propriedades e valores estejam com aspas duplas
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
  return cleaned;
}

// Função para extrair JSON usando expressão regular
export function extractJSONPattern(text: string): string | null {
  const jsonPattern = /\{(?:[^{}]|"(?:\\.|[^"\\])*")*\}/g;
  const matches = text.match(jsonPattern);
  return matches ? matches[0] : null;
}

// Verifica se o comentário está dentro do limite de tamanho permitido
export function verificarTamanhoComentario(texto: string, limite = 2000): boolean {
  return texto.length <= limite;
}
