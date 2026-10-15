import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ASSET, FAMILIES, ORIGIN, esc, footer, headAssets, header, hreflangLinks } from "./chrome.mjs";
import { COPY, LOCALES, PROJECTS, projectName } from "./copy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const ICONS = {
  labs: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  guides: '<path d="M5 5.2A2.2 2.2 0 0 1 7.2 3H20v15.2H7.2A2.2 2.2 0 0 0 5 20.4z"/><path d="M5 5.2A2.2 2.2 0 0 1 7.2 7.4H20"/>',
  ai: '<path d="M12 3.2l1.5 4.8 4.8 1.5-4.8 1.5L12 16.8l-1.5-4.8L5.7 10.5l4.8-1.5z"/>',
  rewrite: '<path d="M4 20h4L18.2 9.8 14.2 5.8 4 16z"/><path d="M13 7.2l3.8 3.8"/>',
  nutri: '<path d="M5 19.2C5 11.5 11.2 5 20 4c-1 8.5-7.2 15.2-15 15.2z"/><path d="M8.2 16.2c2-2.2 4.2-5 7.2-8"/>',
  invest: '<path d="M4 19.5V10"/><path d="M10 19.5V5"/><path d="M16 19.5v-6.5"/><path d="M3.5 19.5h17"/>',
  charts: '<path d="M4 16.5l4.8-4.8 3.2 3.2 7.5-7.6"/><path d="M14.8 7.3H20v5.2"/>',
  savings: '<rect x="3" y="6.5" width="18" height="12" rx="2"/><path d="M3 10.5h18"/><path d="M16 14.6h.1"/>',
  focusguard: '<path d="M12 3.2l7.5 2.8v5.6c0 4.6-3.1 7.4-7.5 8.6-4.4-1.2-7.5-4-7.5-8.6V6z"/>',
  tools: '<path d="M14.7 6.4a3.6 3.6 0 0 0-5 5L4.2 16.9 7.1 19.8l5.5-5.5a3.6 3.6 0 0 0 5-5L15.2 11.7 12.3 8.8z"/>'
};

function icon(name) {
  return `<svg class="hub-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g></svg>`;
}

const REDIRECT = `<script>(function(){try{var h=location.hostname;if(h!=="trujillomingorance.com"&&h!=="www.trujillomingorance.com")return;var p=location.pathname;if(p!=="/"&&p!=="/index.html")return;if(localStorage.getItem("atm_lang_choice")||localStorage.getItem("atm_lang_auto"))return;var n=(navigator.language||"").toLowerCase();var w=n.indexOf("en")===0?"en":n.indexOf("ca")===0?"ca":"es";var ua=navigator.userAgent||"";var bot=navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|headless/i.test(ua);localStorage.setItem("atm_lang_auto",w);if(bot||w==="es")return;location.replace(w==="en"?"/en/":"/ca/");}catch(e){}})();</script>`;

function cards(copy) {
  return PROJECTS.map((project) => {
    const name = projectName(project, copy.lang);
    const desc = project.desc[copy.lang];
    const host = `${project.slug}.trujillomingorance.com`;
    const inner = `<span class="hub-top">${icon(project.icon)}<span class="hub-host">${host}</span></span><span class="hub-name">${esc(name)}</span><span class="hub-desc">${esc(desc)}</span>`;
    if (!project.live) {
      return `<li><div class="hub-card is-soon" data-hub-item tabindex="0">${inner}<span class="hub-state">${esc(copy.soon)}</span></div></li>`;
    }
    return `<li><a class="hub-card" data-hub-item href="https://${host}">${inner}</a></li>`;
  }).join("\n          ");
}

function rows(copy) {
  return PROJECTS.map((project) => {
    const probe = project.live ? ' data-probe="1"' : "";
    const state = project.live ? "idle" : "soon";
    const label = project.live ? copy.pending : copy.soon;
    return `<tr data-slug="${project.slug}" data-state="${state}"${probe}>
                <th scope="row">${project.slug}<span class="fqdn">.trujillomingorance.com</span></th>
                <td class="js-state"><span class="dot" aria-hidden="true"></span><span class="js-label">${esc(label)}</span></td>
                <td class="js-ms ms">—</td>
              </tr>`;
  }).join("\n              ");
}

