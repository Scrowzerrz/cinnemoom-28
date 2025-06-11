
/**
 * Sanitizes a JSON string to make it parseable
 * @param str The string potentially containing JSON
 * @returns Cleaned JSON string
 */
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

/**
 * Extracts a JSON pattern from a text using regular expressions
 * @param text The text to search for JSON
 * @returns Extracted JSON string or null if not found
 */
export function extractJSONPattern(text: string): string | null {
  const jsonPattern = /\{(?:[^{}]|"(?:\\.|[^"\\])*")*\}/g;
  const matches = text.match(jsonPattern);
  return matches ? matches[0] : null;
}

/**
 * Checks if a comment contains offensive terms
 * @param texto The comment text to check
 * @returns Boolean indicating if offensive terms were found
 */
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
    const termRegex = new RegExp(`\\b${term}\\b|\\b${term}[\\s\\.,!?]|[\\s\\.,!?]${term}\\b`, 'i');
    return termRegex.test(lowerCaseComment);
  });
}
