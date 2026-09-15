const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
};

export async function onRequest(context) {
  const url = context.request && context.request.url ? new URL(context.request.url) : null;
  const hostname = url ? url.hostname.toLowerCase() : '';
  const path = url ? url.pathname : '';

  if (hostname.startsWith('savings.') || hostname.startsWith('finance.')) {
    return Response.redirect('https://savings.trujillomingorance.com' + path + (url.search || ''), 301);
  }
  if (hostname.startsWith('guides.')) {
    return Response.redirect('https://guides.trujillomingorance.com' + path + (url.search || ''), 301);
  }
  const isLegalOrAsset = (
    path === '/terms' || path === '/terms.html' || path === '/terms-of-service' ||
    path === '/privacy' || path === '/privacy.html' || path === '/privacy-policy' ||
    path === '/firma' || path === '/firma.html' ||
    path.startsWith('/css/') || path.startsWith('/js/') || path === '/avatar.png' || path === '/favicon.ico'
  );

  if ((hostname === 'trujillomingorance.com' || hostname === 'www.trujillomingorance.com') && !isLegalOrAsset) {
    return Response.redirect('https://labs.trujillomingorance.com' + (url.search || ''), 302);
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
