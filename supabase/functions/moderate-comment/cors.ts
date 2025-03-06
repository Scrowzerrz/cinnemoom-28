
// Cabeçalhos CORS para permitir solicitações de qualquer origem
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para lidar com solicitações OPTIONS (preflight CORS)
export function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Função auxiliar para criar uma resposta JSON com cabeçalhos CORS
export function createJsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
