import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ASSET, FAMILIES, ORIGIN, esc, footer, headAssets, header, hreflangLinks } from "./chrome.mjs";
import { COPY, LOCALES, PROJECTS, projectName } from "./copy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const GITHUB_MARK = `<svg class="gh-mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>`;

const REDIRECT = `<script>(function(){try{var h=location.hostname;if(h!=="trujillomingorance.com"&&h!=="www.trujillomingorance.com")return;var p=location.pathname;if(p!=="/"&&p!=="/index.html")return;if(localStorage.getItem("atm_lang_choice")||localStorage.getItem("atm_lang_auto"))return;var n=(navigator.language||"").toLowerCase();var w=n.indexOf("en")===0?"en":n.indexOf("ca")===0?"ca":"es";var ua=navigator.userAgent||"";var bot=navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|headless/i.test(ua);localStorage.setItem("atm_lang_auto",w);if(bot||w==="es")return;location.replace(w==="en"?"/en/":"/ca/");}catch(e){}})();</script>`;

function highlights(copy) {
  return PROJECTS.filter((project) => project.highlight).map((project) => {
    const name = projectName(project, copy.lang);
    const host = `${project.slug}.trujillomingorance.com`;
    const label = copy.githubLabel.replaceAll("{name}", name);
    return `<li class="work-item">
            <div>
              <a class="work-name" data-hub-item href="https://${host}">${esc(name)}</a>
              <p class="work-desc">${esc(project.desc[copy.lang])}</p>
              <p class="work-host">${host}</p>
            </div>
            <a class="gh-link" href="https://github.com/ATM-Software-Labs/${project.repo}" aria-label="${esc(label)}" rel="noopener noreferrer" target="_blank">${GITHUB_MARK}<span class="visually-hidden"> (${esc(copy.newTab)})</span></a>
          </li>`;
  }).join("\n          ");
}

export function renderHub(lang) {
  const copy = COPY[lang];
  const json = "{}";
  const og = `${lang === "es" ? "/assets/og-hub.png" : `/assets/og-hub-${lang}.png`}?v=${ASSET}`;
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
      <p class="kicker">${esc(copy.kicker)}</p>
      <h1 id="identidad">Alberto Trujillo Mingorance</h1>
      <p class="role">${esc(copy.role)}</p>
      <p class="statement">${esc(copy.statement)}</p>
      <ul class="stack" aria-label="${esc(copy.stackLabel)}">
        ${copy.stack.map((item) => `<li>${esc(item)}</li>`).join("\n        ")}
      </ul>
      <div class="contact-links">
        <a class="btn" href="https://github.com/ATM-Software-Labs" rel="me noopener noreferrer" target="_blank">GitHub<span class="visually-hidden"> (${esc(copy.newTab)})</span></a>
        <a class="btn" href="https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266" rel="me noopener noreferrer" target="_blank">LinkedIn<span class="visually-hidden"> (${esc(copy.newTab)})</span></a>
        <a class="btn" href="mailto:contact@trujillomingorance.com">${esc(copy.contact)}</a>
      </div>
    </section>

    <section class="block" id="ecosistema" aria-labelledby="ecosistema-titulo">
      <div class="wrap">
        <p class="section-kicker">${esc(copy.ecoKicker)}</p>
        <h2 id="ecosistema-titulo">${esc(copy.ecoTitle)}</h2>
        <p class="section-lead">${esc(copy.ecoLead)}</p>
        <p class="visually-hidden" id="hub-hint">${esc(copy.hubHint)}</p>
        <ul class="work-list" id="hub" aria-describedby="hub-hint">
          ${highlights(copy)}
        </ul>
        <p class="services"><a href="https://labs.trujillomingorance.com">${esc(copy.services)}</a></p>
      </div>
    </section>

    <section class="block" id="contacto" aria-labelledby="contacto-titulo">
      <div class="wrap contact-block">
        <p class="section-kicker">${esc(copy.aboutKicker)}</p>
        <h2 id="contacto-titulo">${esc(copy.aboutTitle)}</h2>
        <p class="section-lead">${esc(copy.aboutBody)}</p>
        <p><a class="contact-mail" href="mailto:contact@trujillomingorance.com">contact@trujillomingorance.com</a></p>
        <div class="contact-links">
          <a class="btn" href="${copy.aboutPath}">${esc(copy.aboutLink)}</a>
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