export function renderHub(lang) {
  const copy = COPY[lang];
  const client = {
    phrases: copy.phrases,
    online: copy.online,
    offline: copy.offline,
    checking: copy.checking,
    checkingLabel: copy.checkingLabel,
    summary: copy.summary,
    browser: copy.browser
  };
  const json = JSON.stringify(client).replaceAll("<", "\\u003c");
  const og = lang === "es" ? "/assets/og-hub.png" : `/assets/og-hub-${lang}.png`;
  return `<!DOCTYPE html>
<html lang="${copy.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(copy.title)}</title>
  <meta name="description" content="${esc(copy.description)}">
  <meta name="author" content="Alberto Trujillo Mingorance">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#07080b">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${ORIGIN}${copy.path}">
${hreflangLinks(FAMILIES.hub)}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${copy.ogLocale}">
  <meta property="og:site_name" content="ATM Software Labs">
  <meta property="og:title" content="${esc(copy.title)}">
  <meta property="og:description" content="${esc(copy.description)}">
  <meta property="og:url" content="${ORIGIN}${copy.path}">
  <meta property="og:image" content="${ORIGIN}${og}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(copy.statement)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(copy.title)}">
  <meta name="twitter:description" content="${esc(copy.description)}">
  <meta name="twitter:image" content="${ORIGIN}${og}">
  ${headAssets()}
  ${REDIRECT}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "ATM Software Labs",
        "url": "${ORIGIN}/",
        "inLanguage": "${copy.lang}",
        "sameAs": ["https://github.com/ATM-Software-Labs"]
      },
      {
        "@type": "Person",
        "name": "Alberto Trujillo Mingorance",
        "url": "${ORIGIN}/",
        "sameAs": ["https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266"]
      }
    ]
  }
  </script>
</head>
<body>
  ${header(copy.lang, FAMILIES.hub)}
  <main id="contenido">
    <section class="hero wrap" aria-labelledby="identidad">
      <p class="kicker"><span>01</span>${esc(copy.kicker)}</p>
      <h1 id="identidad">Alberto Trujillo Mingorance</h1>
      <p class="statement">${esc(copy.statement)}</p>
      <p class="term" aria-hidden="true"><span class="term-prompt">atm@labs:~$</span> <span id="term-line"></span><span class="caret"></span></p>
      <ul class="stack" aria-label="${esc(copy.stackLabel)}">
        ${copy.stack.map((item) => `<li>${esc(item)}</li>`).join("\n        ")}
      </ul>
    </section>

    <section class="block" id="ecosistema" aria-labelledby="ecosistema-titulo">
      <div class="wrap">
        <p class="section-kicker"><span>02</span>${esc(copy.ecoKicker)}</p>
        <h2 id="ecosistema-titulo">${esc(copy.ecoTitle)}</h2>
        <p class="section-lead">${esc(copy.ecoLead)}</p>
        <p class="visually-hidden" id="hub-hint">${esc(copy.hubHint)}</p>
        <ul class="hub-grid" id="hub" aria-describedby="hub-hint">
          ${cards(copy)}
        </ul>
      </div>
    </section>

    <section class="block" id="estado" aria-labelledby="estado-titulo">
      <div class="wrap">
        <p class="section-kicker"><span>03</span>${esc(copy.statusKicker)}</p>
        <h2 id="estado-titulo">${esc(copy.statusTitle)}</h2>
        <p class="section-lead">${esc(copy.statusLead)}</p>
        <div class="status-panel">
          <div class="status-bar">
            <p id="estado-resumen" aria-live="polite">${esc(copy.pendingSummary)}</p>
            <button type="button" class="btn" id="estado-btn">${esc(copy.recheck)}</button>
          </div>
          <noscript><p class="note">${esc(copy.noscript)}</p></noscript>
          <table class="status-table" id="estado-tabla">
            <caption>${esc(copy.caption)}</caption>
            <thead>
              <tr>
                <th scope="col">${esc(copy.colHost)}</th>
                <th scope="col">${esc(copy.colState)}</th>
                <th scope="col">${esc(copy.colLatency)}</th>
              </tr>
            </thead>
            <tbody>
              ${rows(copy)}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="block" id="contacto" aria-labelledby="contacto-titulo">
      <div class="wrap contact-block">
        <p class="section-kicker"><span>04</span>${esc(copy.aboutKicker)}</p>
        <h2 id="contacto-titulo">${esc(copy.aboutTitle)}</h2>
        <p class="section-lead">${esc(copy.aboutBody)}</p>
        <div class="contact-links">
          <a class="btn" href="${copy.aboutPath}">${esc(copy.aboutLink)}</a>
          <a class="btn" href="mailto:contact@trujillomingorance.com">contact@trujillomingorance.com</a>
        </div>
      </div>
    </section>
  </main>
  ${footer(copy.lang)}
  <script type="application/json" id="hub-copy">${json}</script>
  <script src="/js/hub.js?v=${ASSET}" defer></script>
</body>
</html>
`;
}

export function render404() {
  const fields = ["title", "body", "home", "href", "skip", "navEco", "navStatus", "navContact", "navAria", "langLabel", "terms", "privacy", "footerAria", "newTab", "about"];
  const store = LOCALES.map((code) => {
    const copy = COPY[code];
    const values = {
      title: copy.notFoundTitle,
      body: copy.notFoundBody,
      home: copy.notFoundHome,
      href: copy.path,
      skip: copy.skip,
      navEco: copy.navEco,
      navStatus: copy.navStatus,
      navContact: copy.navContact,
      navAria: copy.navAria,
      langLabel: copy.langLabel,
      terms: copy.termsLabel,
      privacy: copy.privacyLabel,
      footerAria: copy.footerAria,
      newTab: copy.newTab,
      about: copy.aboutPath
    };
    const nodes = fields.map((field) => `      <p data-field="${field}">${esc(values[field])}</p>`).join("\n");
    return `<div data-lang="${copy.lang}">\n${nodes}\n    </div>`;
  }).join("\n      ");
  const es = COPY.es;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(es.notFoundTitle)} · ATM Software Labs</title>
  <meta name="description" content="${esc(es.notFoundBody)}">
  <meta name="robots" content="noindex, nofollow">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#07080b">
  ${headAssets()}
