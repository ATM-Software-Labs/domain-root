import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ASSET, FAMILIES, ORIGIN, documentPage, esc } from "./chrome.mjs";
import { COPY, LOCALES } from "./copy.mjs";
import { legalPage } from "./legal.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EMBED = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "firma-embed.html"), "utf8");
const TOKENS = readFileSync(join(ROOT, "public/brand/tokens.css"), "utf8");
const LOGO_KINDS = ["symbol", "lockup-horizontal", "lockup-stacked", "wordmark"];
const LOGO_VARIANTS = ["dark", "light", "white", "black"];
export const LOGO_MASTERS = LOGO_KINDS.flatMap((kind) => LOGO_VARIANTS.map((variant) => `${kind}-${variant}.svg`));
export const LOGO_EXPORTS = ["github-avatar.png", "linkedin-logo.png", "linkedin-cover.png", "github-social.png", "og.png"];
export const LOGO_ICONS = ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
export const LABS_FILES = ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "og.png", "lockup.svg", "banner.png"];

const ABOUT = {
  es: {
    title: "Sobre mí | Alberto Trujillo Mingorance",
    description: "Perfil profesional de Alberto Trujillo Mingorance en Barcelona. Especialista en administración de sistemas, ciberseguridad, infraestructura cloud e identidad.",
    kicker: "Perfil",
    role: "Administrador de Sistemas y Ciberseguridad · Barcelona",
    body: "Soy Alberto Trujillo Mingorance, administrador de sistemas y ciberseguridad en Barcelona. En este espacio centralizo mis proyectos técnicos, documentación de infraestructura y herramientas.",
    email: "Correo"
  },
  en: {
    title: "About | Alberto Trujillo Mingorance",
    description: "Professional profile of Alberto Trujillo Mingorance in Barcelona. Systems administration, cybersecurity, cloud infrastructure and identity.",
    kicker: "Profile",
    role: "Systems Administrator and Cybersecurity · Barcelona",
    body: "I am Alberto Trujillo Mingorance, a systems administrator and cybersecurity specialist in Barcelona. This space brings together my technical projects, infrastructure notes and tools.",
    email: "Email"
  },
  ca: {
    title: "Sobre mi | Alberto Trujillo Mingorance",
    description: "Perfil professional d'Alberto Trujillo Mingorance a Barcelona. Administració de sistemes, ciberseguretat, infraestructura al núvol i identitat.",
    kicker: "Perfil",
    role: "Administrador de sistemes i ciberseguretat · Barcelona",
    body: "Sóc Alberto Trujillo Mingorance, administrador de sistemes i ciberseguretat a Barcelona. En aquest espai centralitzo els meus projectes tècnics, la documentació d'infraestructura i les eines.",
    email: "Correu"
  }
};

