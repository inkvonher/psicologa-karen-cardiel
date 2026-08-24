// middleware.js - Vercel Edge Middleware para Negociación de Contenido Markdown (Accept: text/markdown)

export const config = {
  matcher: ['/', '/index.html', '/index']
};

export default async function middleware(request) {
  const accept = request.headers.get('accept') || '';

  if (accept.includes('text/markdown')) {
    try {
      const markdownUrl = new URL('/index.md', request.url);
      const res = await fetch(markdownUrl);
      if (res.ok) {
        const text = await res.text();
        const tokens = Math.round(text.length / 4);

        return new Response(text, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'x-markdown-tokens': String(tokens),
            'Access-Control-Allow-Origin': '*',
            'Vary': 'Accept',
            'Link': '</.well-known/api-catalog>; rel="api-catalog", </.well-known/ai-catalog.json>; rel="ai-catalog", </.well-known/agent-skills/index.json>; rel="agent-skills", </.well-known/mcp/server-card.json>; rel="service-desc", </auth.md>; rel="describedby", </docs/api.html>; rel="service-doc"'
          }
        });
      }
    } catch (e) {
      console.error('Error serving markdown content negotiation:', e);
    }
  }
}
