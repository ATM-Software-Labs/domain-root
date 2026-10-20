import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { redirigeALabs } from "../functions/rutas-hub.js";
import { COPY, LOCALES, PROJECTS, SITES } from "../site/copy.mjs";
import { ASSET, CSS_V, FAMILIES } from "../site/chrome.mjs";
import { legalPage } from "../site/legal.mjs";
import { renderAbout, renderBrand, renderBrandReadme, renderFirma, renderLegal, renderSitemap } from "../site/render-pages.mjs";
import { render404, renderHub } from "../site/render-hub.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const pages = {
  es: read("../public/index.html"),
  en: read("../public/en/index.html"),
  ca: read("../public/ca/index.html")
};
const css = read("../public/css/site.css");
const tokens = read("../public/brand/tokens.css");
const js = read("../public/js/hub.js");
const headers = read("../public/_headers");
const middleware = read("../functions/_middleware.js");
const redirects = read("../public/_redirects");
const sitemap = read("../public/sitemap.xml");
const notFound = read("../public/404.html");
const LIVE = PROJECTS.filter((item) => item.live).map((item) => item.slug);
const tokenNames = [...tokens.matchAll(/--atm-[a-z0-9-]+/g)].map((match) => match[0]);

test("generated pages match the renderer", () => {
  for (const lang of LOCALES) {
    assert.equal(pages[lang], renderHub(lang));
  }
  assert.equal(notFound, render404());
});

test("each language has hreflang, lang, meta and its own copy", () => {
  const keys = Object.keys(COPY.es).sort();
  for (const lang of LOCALES) {
    assert.deepEqual(Object.keys(COPY[lang]).sort(), keys);
    for (const [key, value] of Object.entries(COPY[lang])) {
      if (key === "stack" || key === "phrases" || key === "langNames") {
        assert.ok(Array.isArray(value) || typeof value === "object");
        for (const item of Object.values(value)) assert.equal(String(item).trim().length > 0, true);
      } else {
        assert.equal(typeof value, "string");
        assert.equal(value.includes("TODO"), false);
        assert.equal(value.includes("{{"), false);
        assert.equal(value.trim().length > 0, true);
      }
    }
    const html = pages[lang];
    const copy = COPY[lang];
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.match(html, new RegExp(`rel="canonical" href="https://trujillomingorance.com${copy.path.replace("/", "\\/")}"`));
    assert.match(html, /hreflang="es"/);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="ca"/);
    assert.match(html, /hreflang="x-default"/);
    assert.match(html, new RegExp(`property="og:locale" content="${copy.ogLocale}"`));
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:description"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="description"/);
    assert.match(html, new RegExp(copy.statement.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(html.includes("{{"), false);
    assert.doesNotMatch(html, /theme-btn|data-theme|cdnjs|fonts\.google|uptime|100\s*%/i);
    for (const other of LOCALES) {
      if (other === lang) continue;
      assert.equal(html.includes(COPY[other].statement), false, `${lang} contains ${other} manifesto`);
      assert.equal(html.includes(COPY[other].soon), false, `${lang} contains ${other} soon label`);
    }
  }
});

test("live hosts and the sibling sites are linked", () => {
  const shown = PROJECTS.filter((item) => item.highlight).map((item) => item.slug);
  const sites = SITES.map((item) => item.slug);
  assert.deepEqual(sites, ["labs", "invest", "charts", "alberto"]);
  for (const html of Object.values(pages)) {
    const linked = [...html.matchAll(/href="https:\/\/([a-z0-9-]+)\.trujillomingorance\.com"/g)].map((match) => match[1]);
    assert.deepEqual([...new Set(linked)].sort(), [...new Set([...shown, ...sites])].sort());
    assert.match(html, /href="https:\/\/charts\.trujillomingorance\.com"/);
    assert.match(html, /href="https:\/\/alberto\.trujillomingorance\.com"/);
    assert.equal(html.includes("savings.trujillomingorance.com"), false);
    assert.match(html, /\/css\/apex\.css/);
    assert.match(html, new RegExp(`href="${COPY[html === pages.es ? "es" : html === pages.en ? "en" : "ca"].aboutPath}"`));
    assert.match(html, /mailto:contact@trujillomingorance.com/);
    assert.match(html, /\/brand\/tokens\.css/);
    assert.match(html, /\/css\/site\.css/);
    assert.doesNotMatch(html, /hub\.css|legal\.css|cdnjs|font-awesome|styles-Mxz/);
    assert.match(html, /data-lang-switch="es"/);
    assert.match(html, /data-lang-switch="en"/);
    assert.match(html, /data-lang-switch="ca"/);
    assert.match(html, /atm_lang_choice/);
    assert.match(html, /id="hub"/);
  }
});

test("hub script stays quiet", () => {
  assert.match(js, /atm_lang_choice/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /ArrowRight/);
  assert.doesNotMatch(js, /console\./);
  assert.doesNotMatch(js, /charts/);
  assert.doesNotMatch(js, /fetch\s*\(/);
  assert.doesNotMatch(js, /100\s*%|uptime/i);
});

test("motion, landmarks and focus are present", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /grid-overlay/);
  assert.match(pages.es, /<header/);
  assert.match(pages.es, /<main[^>]*id="contenido"/);
  assert.match(pages.es, /<footer/);
  assert.match(pages.es, /class="stack"/);
  assert.match(pages.es, /class="gh-mark"/);
  assert.match(pages.es, /github\.com\/ATM-Software-Labs\/domain-root/);
  for (const project of PROJECTS.filter((item) => item.highlight)) {
    assert.match(pages.es, new RegExp(`github\\.com/ATM-Software-Labs/${project.repo}`));
    assert.equal(typeof project.repo, "string");
  }
  assert.match(pages.es, /Ver todos los servicios/);
  assert.match(pages.en, /View all services/);
  assert.match(pages.ca, /Veure tots els serveis/);
  assert.match(pages.es, /Repositorio de Guías en GitHub/);
  assert.match(pages.en, /GitHub repository for Guides/);
  assert.match(pages.ca, /Repositori de Guies a GitHub/);
});