const BRAND = {
  es: {
    title: "Sistema de diseño · ATM Software Labs",
    description: "Tokens de color, tipo, espacio, radio y movimiento, y la cabecera y el pie compartidos de ATM Software Labs.",
    kicker: "Marca",
    h1: "Sistema de diseño",
    lead: "Contrato público para el ápice y los subdominios, empezando por labs. Enlaza estos archivos; no copies los valores.",
    use: "Uso",
    tokensHeading: "Tokens",
    shell: "Cabecera y pie",
    cors: "Las respuestas de /brand/* y de /css/site.css incluyen Access-Control-Allow-Origin: *. En otro origen, carga fonts.css desde /brand para que las fuentes no apunten a tu host.",
    name: "Token",
    value: "Valor",
    logo: "Logotipo",
    logoLead: "El símbolo es la marca geométrica del avatar: un trazo blanco, sin color de acento, con el mismo grosor que el dibujo original.",
    labs: "Labs",
    labsLead: "Labs usa la misma marca blanca. Solo se distingue por la palabra Labs. Los archivos están en /brand/labs/.",
    labsAlt: "Cierre de Labs, con la palabra Labs",
    rules: [
      "Sobre fondo oscuro, usa la versión dark o la blanca. Sobre fondo claro, la light o la negra.",
      "El trazo es blanco sobre oscuro y tinta sobre claro. No lleva color de acento.",
      "Labs usa la misma marca. La palabra Labs es lo único que la distingue.",
      "No estires, no rotes y no añadas gradiente, sombra ni contorno.",
      "Deja un margen igual a la altura del símbolo. No lo dibujes por debajo de 16 px.",
      "La palabra del ápice es ATM Software Labs, en JetBrains Mono Medium, sin cambiar las mayúsculas."
    ],
    downloads: "Descargas",
    masters: "Maestros SVG",
    exports: "Exportaciones",
    icons: "Iconos",
    fontsHeading: "Fuentes",
    fontsBody: "Inter para la interfaz y JetBrains Mono Medium para la palabra y el código. Están autoalojadas en /assets/fonts/ con licencia SIL Open Font License.",
    previewDark: "Cierre horizontal sobre fondo oscuro",
    previewLight: "Cierre horizontal sobre fondo claro"
  },
  en: {
    title: "Design system · ATM Software Labs",
    description: "Color, type, space, radius and motion tokens, plus the shared header and footer of ATM Software Labs.",
    kicker: "Brand",
    h1: "Design system",
    lead: "Public contract for the apex and the subdomains, starting with labs. Link these files; do not copy the values.",
    use: "Usage",
    tokensHeading: "Tokens",
    shell: "Header and footer",
    cors: "Responses for /brand/* and /css/site.css include Access-Control-Allow-Origin: *. On another origin, load fonts.css from /brand so font files are not requested from your host.",
    name: "Token",
    value: "Value",
    logo: "Logo",
    logoLead: "The symbol is the geometric mark from the avatar: a white line, with no accent color, at the same weight as the original drawing.",
    labs: "Labs",
    labsLead: "Labs uses the same white mark. It is distinguished only by the word Labs. The files are at /brand/labs/.",
    labsAlt: "Labs lockup, with the word Labs",
    rules: [
      "On a dark background, use the dark or white version. On a light background, use the light or black version.",
      "The stroke is white on dark and ink on light. It has no accent color.",
      "Labs uses the same mark. The word Labs is the only difference.",
      "Do not stretch, rotate, or add a gradient, shadow, or outline.",
      "Keep clear space equal to the symbol height. Do not draw it smaller than 16 px.",
      "The hub wordmark is ATM Software Labs, set in JetBrains Mono Medium, with the capitals unchanged."
    ],
    downloads: "Downloads",
    masters: "SVG masters",
    exports: "Exports",
    icons: "Icons",
    fontsHeading: "Fonts",
    fontsBody: "Inter is the interface face and JetBrains Mono Medium is the wordmark and code face. Both are self-hosted from /assets/fonts/ under the SIL Open Font License.",
    previewDark: "Horizontal lockup on a dark background",
    previewLight: "Horizontal lockup on a light background"
  },
  ca: {
    title: "Sistema de disseny · ATM Software Labs",
    description: "Tokens de color, tipus, espai, radi i moviment, i la capçalera i el peu compartits d'ATM Software Labs.",
    kicker: "Marca",
    h1: "Sistema de disseny",
    lead: "Contracte públic per a l'àpex i els subdominis, començant per labs. Enllaça aquests fitxers; no copiïs els valors.",
    use: "Ús",
    tokensHeading: "Tokens",
    shell: "Capçalera i peu",
    cors: "Les respostes de /brand/* i de /css/site.css inclouen Access-Control-Allow-Origin: *. En un altre origen, carrega fonts.css des de /brand perquè les fonts no apuntin al teu host.",
    name: "Token",
    value: "Valor",
    logo: "Logotip",
    logoLead: "El símbol és la marca geomètrica de l'avatar: un traç blanc, sense color d'accent, amb el mateix gruix que el dibuix original.",
    labs: "Labs",
    labsLead: "Labs fa servir la mateixa marca blanca. Només es distingeix per la paraula Labs. Els fitxers són a /brand/labs/.",
    labsAlt: "Tancament de Labs, amb la paraula Labs",
    rules: [
      "Sobre fons fosc, fes servir la versió dark o la blanca. Sobre fons clar, la light o la negra.",
      "El traç és blanc sobre fosc i tinta sobre clar. No porta color d'accent.",
      "Labs fa servir la mateixa marca. La paraula Labs és l'única diferència.",
      "No l'estiris, no el giris i no hi afegeixis degradat, ombra ni contorn.",
      "Deixa un marge igual a l'alçada del símbol. No el dibuixis per sota de 16 px.",
      "La paraula de l'àpex és ATM Software Labs, en JetBrains Mono Medium, sense canviar les majúscules."
    ],
    downloads: "Descàrregues",
    masters: "Mestres SVG",
    exports: "Exportacions",
    icons: "Icones",
    fontsHeading: "Tipus",
    fontsBody: "Inter és la lletra de la interfície i JetBrains Mono Medium és la de la paraula i el codi. Estan autoallotjades a /assets/fonts/ amb llicència SIL Open Font License.",
    previewDark: "Tancament horitzontal sobre fons fosc",
    previewLight: "Tancament horitzontal sobre fons clar"
  }
};

