export const LOCALES = ["es", "en", "ca"];

export const PROJECTS = [
  {
    slug: "labs",
    name: "ATM Labs",
    live: true,
    icon: "labs",
    desc: {
      es: "Directorio de lo que tengo en marcha.",
      en: "Directory of what I have running.",
      ca: "Directori del que tinc en marxa."
    }
  },
  {
    slug: "guides",
    name: { es: "Guías", en: "Guides", ca: "Guies" },
    live: true,
    highlight: true,
    repo: "trujillo-guides",
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
    highlight: true,
    repo: "trujillo-ai-studio",
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
    highlight: true,
    repo: "invest-platform",
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
    highlight: true,
    repo: "focusguard-saas",
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
      es: "Utilidades que publico.",
      en: "Utilities I publish.",
      ca: "Utilitats que publico."
    }
  }
];

// Sibling sites linked from the hub, footer and 404. Descriptions follow each site's own meta description.
export const SITES = [
  {
    slug: "labs",
    name: "ATM Labs",
    url: "https://labs.trujillomingorance.com",
    desc: {
      es: "Directorio de servicios en producción.",
      en: "Directory of services in production.",
      ca: "Directori de serveis en producció."
    }
  },
  {
    slug: "invest",
    name: "INVEST",
    url: "https://invest.trujillomingorance.com",
    desc: {
      es: "Acciones, ETF y cripto con datos públicos.",
      en: "Stocks, ETFs, and crypto from public data.",
      ca: "Accions, ETF i cripto amb dades públiques."
    }
  },
  {
    slug: "charts",
    name: "Markets Briefing",
    url: "https://charts.trujillomingorance.com",
    desc: {
      es: "Briefing diario de mercados, con cifras con fuente.",
      en: "Daily markets briefing, with sourced figures.",
      ca: "Briefing diari de mercats, amb xifres amb font."
    }
  },
  {
    slug: "alberto",
    name: "Alberto",
    url: "https://alberto.trujillomingorance.com",
    desc: {
      es: "Web personal: informes Trujillo AI, proyectos y notas técnicas.",
      en: "Personal site: Trujillo AI reports, projects, and technical notes.",
      ca: "Web personal: informes Trujillo AI, projectes i notes tècniques."
    }
  }
];

