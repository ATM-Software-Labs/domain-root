import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { COPY, LOCALES, PROJECTS } from "../site/copy.mjs";
import { render404, renderHub } from "../site/render-hub.mjs";
import { redirigeALabs } from "../functions/rutas-hub.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const pages = {
  es: read("../public/index.html"),
  en: read("../public/en/index.html"),
  ca: read("../public/ca/index.html")
};
const css = read("../public/css/hub.css");
const js = read("../public/js/hub.js");
const headers = read("../public/_headers");
const middleware = read("../functions/_middleware.js");
const redirects = read("../public/_redirects");
const sitemap = read("../public/sitemap.xml");
const notFound = read("../public/404.html");
const LIVE = PROJECTS.filter((item) => item.live).map((item) => item.slug);

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

test("live hosts are linked and charts is not", () => {
  for (const html of Object.values(pages)) {
    const linked = [...html.matchAll(/href="https:\/\/([a-z0-9-]+)\.trujillomingorance\.com"/g)].map((match) => match[1]);
    assert.deepEqual([...new Set(linked)].sort(), [...LIVE].sort());
    assert.equal(html.includes('href="https://charts.trujillomingorance.com"'), false);
    assert.match(html, /charts\.trujillomingorance\.com/);
    assert.match(html, /href="\/sobre-mi"/);
    assert.match(html, /mailto:contact@trujillomingorance.com/);
    assert.match(html, /data-lang-switch="es"/);
    assert.match(html, /data-lang-switch="en"/);
    assert.match(html, /data-lang-switch="ca"/);
    assert.match(html, /atm_lang_choice/);
    assert.match(html, /id="hub"/);
  }
});

test("status probe is a silent no-cors check", () => {
  assert.match(js, /mode:\s*"no-cors"/);
  assert.match(js, /method:\s*"HEAD"/);
  assert.match(js, /atm_lang_choice/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /ArrowRight/);
  assert.match(js, /tr\[data-probe\]/);
  assert.doesNotMatch(js, /console\./);
  assert.doesNotMatch(js, /charts/);
  assert.doesNotMatch(js, /100\s*%|uptime/i);
});

test("motion, landmarks and focus are present", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /grid-overlay/);
  assert.match(pages.es, /<header/);
  assert.match(pages.es, /<main[^>]*id="contenido"/);
  assert.match(pages.es, /<footer/);
  assert.match(pages.es, /aria-live="polite"/);
  assert.match(pages.es, /class="stack"/);
  assert.match(pages.es, /class="hub-icon"/);
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
  assert.equal(redirigeALabs("/css/hub.css"), false);
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
  }
  assert.match(read("../public/favicon.svg"), /<svg/);
});