const FIRMA = {
  es: {
    title: "Firma de correo | ATM Software Labs",
    description: "Generador de la firma de correo de Alberto Trujillo Mingorance. La vista previa se copia con formato HTML.",
    kicker: "Correo",
    h1: "Firma de correo",
    lead: "Personaliza el cargo si quieres. La vista previa blanca es la firma que se pega en el cliente de correo.",
    steps: [
      "Personaliza el cargo si quieres, o deja el predeterminado Founder · TrujilloMingorance Labs.",
      "Pulsa «Copiar firma» o selecciona el recuadro blanco y pulsa Ctrl + C.",
      "Abre Gmail: Configuración → Ver todos los ajustes → General → Firma.",
      "Crea una firma y pulsa Ctrl + V. Las imágenes y los enlaces viajan dentro del HTML.",
      "Al final de la página de Gmail, pulsa Guardar cambios."
    ],
    roleLabel: "Cargo que aparece en la firma",
    placeholder: "O escribe un cargo",
    copy: "Copiar firma",
    copied: "Firma copiada. Pégala con Ctrl + V."
  },
  en: {
    title: "Email signature | ATM Software Labs",
    description: "Email signature builder for Alberto Trujillo Mingorance. The preview copies as formatted HTML.",
    kicker: "Email",
    h1: "Email signature",
    lead: "Change the role if you want. The white preview is the signature pasted into the mail client.",
    steps: [
      "Change the role if you want, or keep the default Founder · TrujilloMingorance Labs.",
      "Press “Copy signature”, or select the white box and press Ctrl + C.",
      "Open Gmail: Settings → See all settings → General → Signature.",
      "Create a signature and press Ctrl + V. Images and links travel inside the HTML.",
      "At the bottom of the Gmail page, press Save changes."
    ],
    roleLabel: "Role shown in the signature",
    placeholder: "Or type a role",
    copy: "Copy signature",
    copied: "Signature copied. Paste it with Ctrl + V."
  },
  ca: {
    title: "Signatura de correu | ATM Software Labs",
    description: "Generador de la signatura de correu d'Alberto Trujillo Mingorance. La vista prèvia es copia amb format HTML.",
    kicker: "Correu",
    h1: "Signatura de correu",
    lead: "Personalitza el càrrec si vols. La vista prèvia blanca és la signatura que s'enganxa al client de correu.",
    steps: [
      "Personalitza el càrrec si vols, o deixa el predeterminat Founder · TrujilloMingorance Labs.",
      "Prem «Copia la signatura» o selecciona el requadre blanc i prem Ctrl + C.",
      "Obre Gmail: Configuració → Mostra tota la configuració → General → Signatura.",
      "Crea una signatura i prem Ctrl + V. Les imatges i els enllaços viatgen dins l'HTML.",
      "Al final de la pàgina de Gmail, prem Desa els canvis."
    ],
    roleLabel: "Càrrec que apareix a la signatura",
    placeholder: "O escriu un càrrec",
    copy: "Copia la signatura",
    copied: "Signatura copiada. Enganxa-la amb Ctrl + V."
  }
};

