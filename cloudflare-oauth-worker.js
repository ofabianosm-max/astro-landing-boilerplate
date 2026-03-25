// Cloudflare Worker: OAuth proxy para Decap CMS + GitHub
// Deploy este arquivo separadamente no painel da Cloudflare
// Variáveis de ambiente necessárias:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigins = [
      `https://${env.SITE_DOMAIN}`,
    ];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.join(','),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}/callback`,
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302
      );
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );
      const data = await response.json();
      const token = data.access_token;

      return new Response(
        `<script>
          window.opener.postMessage(
            'authorization:github:success:{"token":"${token}","provider":"github"}',
            '*'
          );
          window.close();
        </script>`,
        { headers: { 'Content-Type': 'text/html', ...corsHeaders } }
      );
    }

    return new Response('Not found', { status: 404 });
  },
};
