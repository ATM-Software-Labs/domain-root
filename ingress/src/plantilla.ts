import { endpointsVisibles, type Estado, type NetworkEndpoint } from './catalogo.ts'
import type { HechosBorde } from './hechos.ts'
import { CSS } from './estilos.gen.ts'

export const CABECERAS_DIAGNOSTICO: Record<string, string> = {
  'content-type': 'text/html; charset=UTF-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'cache-control': 'private, no-cache, no-store, must-revalidate',
  'x-robots-tag': 'noindex, nofollow, noarchive, nosnippet',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

function escapar(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function punto(status: Estado): string {
  if (status === 'active') return 'h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400'
  if (status === 'maintenance') return 'h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400'
  return 'h-1.5 w-1.5 shrink-0 rounded-full bg-white/30'
}

function ficha(item: NetworkEndpoint): string {
  const etiqueta = item.status === 'active' ? 'operativo' : item.status
  return `<a class="flex h-[42px] min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 no-underline transition-colors hover:border-white/20 hover:bg-white/[0.02]" href="${escapar(item.targetUrl)}"><span class="truncate font-mono text-[12px] font-semibold tracking-tight text-[#e6edf3]">${escapar(item.slug)}.</span><span class="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-white/40">${escapar(item.category)}</span><span class="${punto(item.status)}" title="${escapar(etiqueta)}"></span></a>`
}

const SCRIPT = `(function () {
  var body = document.body;
  var dato = {
    host: body.getAttribute('data-host') || '',
    path: body.getAttribute('data-path') || '',
    colo: body.getAttribute('data-colo') || '',
    tls: body.getAttribute('data-tls') || '',
    http: body.getAttribute('data-http') || '',
    ray: body.getAttribute('data-ray') || ''
  };
  var clave = 'atm_edge_hist';
  function leer() {
    try { return JSON.parse(sessionStorage.getItem(clave) || '[]'); } catch (e) { return []; }
  }
  function guardar(lista) {
    try { sessionStorage.setItem(clave, JSON.stringify(lista.slice(0, 6))); } catch (e) {}
  }
  var prev = leer().filter(function (x) { return x && (x.ray !== dato.ray || x.host !== dato.host); });
  prev.unshift({ host: dato.host, path: dato.path, ray: dato.ray, colo: dato.colo });
  guardar(prev);
  var btn = document.getElementById('btn-copy');
  var histBtn = document.getElementById('btn-hist');
  var panel = document.getElementById('hist');
  if (btn) btn.addEventListener('click', function () {
    var text = ['Host: ' + dato.host, 'Ruta: ' + dato.path, 'DNS: *.trujillomingorance.com -> Proxied', 'Estado: Wildcard Active · No Upstream Mapping', 'Transporte: ' + dato.tls + ' / ' + dato.http, 'Colo: ' + dato.colo, 'Ray: ' + dato.ray].join('\\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copiado';
        setTimeout(function () { btn.textContent = 'Copiar diagnóstico'; }, 1600);
      }).catch(function () {});
    }
  });
  function pintar() {
    if (!panel) return;
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    var lista = leer();
    if (!lista.length) {
      var vacio = document.createElement('p');
      vacio.textContent = 'Sin visitas previas en esta sesión.';
      panel.appendChild(vacio);
      return;
    }
    lista.forEach(function (item) {
      var p = document.createElement('p');
      p.className = 'truncate';
      p.textContent = (item.host || '') + (item.path || '') + '  ' + (item.ray || '');
      panel.appendChild(p);
    });
  }
  if (histBtn && panel) histBtn.addEventListener('click', function () {
    if (panel.hasAttribute('hidden')) { pintar(); panel.removeAttribute('hidden'); }
    else panel.setAttribute('hidden', '');
  });
})();`

export function htmlDiagnostico(hechos: HechosBorde, catalogo: readonly NetworkEndpoint[]): string {
  const visibles = endpointsVisibles(catalogo)
  const online = visibles.filter((item) => item.status === 'active').length
  const host = escapar(hechos.host)
  const path = escapar(hechos.path || '/')
  const colo = escapar(hechos.colo)
  const tls = escapar(hechos.tlsVersion)
  const http = escapar(hechos.httpProtocol)
  const ray = escapar(hechos.rayId)
  const fichas = visibles.map(ficha).join('')

  return `<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="color-scheme" content="dark">
<title>Ruta perimetral no convergente</title>
<style>${CSS}</style>
</head>
<body class="h-screen overflow-hidden bg-[#08090a] font-sans text-[#e6edf3] antialiased max-lg:h-auto max-lg:min-h-screen max-lg:overflow-auto" data-host="${host}" data-path="${path}" data-colo="${colo}" data-tls="${tls}" data-http="${http}" data-ray="${ray}">
  <div class="mx-auto flex h-screen max-h-screen w-full max-w-6xl flex-col px-5 py-3 max-lg:h-auto max-lg:max-h-none">
    <header class="flex h-8 shrink-0 items-center justify-between gap-3">
      <p class="truncate font-mono text-[11px] tracking-widest text-white/70">ATM LABS / EDGE INGRESS PROTOCOL</p>
      <p class="shrink-0 font-mono text-[11px] tracking-wide text-white/45">CF-EDGE: ${colo} · RAY: ${ray}</p>
    </header>
    <main class="mt-3 flex min-h-0 flex-1 flex-col">
      <div class="flex items-center gap-2">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
        <p class="font-mono text-[11px] tracking-widest text-amber-400">404 UNMAPPED_EDGE_ROUTE</p>
      </div>
      <h1 class="mt-2 text-[22px] font-medium leading-none tracking-tight">Ruta perimetral no convergente</h1>
      <p class="mt-2 truncate text-[13px] leading-5 text-white/55">El comodín resolvió en Anycast y no hay un upstream asociado a este host.</p>
      <dl class="mt-3 grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-4">
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Host solicitado</dt>
          <dd class="truncate font-mono text-[12px] text-[#e6edf3]">${host}${path}</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Resolución DNS</dt>
          <dd class="truncate font-mono text-[12px]">*.trujillomingorance.com → Proxied</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Estado L7</dt>
          <dd class="truncate font-mono text-[12px] text-amber-400">Wildcard Active · No Upstream Mapping</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Cifrado / protocolo</dt>
          <dd class="truncate font-mono text-[12px]">${tls} / ${http} via Cloudflare Edge</dd>
        </div>
      </dl>
      <div class="relative mt-3 flex shrink-0 flex-wrap items-center gap-2">
        <a class="inline-flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-[12px] text-[#e6edf3] no-underline hover:border-white/20 hover:bg-white/[0.02]" href="https://labs.trujillomingorance.com">Volver a Labs</a>
        <button id="btn-copy" class="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-transparent px-3 text-[12px] text-white/80 hover:border-white/20 hover:bg-white/[0.02]" type="button">Copiar diagnóstico</button>
        <button id="btn-hist" class="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-transparent px-3 text-[12px] text-white/80 hover:border-white/20 hover:bg-white/[0.02]" type="button">Historial</button>
        <div id="hist" hidden class="absolute left-0 top-9 z-10 max-h-28 w-full max-w-sm overflow-auto rounded-lg border border-white/[0.08] bg-[#0d1117] p-2 font-mono text-[11px] leading-5 text-white/70"></div>
      </div>
      <section class="mt-4 flex min-h-0 flex-1 flex-col">
        <div class="mb-2 flex shrink-0 items-baseline justify-between gap-3">
          <h2 class="font-mono text-[11px] tracking-widest text-white/50">ACTIVE ROUTE DIRECTORY</h2>
          <p class="font-mono text-[11px] text-emerald-400">${online} endpoints online</p>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">${fichas}</div>
        </div>
      </section>
    </main>
  </div>
  <script>${SCRIPT}</script>
</body>
</html>`
}
