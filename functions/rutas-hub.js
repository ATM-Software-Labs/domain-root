/** Apex paths that must not be sent to Labs. Language homes live in redirigeALabs. */
export function esRecursoEstatico(path) {
  return (
    path === "/sobre-mi" || path.startsWith("/sobre-mi/") ||
    path === "/en/about" || path.startsWith("/en/about/") ||
    path === "/robots.txt" || path === "/sitemap.xml" || path === "/site.webmanifest" ||
    path === "/terms" || path.startsWith("/terms/") || path === "/terms.html" || path === "/terms-of-service" ||
    path === "/privacy" || path.startsWith("/privacy/") || path === "/privacy.html" || path === "/privacy-policy" ||
    path === "/firma" || path.startsWith("/firma/") || path === "/firma.html" ||
    // /brand/labs/* is included here so the labs mark is served on the apex.
    path === "/brand" || path.startsWith("/brand/") ||
    path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/assets/") ||
    path === "/avatar.png" || path === "/favicon.ico" || path === "/favicon.svg" || path === "/apple-touch-icon.png" ||
    path === "/icon-192.png" || path === "/icon-512.png" || path === "/favicon-32.png"
  );
}

export function redirigeALabs(path) {
  const isHome = path === "/" || path === "/index.html";
  const isHubLang = path === "/en" || path.startsWith("/en/") || path === "/ca" || path.startsWith("/ca/");
  return !esRecursoEstatico(path) && !isHome && !isHubLang;
}
