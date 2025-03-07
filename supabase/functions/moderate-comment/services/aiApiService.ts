
/**
 * Service for communicating with AI APIs for content moderation
 */
export class AIApiService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Calls the OpenRouter API for content moderation
   * @param prompt The formatted prompt to send to the AI
   * @returns Response from the API
   */
  public async callModerationAPI(prompt: string): Promise<Response> {
    return await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
  }
}
