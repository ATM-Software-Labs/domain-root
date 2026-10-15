import { COPY, LOCALES } from "./copy.mjs";

export const ORIGIN = "https://trujillomingorance.com";
export const ASSET = "20261015d";

export const FAMILIES = {
  hub: { es: "/", en: "/en/", ca: "/ca/" },
  about: { es: "/sobre-mi", en: "/en/about", ca: "/ca/about" },
  terms: { es: "/terms", en: "/en/terms", ca: "/ca/terms" },
  privacy: { es: "/privacy", en: "/en/privacy", ca: "/ca/privacy" },
  brand: { es: "/brand/", en: "/en/brand/", ca: "/ca/brand/" },
  firma: { es: "/firma", en: "/en/firma", ca: "/ca/firma" }
};

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function hreflangLinks(paths) {
  const links = LOCALES.map((code) => {
    const copy = COPY[code];
    return `  <link rel="alternate" hreflang="${copy.lang}" href="${ORIGIN}${paths[code]}">`;
  });
  links.push(`  <link rel="alternate" hreflang="x-default" href="${ORIGIN}${paths.es}">`);
  return links.join("\n");
}

export function langNav(current, paths) {
  const label = COPY[current].langLabel;
  const links = LOCALES.map((code) => {
    const copy = COPY[code];
    const currentAttr = code === current ? ' aria-current="page"' : "";
    return `<a href="${paths[code]}" hreflang="${copy.lang}" lang="${copy.lang}" data-lang-switch="${copy.lang}"${currentAttr}>${code.toUpperCase()}<span class="visually-hidden"> ${esc(copy.langNames[code])}</span></a>`;
  }).join("");
  return `<nav class="lang" aria-label="${esc(label)}">${links}</nav>`;
}

function brandLockup(href, id = "") {
  const idAttr = id ? ` id="${id}"` : "";
  return `<a class="brand"${idAttr} href="${href}"><img class="brand-symbol" src="/brand/logo/symbol-dark.svg?v=${ASSET}" width="28" height="28" alt=""><span class="brand-mark">ATM</span> <span>Software Labs</span></a>`;
}

export function header(lang, paths, { ids = false } = {}) {
  const copy = COPY[lang];
  const id = (name) => (ids ? ` id="${name}"` : "");
  const hub = copy.path;
  return `<a class="skip"${id("skip-link")} href="#contenido">${esc(copy.skip)}</a>
  <div class="grid-overlay" aria-hidden="true"></div>
  <header class="site-header">
    <div class="wrap header-row">
      ${brandLockup(hub, ids ? "miss-brand" : "")}
      <div class="header-tools">
        <nav class="site-nav" aria-label="${esc(copy.navAria)}">
          <a${id("nav-eco")} href="${hub}#ecosistema">${esc(copy.navEco)}</a>
          <a${id("nav-status")} href="${hub}#estado">${esc(copy.navStatus)}</a>
          <a${id("nav-contact")} href="${FAMILIES.about[lang]}">${esc(copy.navContact)}</a>
        </nav>
        ${langNav(lang, paths)}
      </div>
    </div>
  </header>`;
}

export function footer(lang, { ids = false } = {}) {
  const copy = COPY[lang];
  const id = (name) => (ids ? ` id="${name}"` : "");
  return `<footer class="site-footer">
    <div class="wrap">
      ${brandLockup(copy.path, ids ? "foot-brand" : "")}
      <nav class="footer-nav" aria-label="${esc(copy.footerAria)}">
        <a href="https://github.com/ATM-Software-Labs" rel="me noopener noreferrer" target="_blank">GitHub<span class="visually-hidden" data-newtab> (${esc(copy.newTab)})</span></a>
        <a href="https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266" rel="me noopener noreferrer" target="_blank">LinkedIn<span class="visually-hidden" data-newtab> (${esc(copy.newTab)})</span></a>
        <a${id("foot-terms")} href="${FAMILIES.terms[lang]}">${esc(copy.termsLabel)}</a>
        <a${id("foot-privacy")} href="${FAMILIES.privacy[lang]}">${esc(copy.privacyLabel)}</a>
      </nav>
      <p class="credits">© 2026 ATM Software Labs · Alberto Trujillo Mingorance</p>
    </div>
  </footer>`;
}

export function headAssets() {
  return `<link rel="icon" href="/favicon.svg?v=${ASSET}" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico?v=${ASSET}" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${ASSET}" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/brand/tokens.css">
  <link rel="stylesheet" href="/css/fonts.css?v=${ASSET}">
  <link rel="stylesheet" href="/css/site.css?v=${ASSET}">`;
}

export function documentPage({
  lang,
  paths,
  title,
  description,
  robots = "index, follow",
  ogType = "website",
  main,
  scripts = `<script src="/js/hub.js?v=${ASSET}" defer></script>`
}) {
  const copy = COPY[lang];
  const canonical = `${ORIGIN}${paths[lang]}`;
  const image = `${lang === "es" ? "/assets/og-hub.png" : `/assets/og-hub-${lang}.png`}?v=${ASSET}`;
  return `<!DOCTYPE html>
<html lang="${copy.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Alberto Trujillo Mingorance">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#07080b">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
${hreflangLinks(paths)}
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="${copy.ogLocale}">
  <meta property="og:site_name" content="ATM Software Labs">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ORIGIN}${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ORIGIN}${image}">
  ${headAssets()}
</head>
<body>
  ${header(lang, paths)}
  <main id="contenido">
    ${main}
  </main>
  ${footer(lang)}
  ${scripts}
</body>
</html>
`;
}
