// src/catalogo.ts
var ALIAS_PASSTHROUGH = ["finance", "guias", "groq", "doc", "d", "go", "rocky"];
var CATALOGO = [
  { slug: "labs", name: "ATM Labs", category: "Production", targetUrl: "https://labs.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "nutri", name: "NutriFit", category: "Production", targetUrl: "https://nutri.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "ai", name: "Trujillo AI Studio", category: "Production", targetUrl: "https://ai.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "rewrite", name: "Rewrite AI", category: "Production", targetUrl: "https://rewrite.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "invest", name: "INVEST", category: "Production", targetUrl: "https://invest.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "focusguard", name: "FocusGuard", category: "Production", targetUrl: "https://focusguard.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "guides", name: "Engineering Guides", category: "Utility", targetUrl: "https://guides.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "savings", name: "Savings", category: "Utility", targetUrl: "https://savings.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "tools", name: "Herramientas", category: "Utility", targetUrl: "https://tools.trujillomingorance.com", status: "active", isPublic: true },
  { slug: "alberto", name: "Portfolio", category: "Production", targetUrl: "https://alberto.trujillomingorance.com", status: "active", isPublic: true }
];
var CATEGORIAS = ["Production", "Internal", "Gateway", "Utility"];
var ESTADOS = ["active", "maintenance", "restricted"];
function validarEntrada(value) {
  if (!value || typeof value !== "object") return null;
  const row = value;
  const slug = typeof row.slug === "string" ? row.slug.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{1,32}$/.test(slug)) return null;
  const name = typeof row.name === "string" ? row.name.trim().slice(0, 48) : "";
  if (!name) return null;
  if (!CATEGORIAS.includes(row.category)) return null;
  if (!ESTADOS.includes(row.status)) return null;
  if (typeof row.isPublic !== "boolean") return null;
  let url;
  try {
    url = new URL(String(row.targetUrl));
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (host !== "trujillomingorance.com" && !host.endsWith(".trujillomingorance.com")) return null;
  return {
    slug,
    name,
    category: row.category,
    targetUrl: url.origin,
    status: row.status,
    isPublic: row.isPublic
  };
}
function validarCatalogo(value) {
  if (!Array.isArray(value)) return [];
  const vistos = /* @__PURE__ */ new Set();
  const salida = [];
  for (const item of value) {
    const entrada = validarEntrada(item);
    if (!entrada || vistos.has(entrada.slug)) continue;
    vistos.add(entrada.slug);
    salida.push(entrada);
  }
  return salida;
}
async function catalogoResuelto(env) {
  try {
    const remoto = env?.CATALOG ? await env.CATALOG.get("endpoints") : "";
    const texto = (remoto || env?.EDGE_CATALOG_JSON || "").trim();
    if (!texto) return CATALOGO;
    const lista = validarCatalogo(JSON.parse(texto));
    return lista.length ? lista : CATALOGO;
  } catch {
    return CATALOGO;
  }
}
function slugsEnrutados(lista) {
  return [...lista.map((item) => item.slug), ...ALIAS_PASSTHROUGH];
}
function endpointsVisibles(lista) {
  return lista.filter((item) => item.isPublic);
}

// src/hechos.ts
function esApex(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === "trujillomingorance.com" || host === "www.trujillomingorance.com";
}
function esMapeado(hostname, slugs) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const sufijo = ".trujillomingorance.com";
  if (!host.endsWith(sufijo)) return false;
  const etiqueta = host.slice(0, -sufijo.length);
  if (!etiqueta || etiqueta.includes(".")) return false;
  return slugs.includes(etiqueta);
}
function debeDiagnosticar(hostname, slugs) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host.endsWith(".trujillomingorance.com")) return false;
  if (esApex(host)) return false;
  return !esMapeado(host, slugs);
}
function tlsLegible(value) {
  const raw = typeof value === "string" ? value : "";
  if (/tlsv?1\.2/i.test(raw)) return "TLS 1.2";
  if (/tlsv?1\.3/i.test(raw) || !raw) return "TLS 1.3";
  return "TLS 1.3";
}
function httpLegible(value) {
  const raw = typeof value === "string" ? value : "";
  if (/http\/?2/i.test(raw)) return "HTTP/2";
  if (/http\/?3/i.test(raw) || /h3/i.test(raw) || !raw) return "HTTP/3";
  return "HTTP/3";
}
function hechosDesde(request) {
  const url = new URL(request.url);
  const cf = request.cf;
  const colo = typeof cf?.colo === "string" && /^[A-Z0-9]{2,8}$/.test(cf.colo) ? cf.colo : "MAD";
  const ray = request.headers.get("cf-ray") || "N/A";
  return {
    host: url.hostname.toLowerCase(),
    path: url.pathname || "/",
    colo,
    tlsVersion: tlsLegible(cf?.tlsVersion),
    httpProtocol: httpLegible(cf?.httpProtocol),
    rayId: ray.slice(0, 64)
  };
}