const ROLE_VALUES = [
  "Founder · TrujilloMingorance Labs",
  "TrujilloMingorance Labs",
  "Founder & Developer · TrujilloMingorance Labs",
  "Creator & Engineer · TrujilloMingorance Labs"
];
const ROLE_LABELS = {
  es: ["Founder", "Solo empresa", "Founder & Developer", "Creator & Engineer"],
  en: ["Founder", "Company only", "Founder & Developer", "Creator & Engineer"],
  ca: ["Founder", "Només l'empresa", "Founder & Developer", "Creator & Engineer"]
};

function write(rel, html) {
  const target = join(ROOT, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

export function renderAbout(lang) {
  const copy = ABOUT[lang];
  const main = `<section class="hero wrap page-pad">
      <p class="kicker"><span>01</span>${esc(copy.kicker)}</p>
      <div class="profile">
        <img class="profile-avatar" src="/assets/images/Alberto.webp" width="272" height="272" alt="Alberto Trujillo Mingorance">
        <div class="profile-copy">
          <h1>Alberto Trujillo Mingorance</h1>
          <p class="role">${esc(copy.role)}</p>
          <p class="statement">${esc(copy.body)}</p>
          <div class="contact-links">
            <a class="btn" href="https://github.com/atrumin16" rel="me noopener noreferrer" target="_blank">GitHub<span class="visually-hidden"> (${esc(COPY[lang].newTab)})</span></a>
            <a class="btn" href="https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266" rel="me noopener noreferrer" target="_blank">LinkedIn<span class="visually-hidden"> (${esc(COPY[lang].newTab)})</span></a>
            <a class="btn" href="mailto:alberto@trujillomingorance.com">${esc(copy.email)}<span class="visually-hidden"> alberto@trujillomingorance.com</span></a>
          </div>
        </div>
      </div>
    </section>`;
  return documentPage({
    lang,
    paths: FAMILIES.about,
    title: copy.title,
    description: copy.description,
    ogType: "profile",
    main
  });
}

export function renderLegal(kind, lang) {
  const page = legalPage(kind, lang);
  const toc = page.sections.map((section) => `<li><a href="#${section.id}">${esc(section.toc)}</a></li>`).join("");
  const sections = page.sections.map((section) => `<section id="${section.id}">
          <h2><span class="section-num">${section.num}</span>${esc(section.title)}</h2>
          ${section.html}
        </section>`).join("\n        ");
  const main = `<section class="hero wrap">
      <p class="kicker"><span>01</span>${esc(page.kicker)}</p>
      <h1>${esc(page.h1)}</h1>
      <p class="statement">${esc(page.lead)}</p>
      <nav aria-label="${esc(page.tocLabel)}"><ul class="toc">${toc}</ul></nav>
    </section>
    <section class="block page-pad">
      <div class="wrap prose">
        ${sections}
      </div>
    </section>`;
  return documentPage({
    lang,
    paths: FAMILIES[kind],
    title: page.title,
    description: page.description,
    main
  });
}

function tokenRows() {
  return [...TOKENS.matchAll(/(--atm-[a-z0-9-]+):\s*([^;]+);/g)].map((match) => {
    const name = match[1];
    const value = match[2].trim();
    const swatch = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
      ? `<span class="swatch" style="background:${value}"></span>`
      : "";
    return `<tr><td><code>${name}</code></td><td>${swatch}${esc(value)}</td></tr>`;
  }).join("\n            ");
}

function shellSample(lang) {
  const copy = COPY[lang];
  return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${copy.path}"><img class="brand-symbol" src="/brand/logo/symbol-dark.svg?v=${ASSET}" width="28" height="28" alt=""><span class="brand-mark">ATM</span> <span>Software Labs</span></a>
    <nav class="site-nav" aria-label="${esc(copy.navAria)}">
      <a href="${copy.path}#ecosistema">${esc(copy.navEco)}</a>
      <a href="${copy.path}#estado">${esc(copy.navStatus)}</a>
      <a href="${FAMILIES.about[lang]}">${esc(copy.navContact)}</a>
    </nav>
    <nav class="lang" aria-label="${esc(copy.langLabel)}">
      <a href="${FAMILIES.brand.es}" hreflang="es" data-lang-switch="es">ES</a>
      <a href="${FAMILIES.brand.en}" hreflang="en" data-lang-switch="en">EN</a>
      <a href="${FAMILIES.brand.ca}" hreflang="ca" data-lang-switch="ca">CA</a>
    </nav>
  </div>
</header>
<footer class="site-footer">
  <div class="wrap">
    <nav class="footer-nav" aria-label="${esc(copy.footerAria)}">
      <a href="https://github.com/ATM-Software-Labs">GitHub</a>
      <a href="https://www.linkedin.com/in/alberto-trujillo-mingorance-288237266">LinkedIn</a>
      <a href="${FAMILIES.terms[lang]}">${esc(copy.termsLabel)}</a>
      <a href="${FAMILIES.privacy[lang]}">${esc(copy.privacyLabel)}</a>
    </nav>
    <p class="credits">© 2026 ATM Software Labs · Alberto Trujillo Mingorance</p>
  </div>
</footer>`;
}

function linkList(hrefs) {
  return `<ul class="logo-links">${hrefs.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>`;
}

export function renderBrand(lang) {
  const copy = BRAND[lang];
  const sample = esc(shellSample(lang));
  const rules = copy.rules.map((rule) => `<li>${esc(rule)}</li>`).join("");
  const main = `<section class="hero wrap">
      <p class="kicker"><span>01</span>${esc(copy.kicker)}</p>
      <h1>${esc(copy.h1)}</h1>
      <p class="statement">${esc(copy.lead)}</p>
    </section>
    <section class="block" id="logo">
      <div class="wrap prose">
        <h2>${esc(copy.logo)}</h2>
        <p>${esc(copy.logoLead)}</p>
        <div class="logo-grid">
          <figure class="logo-card"><img src="/brand/logo/lockup-horizontal-dark.svg?v=${ASSET}" alt="${esc(copy.previewDark)}"></figure>
          <figure class="logo-card is-light"><img src="/brand/logo/lockup-horizontal-light.svg?v=${ASSET}" alt="${esc(copy.previewLight)}"></figure>
          <figure class="logo-card"><img class="logo-symbol" src="/brand/logo/symbol-white.svg?v=${ASSET}" alt=""></figure>
          <figure class="logo-card is-light"><img class="logo-symbol" src="/brand/logo/symbol-black.svg?v=${ASSET}" alt=""></figure>
        </div>
        <ul>${rules}</ul>
        <h2 id="descargas">${esc(copy.downloads)}</h2>
        <h3>${esc(copy.masters)}</h3>
        ${linkList(LOGO_MASTERS.map((name) => [`/brand/logo/${name}?v=${ASSET}`, name]))}
        <h3>${esc(copy.exports)}</h3>
        ${linkList(LOGO_EXPORTS.map((name) => [`/brand/export/${name}?v=${ASSET}`, name]))}
        <h3>${esc(copy.icons)}</h3>
        ${linkList(LOGO_ICONS.map((name) => [`/brand/${name}?v=${ASSET}`, name]))}
        <p><a href="/favicon.svg?v=${ASSET}">/favicon.svg</a> · <a href="/assets/favicon.ico?v=${ASSET}">/assets/favicon.ico</a> · <a href="/apple-touch-icon.png?v=${ASSET}">/apple-touch-icon.png</a> · <a href="/icon-192.png?v=${ASSET}">/icon-192.png</a> · <a href="/icon-512.png?v=${ASSET}">/icon-512.png</a></p>
        <h3>${esc(copy.labs)}</h3>
        <p>${esc(copy.labsLead)}</p>
        <figure class="logo-card"><img src="/brand/labs/lockup.svg?v=${ASSET}" alt="${esc(copy.labsAlt)}"></figure>
        ${linkList(LABS_FILES.map((name) => [`/brand/labs/${name}?v=${ASSET}`, name]))}
      </div>
    </section>
    <section class="block" id="uso">
      <div class="wrap prose">
        <h2>${esc(copy.use)}</h2>
        <p>${esc(copy.cors)}</p>
        <pre class="spec">&lt;link rel="stylesheet" href="${ORIGIN}/brand/tokens.css"&gt;
&lt;link rel="stylesheet" href="${ORIGIN}/brand/fonts.css"&gt;
&lt;link rel="stylesheet" href="${ORIGIN}/css/site.css?v=${ASSET}"&gt;</pre>
        <h2 id="tokens">${esc(copy.tokensHeading)}</h2>
        <table class="token-table">
          <thead><tr><th>${esc(copy.name)}</th><th>${esc(copy.value)}</th></tr></thead>
          <tbody>
            ${tokenRows()}
          </tbody>
        </table>
        <h2 id="fuentes">${esc(copy.fontsHeading)}</h2>
        <p>${esc(copy.fontsBody)}</p>
        <p><code>#07080b</code> · <code>#f4f7fb</code> · <code>#ffffff</code> · <code>#9aabbd</code></p>
        <h2 id="shell">${esc(copy.shell)}</h2>
        <pre class="spec">${sample}</pre>
      </div>
    </section>`;
  return documentPage({
    lang,
    paths: FAMILIES.brand,
    title: copy.title,
    description: copy.description,
    main
  });
}

export function renderFirma(lang) {
  const copy = FIRMA[lang];
  const split = EMBED.indexOf("<script>");
  const container = EMBED.slice(0, split).trim();
  const script = EMBED.slice(split).trim();
  const chips = ROLE_VALUES.map((value, index) => {
    const active = index === 0 ? " active" : "";
    const pressed = index === 0 ? "true" : "false";
    const arg = value.replaceAll("&", "&amp;").replaceAll("'", "\\'");
    return `<button type="button" class="btn role-chip${active}" aria-pressed="${pressed}" onclick="setRole('${arg}', this)">${esc(ROLE_LABELS[lang][index])}</button>`;
  }).join("\n          ");
  const steps = copy.steps.map((step) => `<li>${esc(step)}</li>`).join("\n          ");
  const main = `<section class="hero wrap page-pad">
      <p class="kicker"><span>01</span>${esc(copy.kicker)}</p>
      <h1>${esc(copy.h1)}</h1>
      <p class="statement">${esc(copy.lead)}</p>
      <div class="prose">
        <ol>
          ${steps}
        </ol>
      </div>
      <div class="signature-tools">
        <p class="section-kicker">${esc(copy.roleLabel)}</p>
        <div class="role-chips">
          ${chips}
        </div>
        <input type="text" id="role-custom-input" class="role-input" value="Founder · TrujilloMingorance Labs" oninput="updateRoleCustom(this.value)" placeholder="${esc(copy.placeholder)}">
        <div class="contact-links">
          <button type="button" class="btn" id="btn-copy" onclick="copiarFirma()">${esc(copy.copy)}</button>
          <span class="copy-msg" id="copy-msg">${esc(copy.copied)}</span>
        </div>
      </div>
      <div class="signature-preview">
        ${container}
      </div>
    </section>`;
  const page = documentPage({
    lang,
    paths: FAMILIES.firma,
    title: copy.title,
    description: copy.description,
    main,
    scripts: `${script}\n  <script src="/js/hub.js?v=${ASSET}" defer></script>`
  });
  return page;
}

export function renderSitemap() {
  const groups = [
    [FAMILIES.hub, "1.0", "0.9"],
    [FAMILIES.about, "0.9", "0.8"],
    [FAMILIES.terms, "0.5", "0.4"],
    [FAMILIES.privacy, "0.5", "0.4"],
    [FAMILIES.brand, "0.4", "0.3"],
    [FAMILIES.firma, "0.3", "0.3"]
  ];
  const urls = groups.flatMap(([paths, primary, rest]) => LOCALES.map((code) => {
    const alternates = LOCALES.map((alt) => `    <xhtml:link rel="alternate" hreflang="${COPY[alt].lang}" href="${ORIGIN}${paths[alt]}"/>`).join("\n");
    const priority = code === "es" ? primary : rest;
    return `  <url>
    <loc>${ORIGIN}${paths[code]}</loc>
    <lastmod>2026-10-15</lastmod>
    <priority>${priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${paths.es}"/>
  </url>`;
  }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

export function renderBrandReadme() {
  const names = [...TOKENS.matchAll(/(--atm-[a-z0-9-]+):\s*([^;]+);/g)].map((match) => `- \`${match[1]}\`: ${match[2].trim()}`);
  return `# ATM Software Labs design system

Stable files:

- ${ORIGIN}/brand/tokens.css
- ${ORIGIN}/brand/fonts.css
- ${ORIGIN}/css/site.css
- ${ORIGIN}/brand/
- ${ORIGIN}/en/brand/
- ${ORIGIN}/ca/brand/
- ${ORIGIN}/brand/favicon.svg
- ${ORIGIN}/brand/logo/
- ${ORIGIN}/brand/export/
- ${ORIGIN}/brand/labs/favicon.svg
- ${ORIGIN}/brand/labs/lockup.svg
- ${ORIGIN}/brand/labs/og.png
- ${ORIGIN}/brand/labs/banner.png

\`Access-Control-Allow-Origin: *\` is set on \`/brand/*\` and \`/css/site.css\`.
On this origin, pages load \`/css/fonts.css\` (relative font URLs).
On another origin, load \`/brand/fonts.css\` (absolute font URLs) before \`site.css\`.

\`\`\`html
<link rel="stylesheet" href="${ORIGIN}/brand/tokens.css">
<link rel="stylesheet" href="${ORIGIN}/brand/fonts.css">
<link rel="stylesheet" href="${ORIGIN}/css/site.css">
\`\`\`

## Tokens

${names.join("\n")}

## Header and footer

Use \`header.site-header\`, \`a.brand\`, \`nav.site-nav\`, \`nav.lang\` and \`footer.site-footer\`.
The language switcher sets \`localStorage["atm_lang_choice"]\` from \`data-lang-switch\`.
Section links point at the language home plus \`#ecosistema\` or \`#estado\`.
Contact points at the about page for that language.
The footer links GitHub, LinkedIn, terms and privacy.
Credits: © 2026 ATM Software Labs · Alberto Trujillo Mingorance.
`;
}

function writePages() {
  for (const lang of LOCALES) {
    write(`public/${lang === "es" ? "sobre-mi" : `${lang}/about`}/index.html`, renderAbout(lang));
    write(`public/${lang === "es" ? "terms" : `${lang}/terms`}/index.html`, renderLegal("terms", lang));
    write(`public/${lang === "es" ? "privacy" : `${lang}/privacy`}/index.html`, renderLegal("privacy", lang));
    write(`public/${lang === "es" ? "brand" : `${lang}/brand`}/index.html`, renderBrand(lang));
    const firma = renderFirma(lang);
    if (lang === "es") {
      write("public/firma.html", firma);
      write("public/firma/index.html", firma);
    } else {
      write(`public/${lang}/firma/index.html`, firma);
    }
  }
  write("public/terms.html", renderLegal("terms", "es"));
  write("public/privacy.html", renderLegal("privacy", "es"));
  write("public/sitemap.xml", renderSitemap());
  write("public/brand/README.md", renderBrandReadme());
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) writePages();
