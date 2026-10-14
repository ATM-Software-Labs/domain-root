export type Categoria = 'Production' | 'Internal' | 'Gateway' | 'Utility'
export type Estado = 'active' | 'maintenance' | 'restricted'

export interface NetworkEndpoint {
  slug: string
  name: string
  category: Categoria
  targetUrl: string
  status: Estado
  isPublic: boolean
}

/** Hosts que ya resuelven en otro proyecto y no deben caer en el diagnóstico. */
export const ALIAS_PASSTHROUGH = ['finance', 'guias', 'groq', 'doc', 'd', 'go', 'rocky'] as const

/**
 * Única lista de servicios. Un registro nuevo aparece en el siguiente request
 * sin cambiar la plantilla. KV `endpoints` o EDGE_CATALOG_JSON sustituyen esta
 * lista cuando el JSON trae al menos un endpoint válido.
 */
export const CATALOGO: NetworkEndpoint[] = [
  { slug: 'labs', name: 'ATM Labs', category: 'Production', targetUrl: 'https://labs.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'nutri', name: 'NutriFit', category: 'Production', targetUrl: 'https://nutri.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'ai', name: 'Trujillo AI Studio', category: 'Production', targetUrl: 'https://ai.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'rewrite', name: 'Rewrite AI', category: 'Production', targetUrl: 'https://rewrite.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'invest', name: 'INVEST', category: 'Production', targetUrl: 'https://invest.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'focusguard', name: 'FocusGuard', category: 'Production', targetUrl: 'https://focusguard.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'guides', name: 'Engineering Guides', category: 'Utility', targetUrl: 'https://guides.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'savings', name: 'Savings', category: 'Utility', targetUrl: 'https://savings.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'tools', name: 'Herramientas', category: 'Utility', targetUrl: 'https://tools.trujillomingorance.com', status: 'active', isPublic: true },
  { slug: 'alberto', name: 'Portfolio', category: 'Production', targetUrl: 'https://alberto.trujillomingorance.com', status: 'active', isPublic: true },
]

const CATEGORIAS: readonly Categoria[] = ['Production', 'Internal', 'Gateway', 'Utility']
const ESTADOS: readonly Estado[] = ['active', 'maintenance', 'restricted']

export function validarEntrada(value: unknown): NetworkEndpoint | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : ''
  if (!/^[a-z0-9-]{1,32}$/.test(slug)) return null
  const name = typeof row.name === 'string' ? row.name.trim().slice(0, 48) : ''
  if (!name) return null
  if (!CATEGORIAS.includes(row.category as Categoria)) return null
  if (!ESTADOS.includes(row.status as Estado)) return null
  if (typeof row.isPublic !== 'boolean') return null
  let url: URL
  try {
    url = new URL(String(row.targetUrl))
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null
  const host = url.hostname.toLowerCase()
  if (host !== 'trujillomingorance.com' && !host.endsWith('.trujillomingorance.com')) return null
  return {
    slug,
    name,
    category: row.category as Categoria,
    targetUrl: url.origin,
    status: row.status as Estado,
    isPublic: row.isPublic,
  }
}

export function validarCatalogo(value: unknown): NetworkEndpoint[] {
  if (!Array.isArray(value)) return []
  const vistos = new Set<string>()
  const salida: NetworkEndpoint[] = []
  for (const item of value) {
    const entrada = validarEntrada(item)
    if (!entrada || vistos.has(entrada.slug)) continue
    vistos.add(entrada.slug)
    salida.push(entrada)
  }
  return salida
}

export interface EnvCatalogo {
  EDGE_CATALOG_JSON?: string
  CATALOG?: { get(key: string): Promise<string | null> }
}

export async function catalogoResuelto(env?: EnvCatalogo | null): Promise<NetworkEndpoint[]> {
  try {
    const remoto = env?.CATALOG ? await env.CATALOG.get('endpoints') : ''
    const texto = (remoto || env?.EDGE_CATALOG_JSON || '').trim()
    if (!texto) return CATALOGO
    const lista = validarCatalogo(JSON.parse(texto))
    return lista.length ? lista : CATALOGO
  } catch {
    return CATALOGO
  }
}

export function slugsEnrutados(lista: readonly NetworkEndpoint[]): string[] {
  return [...lista.map((item) => item.slug), ...ALIAS_PASSTHROUGH]
}

export function endpointsVisibles(lista: readonly NetworkEndpoint[]): NetworkEndpoint[] {
  return lista.filter((item) => item.isPublic)
}
