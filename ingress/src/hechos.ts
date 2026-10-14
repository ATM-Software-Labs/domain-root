export interface HechosBorde {
  host: string
  path: string
  colo: string
  tlsVersion: string
  httpProtocol: string
  rayId: string
}

export function esApex(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return host === 'trujillomingorance.com' || host === 'www.trujillomingorance.com'
}

export function esMapeado(hostname: string, slugs: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  const sufijo = '.trujillomingorance.com'
  if (!host.endsWith(sufijo)) return false
  const etiqueta = host.slice(0, -sufijo.length)
  if (!etiqueta || etiqueta.includes('.')) return false
  return slugs.includes(etiqueta)
}

export function debeDiagnosticar(hostname: string, slugs: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (!host.endsWith('.trujillomingorance.com')) return false
  if (esApex(host)) return false
  return !esMapeado(host, slugs)
}

function tlsLegible(value: unknown): string {
  const raw = typeof value === 'string' ? value : ''
  if (/tlsv?1\.2/i.test(raw)) return 'TLS 1.2'
  if (/tlsv?1\.3/i.test(raw) || !raw) return 'TLS 1.3'
  return 'TLS 1.3'
}

function httpLegible(value: unknown): string {
  const raw = typeof value === 'string' ? value : ''
  if (/http\/?2/i.test(raw)) return 'HTTP/2'
  if (/http\/?3/i.test(raw) || /h3/i.test(raw) || !raw) return 'HTTP/3'
  return 'HTTP/3'
}

export function hechosDesde(request: Request): HechosBorde {
  const url = new URL(request.url)
  const cf = request.cf as { colo?: unknown; tlsVersion?: unknown; httpProtocol?: unknown } | undefined
  const colo = typeof cf?.colo === 'string' && /^[A-Z0-9]{2,8}$/.test(cf.colo) ? cf.colo : 'MAD'
  const ray = request.headers.get('cf-ray') || 'N/A'
  return {
    host: url.hostname.toLowerCase(),
    path: url.pathname || '/',
    colo,
    tlsVersion: tlsLegible(cf?.tlsVersion),
    httpProtocol: httpLegible(cf?.httpProtocol),
    rayId: ray.slice(0, 64),
  }
}
