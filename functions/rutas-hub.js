/** Apex paths that must not be sent to Labs. Language homes live in redirigeALabs. */
export function esRecursoEstatico(path) {
  return (
    path === "/sobre-mi" || path === "/sobre-mi/" || path === "/sobre-mi/index.html" ||
    path === "/en/about" || path === "/en/about/" || path === "/en/about/index.html" ||
    path === "/robots.txt" || path === "/sitemap.xml" || path === "/site.webmanifest" ||
    path === "/terms" || path === "/terms.html" || path === "/terms-of-service" ||
    path === "/privacy" || path === "/privacy.html" || path === "/privacy-policy" ||
    path === "/firma" || path === "/firma.html" ||
    path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/assets/") ||
    path === "/avatar.png" || path === "/favicon.ico" || path === "/favicon.svg" || path === "/apple-touch-icon.png"
  );
}

export function redirigeALabs(path) {
  const isHome = path === "/" || path === "/index.html";
  const isHubLang = path === "/en" || path.startsWith("/en/") || path === "/ca" || path.startsWith("/ca/");
  return !esRecursoEstatico(path) && !isHome && !isHubLang;
}
