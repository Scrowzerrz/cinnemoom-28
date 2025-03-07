
/**
 * Service for communicating with AI APIs for content moderation
 */
export class AIApiService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    if (!apiKey || apiKey.trim() === "") {
      console.error("ERRO: Chave da API não fornecida ao AIApiService");
    }
  }
  
  /**
   * Calls the OpenRouter API for content moderation
   * @param prompt The formatted prompt to send to the AI
   * @returns Response from the API
   */
  public async callModerationAPI(prompt: string): Promise<Response> {
    console.log("Chamando API de moderação com prompt de tamanho:", prompt.length);
    
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error("Chave da API não configurada. Impossível fazer requisição à API de moderação.");
    }
    
    try {
      console.log("Usando chave de API (primeiros 4 caracteres):", this.apiKey.substring(0, 4) + "...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://cinemoon.app",
          "X-Title": "CineMoon",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "qwen/qwq-32b:free",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "max_tokens": 131000
        })
      });
      
      // Log response status to help with debugging
      console.log(`API Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta da API:", errorText);
        throw new Error(`Error calling moderation API: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error("Erro na chamada à API de moderação:", error);
      throw error;
    }
  }
}