test("404 contains every language", () => {
  assert.match(notFound, /noindex/);
  for (const lang of LOCALES) {
    assert.match(notFound, new RegExp(COPY[lang].notFoundTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(notFound, new RegExp(COPY[lang].notFoundBody.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(notFound, /atm_lang_choice/);
  }
  assert.equal(notFound.includes("{{"), false);
});

test("sitemap lists the language urls", () => {
  assert.match(sitemap, /https:\/\/trujillomingorance\.com\/</);
  assert.match(sitemap, /https:\/\/trujillomingorance\.com\/en\//);
  assert.match(sitemap, /https:\/\/trujillomingorance\.com\/ca\//);
  assert.match(sitemap, /hreflang="x-default"/);
});

test("language routes are not sent to labs", () => {
  assert.equal(redirigeALabs("/"), false);
  assert.equal(redirigeALabs("/en"), false);
  assert.equal(redirigeALabs("/en/"), false);
  assert.equal(redirigeALabs("/en/index.html"), false);
  assert.equal(redirigeALabs("/ca/"), false);
  assert.equal(redirigeALabs("/en/about"), false);
  assert.equal(redirigeALabs("/sobre-mi"), false);
  assert.equal(redirigeALabs("/css/site.css"), false);
  assert.equal(redirigeALabs("/brand/tokens.css"), false);
  assert.equal(redirigeALabs("/brand/"), false);
  assert.equal(redirigeALabs("/ca/about"), false);
  assert.equal(redirigeALabs("/en/terms"), false);
  assert.equal(redirigeALabs("/ca/privacy"), false);
  assert.equal(redirigeALabs("/firma/"), false);
  assert.equal(redirigeALabs("/favicon.svg"), false);
  assert.equal(redirigeALabs("/en/missing"), false);
  assert.equal(redirigeALabs("/no-such"), true);
  assert.match(middleware, /redirigeALabs/);
  assert.match(middleware, /myapps\.microsoft\.com/);
});

test("CSP allows hub probes and keeps the previous policy", () => {
  for (const file of [headers, middleware]) {
    for (const slug of LIVE) {
      assert.match(file, new RegExp(`https://${slug}\\.trujillomingorance\\.com`));
    }
    assert.doesNotMatch(file, /charts\.trujillomingorance\.com/);
    assert.match(file, /frame-ancestors 'none'/);
    assert.match(file, /https:\/\/static\.cloudflareinsights\.com/);
  }
  assert.match(redirects, /\/terms-of-service \/terms 301/);
});

test("og images are 1200 by 630 pngs", () => {
  for (const name of ["og-hub.png", "og-hub-en.png", "og-hub-ca.png"]) {
    const bytes = readFileSync(new URL(`../public/assets/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
  }
});

test("self-hosted fonts and svg favicon exist", () => {
  for (const name of [
    "inter-latin-400-normal.woff2",
    "inter-latin-500-normal.woff2",
    "jetbrains-mono-latin-400-normal.woff2",
    "jetbrains-mono-latin-500-normal.woff2"
  ]) {
    const bytes = readFileSync(new URL(`../public/assets/fonts/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "wOF2");
    assert.match(read("../public/css/fonts.css"), new RegExp(`/assets/fonts/${name}`));
    assert.match(read("../public/brand/fonts.css"), new RegExp(`https://trujillomingorance.com/assets/fonts/${name}`));
  }
  assert.match(read("../public/favicon.svg"), /<svg/);
  assert.doesNotMatch(css, /@font-face/);
  assert.doesNotMatch(tokens, /@font-face/);
});

test("shared pages match the renderer and the design system", () => {
  const about = {
    es: read("../public/sobre-mi/index.html"),
    en: read("../public/en/about/index.html"),
    ca: read("../public/ca/about/index.html")
  };
  const brand = {
    es: read("../public/brand/index.html"),
    en: read("../public/en/brand/index.html"),
    ca: read("../public/ca/brand/index.html")
  };
  const firma = {
    es: read("../public/firma/index.html"),
    en: read("../public/en/firma/index.html"),
    ca: read("../public/ca/firma/index.html")
  };
  for (const lang of LOCALES) {
    assert.equal(about[lang], renderAbout(lang));
    assert.equal(brand[lang], renderBrand(lang));
    assert.equal(firma[lang], renderFirma(lang));
    assert.equal(read(`../public/${lang === "es" ? "terms" : `${lang}/terms`}/index.html`), renderLegal("terms", lang));
    assert.equal(read(`../public/${lang === "es" ? "privacy" : `${lang}/privacy`}/index.html`), renderLegal("privacy", lang));
    for (const html of [about[lang], brand[lang], firma[lang], renderLegal("terms", lang), renderLegal("privacy", lang)]) {
      assert.match(html, new RegExp(`href="/brand/tokens\\.css\\?v=${CSS_V}"`));
      assert.match(html, /href="\/css\/site\.css/);
      assert.match(html, /class="site-header"/);
      assert.match(html, /class="site-footer"/);
      assert.match(html, /data-lang-switch="es"/);
      assert.match(html, /data-lang-switch="en"/);
      assert.match(html, /data-lang-switch="ca"/);
      assert.match(html, new RegExp(`href="${FAMILIES.about[lang]}"`));
      assert.doesNotMatch(html, /legal\.css|hub\.css|cdnjs|font-awesome|styles-Mxz|data-theme|theme-boot/);
    }
    assert.match(about[lang], /class="brand-symbol"/);
    assert.match(brand[lang], /#e6e8ec/);
    assert.match(brand[lang], /#07080b/);
    assert.doesNotMatch(brand[lang], /#8fe8c4|#9ad7e6/);
    const own = {
      es: "trazo blanco, sin color de acento",
      en: "white line, with no accent color",
      ca: "traç blanc, sense color d'accent"
    };
    assert.match(brand[lang], new RegExp(own[lang]));
    for (const other of LOCALES) {
      if (other !== lang) assert.equal(brand[lang].includes(own[other]), false);
    }
    assert.match(brand[lang], /\/brand\/labs\/favicon\.svg/);
    assert.match(brand[lang], /\/brand\/labs\/lockup\.svg/);
  }
  assert.equal(read("../public/terms.html"), renderLegal("terms", "es"));
  assert.equal(read("../public/privacy.html"), renderLegal("privacy", "es"));
  assert.equal(read("../public/firma.html"), renderFirma("es"));
  assert.equal(sitemap, renderSitemap());
  assert.equal(read("../public/brand/README.md"), renderBrandReadme());
  assert.match(about.es, /Soy Alberto Trujillo Mingorance, administrador de sistemas y ciberseguridad en Barcelona/);
  assert.match(about.en, /I am Alberto Trujillo Mingorance, a systems administrator and cybersecurity specialist in Barcelona/);
  assert.match(about.ca, /Sóc Alberto Trujillo Mingorance, administrador de sistemes i ciberseguretat a Barcelona/);
  assert.equal(about.en.includes("Soy Alberto"), false);
  assert.equal(about.ca.includes("I am Alberto"), false);
  for (const lang of LOCALES) {
    const terms = legalPage("terms", lang);
    const privacy = legalPage("privacy", lang);
    assert.match(renderLegal("terms", lang), new RegExp(terms.fingerprint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(renderLegal("privacy", lang), new RegExp(privacy.fingerprint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(renderLegal("terms", lang), /mailto:alberto@trujillomingorance.com/);
    assert.match(renderLegal("terms", lang), /OAuth 2\.0 PKCE/);
    assert.match(renderLegal("terms", lang), /localStorage/);
    assert.match(renderLegal("privacy", lang), /ta_session/);
    for (const other of LOCALES) {
      if (other === lang) continue;
      assert.equal(renderLegal("terms", lang).includes(legalPage("terms", other).fingerprint), false);
      assert.equal(renderLegal("privacy", lang).includes(legalPage("privacy", other).fingerprint), false);
    }
    for (const name of tokenNames) assert.match(brand[lang], new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(firma.es, /id="firma-container"/);
  assert.match(firma.es, /copiarFirma/);
  assert.match(firma.es, /ClipboardItem/);
  assert.match(firma.es, /data:image\/png;base64,/);
  assert.match(firma.en, /Change the role if you want/);
  assert.equal(firma.en.includes("Personaliza el cargo si quieres"), false);
  assert.match(notFound, /\/brand\/tokens\.css/);
  assert.match(notFound, /id="nav-eco"/);
  assert.doesNotMatch(notFound, /getElementById\("nav-status"\)/);
  assert.match(notFound, /id="foot-terms"/);
  for (const dead of [
    "../public/css/hub.css",
    "../public/css/legal.css",
    "../public/css/tokens.css",
    "../public/css/404.css",
    "../public/css/redirect.css",
    "../public/js/404.js",
    "../public/js/theme-boot.js",
    "../public/assets/styles-MxzP0LLl.css"
  ]) {
    assert.equal(existsSync(new URL(dead, import.meta.url)), false, dead);
  }
});

const pngSize0 = (path) => {
  const bytes = readFileSync(new URL(path, import.meta.url));
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};

test("brand files publish CORS for reuse", () => {
  assert.match(headers, /\/brand\/\*[\s\S]*Access-Control-Allow-Origin: \*/);
  assert.match(headers, /\/css\/site\.css[\s\S]*Access-Control-Allow-Origin: \*/);
  assert.match(headers, /\/assets\/fonts\/\*[\s\S]*Access-Control-Allow-Origin: \*/);
  assert.match(tokens, /--atm-bg:\s*#07080b/);
  assert.match(tokens, /--atm-text-hero:/);
  assert.match(tokens, /--atm-space-4:/);
  assert.match(tokens, /--atm-radius-md:/);
  assert.match(tokens, /--atm-motion:/);
  assert.match(css, /var\(--atm-bg\)/);
  assert.match(css, /var\(--atm-font-sans\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(sitemap, /\/brand\//);
  assert.match(sitemap, /\/ca\/about/);
  assert.match(sitemap, /\/en\/terms/);
  assert.match(sitemap, /\/ca\/privacy/);
  assert.match(sitemap, /\/firma/);
  assert.match(read("../public/brand/README.md"), /\/brand\/tokens\.css/);
  assert.match(pages.es, /class="brand-symbol"/);
  assert.match(pages.es, /<img class="brand-symbol" src="https:\/\/trujillomingorance\.com\/favicon\.svg\?v=[^"]+" width="28" height="28" alt="ATM Software Labs">/);
  assert.match(read("../public/site.webmanifest"), /\/icon-192\.png/);
  assert.match(read("../public/site.webmanifest"), /\/icon-512\.png/);
  assert.equal(redirigeALabs("/icon-192.png"), false);
  assert.equal(redirigeALabs("/icon-512.png"), false);
  assert.equal(redirigeALabs("/brand/labs/favicon.svg"), false);
  assert.equal(redirigeALabs("/brand/labs/lockup.svg"), false);
  assert.equal(redirigeALabs("/brand/labs/og.png"), false);
  assert.equal(redirigeALabs("/brand/labs/banner.png"), false);
  // The apex ships the exact icon set that labs.trujillomingorance.com serves.
  const favicon = read("../public/favicon.svg");
  assert.match(favicon, /<svg/);
  assert.equal(read("../public/brand/favicon.svg"), read("../brand/logo/symbol-dark.svg"));
  const labsIcon = read("../public/brand/labs/favicon.svg");
  assert.equal(labsIcon, favicon);
  assert.equal(labsIcon, read("../brand/labs/favicon.svg"));
  const bin = (path) => readFileSync(new URL(path, import.meta.url));
  for (const name of ["apple-touch-icon.png", "icon-192.png", "icon-512.png"]) {
    assert.deepEqual(bin(`../public/${name}`), bin(`../public/brand/labs/${name}`), name);
  }
  assert.deepEqual(bin("../public/assets/favicon.ico"), bin("../public/brand/labs/favicon.ico"));
  assert.deepEqual(bin("../public/favicon.ico"), bin("../public/assets/favicon.ico"));
  assert.deepEqual(pngSize0("../public/favicon-32.png"), [32, 32]);
  assert.equal(redirigeALabs("/favicon-32.png"), false);
  for (const href of ["/favicon.svg", "/assets/favicon.ico", "/favicon-32.png", "/apple-touch-icon.png", "/site.webmanifest"]) {
    assert.match(pages.es, new RegExp(`${href.replaceAll(".", "\\.")}\\?v=${ASSET}`), href);
  }
  const manifest = JSON.parse(read("../public/site.webmanifest"));
  assert.equal(manifest.theme_color, "#07080b");
  for (const icon of manifest.icons) assert.match(icon.src, new RegExp(`\\?v=${ASSET}$`));
  const labsLockup = read("../public/brand/labs/lockup.svg");
  assert.equal(labsLockup, read("../brand/labs/lockup.svg"));
  assert.match(labsLockup, /aria-label="ATM Software Labs\. Labs"/);
  assert.doesNotMatch(labsLockup, /#8fe8c4|#9ad7e6/);
  assert.match(pages.es, new RegExp(`/assets/favicon\\.ico\\?v=${ASSET}`));
  assert.match(pages.es, new RegExp(`/assets/og-hub\\.png\\?v=${ASSET}`));
  assert.match(middleware, new RegExp(`/assets/favicon\\.ico\\?v=${ASSET}`));
  assert.match(redirects, new RegExp(`/favicon\\.ico /assets/favicon\\.ico\\?v=${ASSET} 302`));
  assert.equal(existsSync(new URL("../public/assets/favicon.ico", import.meta.url)), true);
  const pngSize = (path) => {
    const bytes = readFileSync(new URL(path, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  };
  assert.deepEqual(pngSize("../public/apple-touch-icon.png"), [180, 180]);
  assert.deepEqual(pngSize("../public/icon-192.png"), [192, 192]);
  assert.deepEqual(pngSize("../public/icon-512.png"), [512, 512]);
  assert.deepEqual(pngSize("../brand/export/github-avatar.png"), [500, 500]);
  assert.deepEqual(pngSize("../brand/export/linkedin-logo.png"), [400, 400]);
  assert.deepEqual(pngSize("../brand/export/linkedin-cover.png"), [1128, 191]);
  assert.deepEqual(pngSize("../brand/export/github-social.png"), [1280, 640]);
  assert.deepEqual(pngSize("../brand/export/og.png"), [1200, 630]);
  assert.deepEqual(pngSize("../public/brand/export/og.png"), [1200, 630]);
  assert.deepEqual(pngSize("../public/brand/labs/apple-touch-icon.png"), [180, 180]);
  assert.deepEqual(pngSize("../public/brand/labs/icon-192.png"), [192, 192]);
  assert.deepEqual(pngSize("../public/brand/labs/icon-512.png"), [512, 512]);
  assert.deepEqual(pngSize("../public/brand/labs/og.png"), [1200, 630]);
  assert.deepEqual(pngSize("../public/brand/labs/banner.png"), [1128, 191]);
  for (const path of ["../public/brand/labs/favicon.ico", "../public/favicon.ico"]) {
    const ico = readFileSync(new URL(path, import.meta.url));
    assert.equal(ico.readUInt16LE(4) >= 2, true);
    const sizes = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + i * 16]);
    assert.ok(sizes.includes(16) && sizes.includes(32), path);
  }
  for (const name of ["symbol-dark.svg", "symbol-light.svg", "symbol-white.svg", "symbol-black.svg", "lockup-horizontal-dark.svg", "lockup-stacked-dark.svg", "wordmark-dark.svg"]) {
    assert.equal(existsSync(new URL(`../brand/logo/${name}`, import.meta.url)), true, name);
    assert.equal(existsSync(new URL(`../public/brand/logo/${name}`, import.meta.url)), true, name);
    assert.match(read("../public/brand/index.html"), new RegExp(name.replace(".", "\\.")));
  }
});