</head>
<body>
  ${header("es", FAMILIES.hub, { ids: true })}
  <main id="contenido">
    <section class="hero wrap miss">
      <p class="kicker"><span>404</span>ATM Software Labs</p>
      <h1 id="miss-title">${esc(es.notFoundTitle)}</h1>
      <p class="statement" id="miss-body">${esc(es.notFoundBody)}</p>
      <p class="contact-links"><a class="btn" id="miss-home" href="/">${esc(es.notFoundHome)}</a></p>
      <div hidden id="miss-store">
      ${store}
      </div>
    </section>
  </main>
  ${footer("es", { ids: true })}
  <script>
    (function () {
      function text(block, field) {
        return block.querySelector('[data-field="' + field + '"]').textContent;
      }
      function pick() {
        var path = location.pathname || "/";
        if (path === "/en" || path.indexOf("/en/") === 0) return "en";
        if (path === "/ca" || path.indexOf("/ca/") === 0) return "ca";
        try {
          var choice = localStorage.getItem("atm_lang_choice");
          if (choice === "es" || choice === "en" || choice === "ca") return choice;
        } catch (e) {}
        var nav = (navigator.language || "").toLowerCase();
        if (nav.indexOf("en") === 0) return "en";
        if (nav.indexOf("ca") === 0) return "ca";
        return "es";
      }
      function apply(lang) {
        var block = document.querySelector('#miss-store [data-lang="' + lang + '"]');
        if (!block) return;
        document.documentElement.lang = lang;
        var title = text(block, "title");
        var href = text(block, "href");
        document.title = title + " · ATM Software Labs";
        document.getElementById("miss-title").textContent = title;
        document.getElementById("miss-body").textContent = text(block, "body");
        document.getElementById("skip-link").textContent = text(block, "skip");
        var homeLink = document.getElementById("miss-home");
        homeLink.textContent = text(block, "home");
        homeLink.setAttribute("href", href);
        document.getElementById("miss-brand").setAttribute("href", href);
        var footBrand = document.getElementById("foot-brand");
        if (footBrand) footBrand.setAttribute("href", href);
        document.getElementById("nav-eco").textContent = text(block, "navEco");
        document.getElementById("nav-eco").setAttribute("href", href + "#ecosistema");
        document.getElementById("nav-status").textContent = text(block, "navStatus");
        document.getElementById("nav-status").setAttribute("href", href + "#estado");
        document.getElementById("nav-contact").textContent = text(block, "navContact");
        document.getElementById("nav-contact").setAttribute("href", text(block, "about"));
        document.querySelector(".site-nav").setAttribute("aria-label", text(block, "navAria"));
        document.querySelector(".lang").setAttribute("aria-label", text(block, "langLabel"));
        document.querySelector(".footer-nav").setAttribute("aria-label", text(block, "footerAria"));
        document.getElementById("foot-terms").textContent = text(block, "terms");
        document.getElementById("foot-terms").setAttribute("href", lang === "es" ? "/terms" : "/" + lang + "/terms");
        document.getElementById("foot-privacy").textContent = text(block, "privacy");
        document.getElementById("foot-privacy").setAttribute("href", lang === "es" ? "/privacy" : "/" + lang + "/privacy");
        var tab = " (" + text(block, "newTab") + ")";
        document.querySelectorAll("[data-newtab]").forEach(function (node) { node.textContent = tab; });
        document.querySelectorAll("[data-lang-switch]").forEach(function (link) {
          if (link.getAttribute("data-lang-switch") === lang) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      }
      document.addEventListener("click", function (event) {
        var node = event.target;
        while (node && node !== document) {
          if (node.getAttribute && node.getAttribute("data-lang-switch")) {
            try { localStorage.setItem("atm_lang_choice", node.getAttribute("data-lang-switch")); } catch (e) {}
            return;
          }
          node = node.parentNode;
        }
      });
      apply(pick());
    })();
  </script>
</body>
</html>
`;
}

function writePages() {
  const targets = {
    es: join(ROOT, "public/index.html"),
    en: join(ROOT, "public/en/index.html"),
    ca: join(ROOT, "public/ca/index.html")
  };
  for (const lang of LOCALES) {
    mkdirSync(dirname(targets[lang]), { recursive: true });
    writeFileSync(targets[lang], renderHub(lang));
  }
  writeFileSync(join(ROOT, "public/404.html"), render404());
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) writePages();
