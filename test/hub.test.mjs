import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const index = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../public/css/hub.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../public/js/hub.js", import.meta.url), "utf8");
const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");

const LIVE = ["labs", "guides", "ai", "rewrite", "nutri", "invest", "savings", "focusguard", "tools"];

test("spanish dark landing with required copy", () => {
  assert.match(index, /<html lang="es">/);
  assert.match(index, /name="color-scheme" content="dark"/);
  assert.match(index, /ATM Software Labs/);
  assert.match(index, /Alberto Trujillo Mingorance/);
  assert.match(index, /Ingeniería de sistemas, arquitectura de red, Web3 y código abierto/);
  assert.match(index, /© 2026 ATM Software Labs · Alberto Trujillo Mingorance/);
  assert.match(index, /href="https:\/\/github\.com\/ATM-Software-Labs"/);
  assert.match(index, /href="https:\/\/www\.linkedin\.com\/in\/alberto-trujillo-mingorance-288237266"/);
  assert.match(index, /property="og:image"/);
  assert.doesNotMatch(index, /theme-btn|data-theme|cdnjs|fonts\.google/);
  assert.doesNotMatch(index, /uptime/i);
  assert.doesNotMatch(index, /100\s*%/);
});

test("live hosts are linked and charts is not", () => {
  const linked = [...index.matchAll(/href="https:\/\/([a-z0-9-]+)\.trujillomingorance\.com"/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(linked)].sort(), [...LIVE].sort());
  assert.equal(index.includes('href="https://charts.trujillomingorance.com"'), false);
  assert.match(index, /próximamente/);
  assert.match(index, /charts\.trujillomingorance\.com/);
});

test("status probe is a silent no-cors check", () => {
  assert.match(js, /mode:\s*"no-cors"/);
  assert.match(js, /method:\s*"HEAD"/);
  assert.match(js, /en línea/);
  assert.match(js, /sin respuesta/);
  assert.match(js, /\.js-label/);
  assert.doesNotMatch(js, /console\./);
  assert.doesNotMatch(js, /charts/);
  assert.doesNotMatch(js, /100\s*%|uptime/i);
  for (const slug of LIVE) {
    assert.match(js, new RegExp(`"${slug}"`));
  }
});

test("motion, landmarks and focus are present", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(index, /<header/);
  assert.match(index, /<main[^>]*id="contenido"/);
  assert.match(index, /<footer/);
  assert.match(index, /aria-live="polite"/);
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
  assert.match(middleware, /myapps\.microsoft\.com/);
  assert.match(middleware, /savings\.trujillomingorance\.com/);
  assert.match(redirects, /\/terms-of-service \/terms 301/);
});

test("og image is a 1200 by 630 png", () => {
  const bytes = readFileSync(new URL("../public/assets/og-hub.png", import.meta.url));
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
});

test("self-hosted fonts are woff2", () => {
  for (const name of [
    "inter-latin-400-normal.woff2",
    "inter-latin-500-normal.woff2",
    "jetbrains-mono-latin-400-normal.woff2",
    "jetbrains-mono-latin-500-normal.woff2"
  ]) {
    const bytes = readFileSync(new URL(`../public/assets/fonts/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString(), "wOF2");
  }
});
