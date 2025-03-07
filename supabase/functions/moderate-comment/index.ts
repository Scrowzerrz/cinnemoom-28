import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { ModerationService } from "./moderationService.ts";

const apiKey = Deno.env.get("SUPABASE_API_KEY") || "";

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
    const { commentText } = await req.json();

    try {
      const result = await moderationService.moderateComment(commentText);
      return new Response(JSON.stringify(result), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error moderating comment:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
});