// src/estilos.gen.ts
var CSS = '*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.absolute{position:absolute}.relative{position:relative}.left-0{left:0}.top-9{top:2.25rem}.z-10{z-index:10}.mx-auto{margin-left:auto;margin-right:auto}.mb-2{margin-bottom:.5rem}.ml-auto{margin-left:auto}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.h-1\\.5{height:.375rem}.h-8{height:2rem}.h-\\[42px\\]{height:42px}.h-full{height:100%}.h-screen{height:100vh}.max-h-28{max-height:7rem}.max-h-screen{max-height:100vh}.min-h-0{min-height:0}.w-1\\.5{width:.375rem}.w-full{width:100%}.min-w-0{min-width:0}.max-w-6xl{max-width:72rem}.max-w-sm{max-width:24rem}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.items-baseline{align-items:baseline}.justify-between{justify-content:space-between}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.border{border-width:1px}.border-white\\/\\[0\\.08\\]{border-color:hsla(0,0%,100%,.08)}.bg-\\[\\#08090a\\]{--tw-bg-opacity:1;background-color:rgb(8 9 10/var(--tw-bg-opacity,1))}.bg-\\[\\#0d1117\\]{--tw-bg-opacity:1;background-color:rgb(13 17 23/var(--tw-bg-opacity,1))}.bg-amber-400{--tw-bg-opacity:1;background-color:rgb(251 191 36/var(--tw-bg-opacity,1))}.bg-emerald-400{--tw-bg-opacity:1;background-color:rgb(52 211 153/var(--tw-bg-opacity,1))}.bg-transparent{background-color:transparent}.bg-white\\/30{background-color:hsla(0,0%,100%,.3)}.p-2{padding:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.text-\\[10px\\]{font-size:10px}.text-\\[11px\\]{font-size:11px}.text-\\[12px\\]{font-size:12px}.text-\\[13px\\]{font-size:13px}.text-\\[22px\\]{font-size:22px}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.leading-5{line-height:1.25rem}.leading-none{line-height:1}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.text-\\[\\#e6edf3\\]{--tw-text-opacity:1;color:rgb(230 237 243/var(--tw-text-opacity,1))}.text-amber-400{--tw-text-opacity:1;color:rgb(251 191 36/var(--tw-text-opacity,1))}.text-emerald-400{--tw-text-opacity:1;color:rgb(52 211 153/var(--tw-text-opacity,1))}.text-white\\/40{color:hsla(0,0%,100%,.4)}.text-white\\/45{color:hsla(0,0%,100%,.45)}.text-white\\/50{color:hsla(0,0%,100%,.5)}.text-white\\/55{color:hsla(0,0%,100%,.55)}.text-white\\/70{color:hsla(0,0%,100%,.7)}.text-white\\/80{color:hsla(0,0%,100%,.8)}.no-underline{text-decoration-line:none}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}@media (prefers-reduced-motion:reduce){.animate-pulse{animation:none!important}}.hover\\:border-white\\/20:hover{border-color:hsla(0,0%,100%,.2)}.hover\\:bg-white\\/\\[0\\.02\\]:hover{background-color:hsla(0,0%,100%,.02)}@media not all and (min-width:1024px){.max-lg\\:h-auto{height:auto}.max-lg\\:max-h-none{max-height:none}.max-lg\\:min-h-screen{min-height:100vh}.max-lg\\:overflow-auto{overflow:auto}}@media (min-width:1024px){.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}}';