export const COPY = {
  es: {
    lang: "es",
    footSites: "Sitios",
    brandLabel: "Marca",
    sitesKicker: "Accesos",
    sitesTitle: "Mis sitios",
    sitesAria: "Sitios del ecosistema",
    notFoundSites: "O ve directamente a uno de estos sitios:",
    path: "/",
    ogLocale: "es_ES",
    title: "Alberto Trujillo Mingorance · ATM Software Labs",
    description: "Alberto Trujillo Mingorance. Administración de sistemas, cloud y ciberseguridad en Barcelona. ATM Software Labs es su organización personal.",
    skip: "Saltar al contenido",
    navAria: "Secciones",
    navEco: "Proyectos",
    navStatus: "Estado",
    navContact: "Contacto",
    langLabel: "Idioma",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "ATM Software Labs",
    role: "Administración de sistemas, cloud y ciberseguridad · Barcelona",
    statement: "Administrador de sistemas y ciberseguridad en Barcelona. Aquí reúno los proyectos, la documentación de infraestructura y las herramientas que mantengo.",
    phrases: ["ingeniería de sistemas", "arquitectura de red", "Web3", "código abierto"],
    stackLabel: "Ámbitos",
    stack: ["Sistemas", "Cloud", "Ciberseguridad", "Identidad", "Código abierto"],
    ecoKicker: "Selección",
    ecoTitle: "Proyectos",
    ecoLead: "Una selección de lo que mantengo. El directorio completo está en Labs.",
    services: "Ver todos los servicios",
    githubLabel: "Repositorio de {name} en GitHub",
    hubHint: "Con el foco en un proyecto, las flechas mueven la selección.",
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
    aboutPath: "/sobre-mi",
    termsLabel: "Términos",
    privacyLabel: "Privacidad",
    footerAria: "Pie de página",
    contact: "Contacto",
    profiles: "Perfiles",
    newTab: "se abre en una pestaña nueva",
    notFoundTitle: "Página no encontrada",
    notFoundBody: "Esta dirección no existe o se ha movido.",
    notFoundHome: "Volver al inicio"
  },
  en: {
    lang: "en",
    footSites: "Sites",
    brandLabel: "Brand",
    sitesKicker: "Shortcuts",
    sitesTitle: "My sites",
    sitesAria: "Ecosystem sites",
    notFoundSites: "Or go straight to one of these sites:",
    path: "/en/",
    ogLocale: "en_US",
    title: "Alberto Trujillo Mingorance · ATM Software Labs",
    description: "Alberto Trujillo Mingorance. Systems administration, cloud, and cybersecurity in Barcelona. ATM Software Labs is his personal organization.",
    skip: "Skip to content",
    navAria: "Sections",
    navEco: "Projects",
    navStatus: "Status",
    navContact: "Contact",
    langLabel: "Language",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "ATM Software Labs",
    role: "Systems administration, cloud, and cybersecurity · Barcelona",
    statement: "Systems administrator and cybersecurity specialist in Barcelona. This page gathers the projects, infrastructure notes, and tools I maintain.",
    phrases: ["systems engineering", "network architecture", "Web3", "open source"],
    stackLabel: "Focus",
    stack: ["Systems", "Cloud", "Cybersecurity", "Identity", "Open source"],
    ecoKicker: "Selection",
    ecoTitle: "Projects",
    ecoLead: "A selection of work I maintain. The full directory is on Labs.",
    services: "View all services",
    githubLabel: "GitHub repository for {name}",
    hubHint: "With focus on a project, arrow keys move the selection.",
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
    aboutPath: "/en/about",
    termsLabel: "Terms",
    privacyLabel: "Privacy",
    footerAria: "Footer",
    contact: "Contact",
    profiles: "Profiles",
    newTab: "opens in a new tab",
    notFoundTitle: "Page not found",
    notFoundBody: "This address does not exist or has moved.",
    notFoundHome: "Back to home"
  },
  ca: {
    lang: "ca",
    footSites: "Llocs",
    brandLabel: "Marca",
    sitesKicker: "Accessos",
    sitesTitle: "Els meus llocs",
    sitesAria: "Llocs de l'ecosistema",
    notFoundSites: "O ves directament a un d'aquests llocs:",
    path: "/ca/",
    ogLocale: "ca_ES",
    title: "Alberto Trujillo Mingorance · ATM Software Labs",
    description: "Alberto Trujillo Mingorance. Administració de sistemes, cloud i ciberseguretat a Barcelona. ATM Software Labs és la seva organització personal.",
    skip: "Ves al contingut",
    navAria: "Seccions",
    navEco: "Projectes",
    navStatus: "Estat",
    navContact: "Contacte",
    langLabel: "Llengua",
    langNames: { es: "Español", en: "English", ca: "Català" },
    kicker: "ATM Software Labs",
    role: "Administració de sistemes, cloud i ciberseguretat · Barcelona",
    statement: "Administrador de sistemes i ciberseguretat a Barcelona. Aquí reuneixo els projectes, la documentació d'infraestructura i les eines que mantinc.",
    phrases: ["enginyeria de sistemes", "arquitectura de xarxa", "Web3", "codi obert"],
    stackLabel: "Àmbits",
    stack: ["Sistemes", "Cloud", "Ciberseguretat", "Identitat", "Codi obert"],
    ecoKicker: "Selecció",
    ecoTitle: "Projectes",
    ecoLead: "Una selecció del que mantinc. El directori complet és a Labs.",
    services: "Veure tots els serveis",
    githubLabel: "Repositori de {name} a GitHub",
    hubHint: "Amb el focus en un projecte, les fletxes mouen la selecció.",
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
    aboutPath: "/ca/about",
    termsLabel: "Termes",
    privacyLabel: "Privadesa",
    footerAria: "Peu",
    contact: "Contacte",
    profiles: "Perfils",
    newTab: "s'obre en una pestanya nova",
    notFoundTitle: "Pàgina no trobada",
    notFoundBody: "Aquesta adreça no existeix o s'ha mogut.",
    notFoundHome: "Torna a l'inici"
  }
};

export function projectName(project, lang) {
  return typeof project.name === "string" ? project.name : project.name[lang];
}
