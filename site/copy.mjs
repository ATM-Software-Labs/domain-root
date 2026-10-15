export const LOCALES = ["es", "en", "ca"];

export const PROJECTS = [
  {
    slug: "labs",
    name: "ATM Labs",
    live: true,
    icon: "labs",
    desc: {
      es: "Directorio y laboratorio del ecosistema.",
      en: "Directory and lab for the ecosystem.",
      ca: "Directori i laboratori de l'ecosistema."
    }
  },
  {
    slug: "guides",
    name: { es: "Guías", en: "Guides", ca: "Guies" },
    live: true,
    icon: "guides",
    desc: {
      es: "Guías técnicas de ingeniería.",
      en: "Technical engineering guides.",
      ca: "Guies tècniques d'enginyeria."
    }
  },
  {
    slug: "ai",
    name: "Trujillo AI",
    live: true,
    icon: "ai",
    desc: {
      es: "Workspace de inteligencia empresarial.",
      en: "Enterprise intelligence workspace.",
      ca: "Espai d'intel·ligència empresarial."
    }
  },
  {
    slug: "rewrite",
    name: "Rewrite",
    live: true,
    icon: "rewrite",
    desc: {
      es: "Reescritura, corrección y traducción.",
      en: "Rewrite, edit, and translate.",
      ca: "Reescriptura, correcció i traducció."
    }
  },
  {
    slug: "nutri",
    name: "NutriFit",
    live: true,
    icon: "nutri",
    desc: {
      es: "Nutrición, macros y código abierto.",
      en: "Nutrition, macros, and open source.",
      ca: "Nutrició, macros i codi obert."
    }
  },
  {
    slug: "invest",
    name: "INVEST",
    live: true,
    icon: "invest",
    desc: {
      es: "Acciones, ETF y cripto con datos públicos.",
      en: "Stocks, ETFs, and crypto from public data.",
      ca: "Accions, ETF i cripto amb dades públiques."
    }
  },
  {
    slug: "charts",
    name: "Charts",
    live: false,
    icon: "charts",
    desc: {
      es: "Series y gráficos de mercado.",
      en: "Market series and charts.",
      ca: "Sèries i gràfics de mercat."
    }
  },
  {
    slug: "savings",
    name: "Savings",
    live: true,
    icon: "savings",
    desc: {
      es: "Liquidez familiar y runway.",
      en: "Family liquidity and runway.",
      ca: "Liquiditat familiar i runway."
    }
  },
  {
    slug: "focusguard",
    name: "FocusGuard",
    live: true,
    icon: "focusguard",
    desc: {
      es: "DNS filtrado y control parental.",
      en: "Filtered DNS and parental controls.",
      ca: "DNS filtrat i control parental."
    }
  },
  {
    slug: "tools",
    name: "Tools",
    live: true,
    icon: "tools",
    desc: {
      es: "Utilidades publicadas por el laboratorio.",
      en: "Utilities published by the lab.",
      ca: "Utilitats publicades pel laboratori."
    }
  }
];

