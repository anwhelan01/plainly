interface ReleaseEvent { url: URL; req: Request }
export default async function releaseMiddleware(event: ReleaseEvent, next: () => unknown | Promise<unknown>) {
  if (event.url.pathname === '/healthz') return new Response('ok\n', { headers: { 'content-type':'text/plain', 'cache-control':'no-store' } });
  if (event.req.method === 'POST') {
    const origin = event.req.headers.get('origin');
    const allowed = process.env.PLAINLY_ORIGIN;
    // Optional AI use requires a single configured public origin.
    if (process.env.PLAINLY_REWRITE_ENABLED === 'true' && (!allowed || origin !== allowed)) return new Response('Forbidden', {status:403});
    const length = Number(event.req.headers.get('content-length') ?? 0);
    if (!Number.isFinite(length) || length > 40000) return new Response('Request too large', {status:413});
  }
  const response = await next();
  if (!(response instanceof Response)) return response;
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('X-Frame-Options','DENY');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if(event.req.method!=='GET') headers.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
