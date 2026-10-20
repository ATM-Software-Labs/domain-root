import { CABECERAS_DIAGNOSTICO, catalogoResuelto, debeDiagnosticar, hechosDesde, htmlDiagnostico, slugsEnrutados } from './lib/diagnostico.js';
import { esRecursoEstatico, redirigeALabs } from './rutas-hub.js';

// connect-src lists hub origins so the apex status widget can probe them with no-cors fetch.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://trujillomingorance.com; font-src 'self'; connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com https://labs.trujillomingorance.com https://guides.trujillomingorance.com https://ai.trujillomingorance.com https://rewrite.trujillomingorance.com https://nutri.trujillomingorance.com https://invest.trujillomingorance.com https://savings.trujillomingorance.com https://focusguard.trujillomingorance.com https://tools.trujillomingorance.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
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
  if (hostname.startsWith('login.')) {
    return Response.redirect('https://myapps.microsoft.com/?tenantId=686bb631-e5e4-4fbf-bf55-835dd40fb263', 302);
  }
  if (hostname.startsWith('id.') || hostname.startsWith('auth.') || hostname.startsWith('security.')) {
    return Response.redirect('https://myaccount.microsoft.com/?tenantId=686bb631-e5e4-4fbf-bf55-835dd40fb263', 302);
  }
  const isApex = hostname === 'trujillomingorance.com' || hostname === 'www.trujillomingorance.com';
  if (isApex && redirigeALabs(path)) {
    return Response.redirect('https://labs.trujillomingorance.com' + (url.search || ''), 302);
  }

  // The zone cache ignores query strings on /favicon.ico, so the bare path
  // redirects to a versioned file. HTML links that file directly.
  if (path === '/favicon.ico') {
    return Response.redirect(`${url.origin}/assets/favicon.ico?v=20261020a`, 302);
  }

  if (!isApex && !esRecursoEstatico(path) && hostname.endsWith('.trujillomingorance.com')) {
    const lista = await catalogoResuelto(context.env);
    if (debeDiagnosticar(hostname, slugsEnrutados(lista))) {
      return new Response(htmlDiagnostico(hechosDesde(context.request), lista), {
        status: 404,
        headers: CABECERAS_DIAGNOSTICO,
      });
    }
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