export const COPY = {
  es: {
    lang: "es",
    path: "/",
    ogLocale: "es_ES",
    title: "ATM Software Labs · Alberto Trujillo Mingorance",
    description: "Hub de ATM Software Labs y Alberto Trujillo Mingorance. Ingeniería de sistemas, arquitectura de red, Web3 y código abierto.",
    skip: "Saltar al contenido",
    navAria: "Secciones",
    navEco: "Ecosistema",
    navStatus: "Estado",
    navContact: "Contacto",
    langLabel: "Idioma",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "Manifiesto",
    statement: "Ingeniería de sistemas, arquitectura de red, Web3 y código abierto. Publicamos infraestructura y herramientas que se pueden operar.",
    phrases: ["ingeniería de sistemas", "arquitectura de red", "Web3", "código abierto"],
    stackLabel: "Ámbitos",
    stack: ["Cloudflare", "Linux", "Redes", "Web3", "Código abierto"],
    ecoKicker: "Ecosistema",
    ecoTitle: "Subdominios",
    ecoLead: "Hay enlace cuando el host responde. El resto queda como próximamente.",
    hubHint: "Con el foco en una ficha, las flechas mueven la selección.",
    soon: "próximamente",
    statusKicker: "Estado",
    statusTitle: "Alcance",
    statusLead: "Comprobación real desde este navegador. En línea: el host contestó. Sin respuesta: no contestó a tiempo. No es una cifra de disponibilidad.",
    caption: "Alcance de los subdominios del hub",
    colHost: "Host",
    colState: "Estado",
    colLatency: "Latencia",
    pendingSummary: "Pendiente de comprobación.",
    pending: "pendiente",
    checking: "Comprobando {n} hosts…",
    checkingLabel: "comprobando",
    summary: "{up} en línea · {down} sin respuesta",
    online: "en línea",
    offline: "sin respuesta",
    recheck: "Comprobar de nuevo",
    browser: "Este navegador no puede comprobar el alcance.",
    noscript: "La comprobación de alcance necesita JavaScript. El directorio sigue disponible.",
    aboutKicker: "Contacto",
    aboutTitle: "Sobre mí",
    aboutBody: "Perfil y contacto de Alberto Trujillo Mingorance.",
    aboutLink: "Sobre mí",
    contact: "Contacto",
    profiles: "Perfiles",
    newTab: "se abre en una pestaña nueva",
    notFoundTitle: "Página no encontrada",
    notFoundBody: "Esta ruta no existe en el ápice.",
    notFoundHome: "Volver al inicio"
  },
  en: {
    lang: "en",
    path: "/en/",
    ogLocale: "en_US",
    title: "ATM Software Labs · Alberto Trujillo Mingorance",
    description: "Hub for ATM Software Labs and Alberto Trujillo Mingorance. Systems engineering, network architecture, Web3, and open source.",
    skip: "Skip to content",
    navAria: "Sections",
    navEco: "Ecosystem",
    navStatus: "Status",
    navContact: "Contact",
    langLabel: "Language",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "Manifesto",
    statement: "Systems engineering, network architecture, Web3, and open source. We publish infrastructure and tools that can be operated.",
    phrases: ["systems engineering", "network architecture", "Web3", "open source"],
    stackLabel: "Stack",
    stack: ["Cloudflare", "Linux", "Networking", "Web3", "Open source"],
    ecoKicker: "Ecosystem",
    ecoTitle: "Subdomains",
    ecoLead: "A host is linked when it responds. The rest is marked coming soon.",
    hubHint: "With focus on a card, arrow keys move the selection.",
    soon: "coming soon",
    statusKicker: "Status",
    statusTitle: "Reach",
    statusLead: "A real check from this browser. Online: the host answered. No response: it did not answer in time. This is not an availability figure.",
    caption: "Reachability of the hub subdomains",
    colHost: "Host",
    colState: "Status",
    colLatency: "Latency",
    pendingSummary: "Check pending.",
    pending: "pending",
    checking: "Checking {n} hosts…",
    checkingLabel: "checking",
    summary: "{up} online · {down} no response",
    online: "online",
    offline: "no response",
    recheck: "Check again",
    browser: "This browser cannot check reachability.",
    noscript: "The reachability check needs JavaScript. The directory still works.",
    aboutKicker: "Contact",
    aboutTitle: "About",
    aboutBody: "Profile and contact for Alberto Trujillo Mingorance.",
    aboutLink: "About",
    contact: "Contact",
    profiles: "Profiles",
    newTab: "opens in a new tab",
    notFoundTitle: "Page not found",
    notFoundBody: "This path does not exist on the apex.",
    notFoundHome: "Back to home"
  },
  ca: {
    lang: "ca",
    path: "/ca/",
    ogLocale: "ca_ES",
    title: "ATM Software Labs · Alberto Trujillo Mingorance",
    description: "Hub d'ATM Software Labs i Alberto Trujillo Mingorance. Enginyeria de sistemes, arquitectura de xarxa, Web3 i codi obert.",
    skip: "Ves al contingut",
    navAria: "Seccions",
    navEco: "Ecosistema",
    navStatus: "Estat",
    navContact: "Contacte",
    langLabel: "Llengua",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "Manifest",
    statement: "Enginyeria de sistemes, arquitectura de xarxa, Web3 i codi obert. Publiquem infraestructura i eines que es poden operar.",
    phrases: ["enginyeria de sistemes", "arquitectura de xarxa", "Web3", "codi obert"],
    stackLabel: "Àmbits",
    stack: ["Cloudflare", "Linux", "Xarxes", "Web3", "Codi obert"],
    ecoKicker: "Ecosistema",
    ecoTitle: "Subdominis",
    ecoLead: "Hi ha enllaç quan el host respon. La resta queda com a properament.",
    hubHint: "Amb el focus en una fitxa, les fletxes mouen la selecció.",
    soon: "properament",
    statusKicker: "Estat",
    statusTitle: "Abast",
    statusLead: "Comprovació real des d'aquest navegador. En línia: el host ha respost. Sense resposta: no ha respost a temps. No és una xifra de disponibilitat.",
    caption: "Abast dels subdominis del hub",
    colHost: "Host",
    colState: "Estat",
    colLatency: "Latència",
    pendingSummary: "Pendent de comprovació.",
    pending: "pendent",
    checking: "Comprovant {n} hosts…",
    checkingLabel: "comprovant",
    summary: "{up} en línia · {down} sense resposta",
    online: "en línia",
    offline: "sense resposta",
    recheck: "Torna a comprovar",
    browser: "Aquest navegador no pot comprovar l'abast.",
    noscript: "La comprovació d'abast necessita JavaScript. El directori continua disponible.",
    aboutKicker: "Contacte",
    aboutTitle: "Sobre mi",
    aboutBody: "Perfil i contacte d'Alberto Trujillo Mingorance.",
    aboutLink: "Sobre mi",
    contact: "Contacte",
    profiles: "Perfils",
    newTab: "s'obre en una pestanya nova",
    notFoundTitle: "Pàgina no trobada",
    notFoundBody: "Aquesta ruta no existeix a l'àpex.",
    notFoundHome: "Torna a l'inici"
  }
};

export function projectName(project, lang) {
  return typeof project.name === "string" ? project.name : project.name[lang];
}