// src/plantilla.ts
var CABECERAS_DIAGNOSTICO = {
  "content-type": "text/html; charset=UTF-8",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  "cache-control": "private, no-cache, no-store, must-revalidate",
  "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()"
};
function escapar(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function punto(status) {
  if (status === "active") return "h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400";
  if (status === "maintenance") return "h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400";
  return "h-1.5 w-1.5 shrink-0 rounded-full bg-white/30";
}
function ficha(item) {
  const etiqueta = item.status === "active" ? "operativo" : item.status;
  return `<a class="flex h-[42px] min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 no-underline transition-colors hover:border-white/20 hover:bg-white/[0.02]" href="${escapar(item.targetUrl)}"><span class="truncate font-mono text-[12px] font-semibold tracking-tight text-[#e6edf3]">${escapar(item.slug)}.</span><span class="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-white/40">${escapar(item.category)}</span><span class="${punto(item.status)}" title="${escapar(etiqueta)}"></span></a>`;
}
var SCRIPT = `(function () {
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
    var text = ['Host: ' + dato.host, 'Ruta: ' + dato.path, 'DNS: *.trujillomingorance.com -> Proxied', 'Estado: Wildcard Active \xB7 No Upstream Mapping', 'Transporte: ' + dato.tls + ' / ' + dato.http, 'Colo: ' + dato.colo, 'Ray: ' + dato.ray].join('\\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copiado';
        setTimeout(function () { btn.textContent = 'Copiar diagn\xF3stico'; }, 1600);
      }).catch(function () {});
    }
  });
  function pintar() {
    if (!panel) return;
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    var lista = leer();
    if (!lista.length) {
      var vacio = document.createElement('p');
      vacio.textContent = 'Sin visitas previas en esta sesi\xF3n.';
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
})();`;
function htmlDiagnostico(hechos, catalogo) {
  const visibles = endpointsVisibles(catalogo);
  const online = visibles.filter((item) => item.status === "active").length;
  const host = escapar(hechos.host);
  const path = escapar(hechos.path || "/");
  const colo = escapar(hechos.colo);
  const tls = escapar(hechos.tlsVersion);
  const http = escapar(hechos.httpProtocol);
  const ray = escapar(hechos.rayId);
  const fichas = visibles.map(ficha).join("");
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
      <p class="shrink-0 font-mono text-[11px] tracking-wide text-white/45">CF-EDGE: ${colo} \xB7 RAY: ${ray}</p>
    </header>
    <main class="mt-3 flex min-h-0 flex-1 flex-col">
      <div class="flex items-center gap-2">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
        <p class="font-mono text-[11px] tracking-widest text-amber-400">404 UNMAPPED_EDGE_ROUTE</p>
      </div>
      <h1 class="mt-2 text-[22px] font-medium leading-none tracking-tight">Ruta perimetral no convergente</h1>
      <p class="mt-2 truncate text-[13px] leading-5 text-white/55">El comod\xEDn resolvi\xF3 en Anycast y no hay un upstream asociado a este host.</p>
      <dl class="mt-3 grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-4">
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Host solicitado</dt>
          <dd class="truncate font-mono text-[12px] text-[#e6edf3]">${host}${path}</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Resoluci\xF3n DNS</dt>
          <dd class="truncate font-mono text-[12px]">*.trujillomingorance.com \u2192 Proxied</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Estado L7</dt>
          <dd class="truncate font-mono text-[12px] text-amber-400">Wildcard Active \xB7 No Upstream Mapping</dd>
        </div>
        <div class="min-w-0 rounded-lg border border-white/[0.08] bg-[#0d1117] px-3 py-2">
          <dt class="text-[10px] uppercase tracking-wider text-white/40">Cifrado / protocolo</dt>
          <dd class="truncate font-mono text-[12px]">${tls} / ${http} via Cloudflare Edge</dd>
        </div>
      </dl>
      <div class="relative mt-3 flex shrink-0 flex-wrap items-center gap-2">
        <a class="inline-flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-[12px] text-[#e6edf3] no-underline hover:border-white/20 hover:bg-white/[0.02]" href="https://labs.trujillomingorance.com">Volver a Labs</a>
        <button id="btn-copy" class="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-transparent px-3 text-[12px] text-white/80 hover:border-white/20 hover:bg-white/[0.02]" type="button">Copiar diagn\xF3stico</button>
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
</html>`;
}
export {
  CABECERAS_DIAGNOSTICO,
  CATALOGO,
  catalogoResuelto,
  debeDiagnosticar,
  esMapeado,
  hechosDesde,
  htmlDiagnostico,
  slugsEnrutados,
  validarCatalogo
};
