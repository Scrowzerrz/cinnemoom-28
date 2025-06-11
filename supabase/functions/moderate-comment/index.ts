
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { ModerationService } from "./moderationService.ts";

// Obtém a chave da API a partir das variáveis de ambiente
const apiKey = Deno.env.get("OPENROUTER_API_KEY") || "";

if (!apiKey) {
  console.error("AVISO: OPENROUTER_API_KEY não está definida no ambiente!");
}

const moderationService = new ModerationService(apiKey);

serve(async (req) => {
  const { method } = req;

  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  }

  if (method === "POST") {
    try {
      const { commentText } = await req.json();
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: "Chave de API não configurada no servidor. Contate o administrador."
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await moderationService.moderateComment(commentText);
      return new Response(JSON.stringify(result), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Erro ao moderar comentário:", error);
      return new Response(
        JSON.stringify({
          error: "Erro interno no servidor",
          details: error.message
        }), 
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  return new Response("Method Not Allowed", { 
    status: 405,
    headers: corsHeaders
  });
});
