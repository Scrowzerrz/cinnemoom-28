
/**
 * Verifies if a comment contains repetitive characters (possible spam)
 * @param texto The comment text to check
 * @returns Boolean indicating if repetitive characters were found
 */
export function verificarCaracteresRepetitivos(texto: string): boolean {
  const repetitiveCharsRegex = /([a-zA-Z0-9])\1{4,}/;
  return repetitiveCharsRegex.test(texto);
}

/**
 * Verifies if a comment contains excessive capitalization (shouting)
 * @param texto The comment text to check
 * @returns Boolean indicating if excessive capitalization was found
 */
export function verificarCapitalizacaoExcessiva(texto: string): boolean {
  const words = texto.split(/\s+/);
  const capsWords = words.filter(word => word.length > 2 && word === word.toUpperCase());
  return words.length >= 5 && capsWords.length / words.length > 0.5;
}

/**
 * Verifies if a comment is within the allowed length limit
 * @param texto The comment text to check
 * @param limite The maximum allowed length (default: 2000)
 * @returns Boolean indicating if the comment is within the allowed length
 */
export function verificarTamanhoComentario(texto: string, limite = 2000): boolean {
  return texto.length <= limite;
}
