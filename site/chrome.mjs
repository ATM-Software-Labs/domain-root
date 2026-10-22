import { COPY, LOCALES, SITES } from "./copy.mjs";
import { createRequire } from "node:module";
const { atmNet } = createRequire(import.meta.url)("./atm-net.cjs");

export const ORIGIN = "https://trujillomingorance.com";
export const ASSET = "20261020a";
// Stylesheets get their own version so CSS changes do not churn favicon/manifest URLs.
export const CSS_V = "20261020b";

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
  return `<a class="brand"${idAttr} href="${href}"><img class="brand-symbol" src="${ORIGIN}/favicon.svg?v=${ASSET}" width="28" height="28" alt="ATM Software Labs"><span class="brand-mark">ATM</span> <span>Software Labs</span></a>`;
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
  const tab = `<span class="visually-hidden" data-newtab> (${esc(copy.newTab)})</span>`;
  const sites = SITES.filter((site) => site.slug !== "alberto").map((site) => `<a href="${site.url}">${esc(site.name)}</a>`).join("\n          ");
  return `<footer class="site-footer">
    <div class="wrap">
      <div class="foot-brand">
        ${brandLockup(copy.path, ids ? "foot-brand" : "")}
      </div>
      <nav class="footer-nav" aria-label="${esc(copy.footerAria)}">
        <div class="foot-col">
          <p class="foot-title"${id("foot-sites-title")}>${esc(copy.footSites)}</p>
          ${sites}
        </div>
        <div class="foot-col">
          <p class="foot-title"${id("foot-profiles-title")}>${esc(copy.profiles)}</p>
          <a href="https://github.com/ATM-Software-Labs" rel="me noopener noreferrer" target="_blank">GitHub${tab}</a>
          <a href="https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266" rel="me noopener noreferrer" target="_blank">LinkedIn${tab}</a>
          <a href="https://github.com/ATM-Software-Labs/domain-root" rel="noopener noreferrer" target="_blank">domain-root${tab}</a>
        </div>
        <div class="foot-col">
          <p class="foot-title">Legal</p>
          <a${id("foot-terms")} href="${FAMILIES.terms[lang]}">${esc(copy.termsLabel)}</a>
          <a${id("foot-privacy")} href="${FAMILIES.privacy[lang]}">${esc(copy.privacyLabel)}</a>
          <a${id("foot-brandpage")} href="${FAMILIES.brand[lang]}">${esc(copy.brandLabel)}</a>
        </div>
      </nav>
    </div>
    ${atmNet("apex", lang, ORIGIN + FAMILIES.privacy[lang], ORIGIN + FAMILIES.terms[lang])}
  </footer>`;
}

export function headAssets() {
  return `<link rel="icon" href="/favicon.svg?v=${ASSET}" type="image/svg+xml">
  <link rel="icon" href="/assets/favicon.ico?v=${ASSET}" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=${ASSET}">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${ASSET}" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest?v=${ASSET}">
  <link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/brand/tokens.css?v=${CSS_V}">
  <link rel="stylesheet" href="/css/fonts.css?v=${CSS_V}">
  <link rel="stylesheet" href="/css/site.css?v=${CSS_V}">
  <link rel="stylesheet" href="/css/apex.css?v=${CSS_V}">`;
}

export const THEME_META = `<meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#07080b" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)">`;

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
  ${THEME_META}
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
  <meta name="twitter:image:alt" content="${esc(title)}">
  ${headAssets()}
</head>
<body>
  ${header(lang, paths)}
  <main id="contenido">
    ${main}
  </main>
  ${footer(lang)}
  ${scripts}
  <script src="/js/atm-internal.js?v=20261022" defer></script>
</body>
</html>
`;
}
