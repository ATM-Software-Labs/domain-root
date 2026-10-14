import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const raiz = dirname(fileURLToPath(import.meta.url))
const mod = await import('../../functions/lib/diagnostico.js')

test('api no está mapeado y labs sí', () => {
  const slugs = mod.slugsEnrutados(mod.CATALOGO)
  assert.equal(mod.debeDiagnosticar('api.trujillomingorance.com', slugs), true)
  assert.equal(mod.debeDiagnosticar('labs.trujillomingorance.com', slugs), false)
  assert.equal(mod.debeDiagnosticar('nutri.trujillomingorance.com', slugs), false)
  assert.equal(mod.debeDiagnosticar('trujillomingorance.com', slugs), false)
  assert.equal(mod.debeDiagnosticar('www.trujillomingorance.com', slugs), false)
  assert.equal(mod.debeDiagnosticar('finance.trujillomingorance.com', slugs), false)
})

test('un registro nuevo entra en la rejilla sin estar en el catálogo base', () => {
  const extra = mod.validarCatalogo([
    ...mod.CATALOGO,
    { slug: 'radar', name: 'Radar', category: 'Gateway', targetUrl: 'https://radar.trujillomingorance.com', status: 'active', isPublic: true },
  ])
  assert.equal(extra.some((item) => item.slug === 'radar'), true)
  const html = mod.htmlDiagnostico({
    host: 'api.trujillomingorance.com',
    path: '/',
    colo: 'MAD',
    tlsVersion: 'TLS 1.3',
    httpProtocol: 'HTTP/3',
    rayId: 'ray-test',
  }, extra)
  assert.match(html, />radar\.</)
  assert.match(html, /11 endpoints online/)
})

test('rechaza urls ajenas y duplicados', () => {
  const lista = mod.validarCatalogo([
    { slug: 'nutri', name: 'NutriFit', category: 'Production', targetUrl: 'https://user:pass@nutri.trujillomingorance.com', status: 'active', isPublic: true },
    { slug: 'otro', name: 'Otro', category: 'Utility', targetUrl: 'https://evil.example', status: 'active', isPublic: true },
    { slug: 'labs', name: 'Labs', category: 'Production', targetUrl: 'https://labs.trujillomingorance.com/interno', status: 'active', isPublic: true },
    { slug: 'labs', name: 'Otra vez', category: 'Production', targetUrl: 'https://labs.trujillomingorance.com', status: 'maintenance', isPublic: true },
  ])
  assert.deepEqual(lista.map((item) => item.slug), ['labs'])
  assert.equal(lista[0].targetUrl, 'https://labs.trujillomingorance.com')
  assert.equal(lista[0].status, 'active')
})

test('inyecta el borde y escapa el host', () => {
  const html = mod.htmlDiagnostico({
    host: 'api.trujillomingorance.com',
    path: '/<script>',
    colo: 'MAD',
    tlsVersion: 'TLS 1.3',
    httpProtocol: 'HTTP/3',
    rayId: 'abc-MAD',
  }, mod.CATALOGO)
  assert.match(html, /noindex, nofollow, noarchive, nosnippet/)
  assert.match(html, /Ruta perimetral no convergente/)
  assert.match(html, /404 UNMAPPED_EDGE_ROUTE/)
  assert.match(html, /CF-EDGE: MAD/)
  assert.match(html, /RAY: abc-MAD/)
  assert.match(html, /Wildcard Active/)
  assert.match(html, /TLS 1\.3 \/ HTTP\/3 via Cloudflare Edge/)
  assert.match(html, /ACTIVE ROUTE DIRECTORY/)
  assert.match(html, />nutri\.</)
  assert.doesNotMatch(html, /<script>alert|\/<script>/)
  assert.match(html, /&lt;script&gt;/)
  assert.equal((html.match(/grid-cols-2/g) || []).length > 0, true)
  const css = readFileSync(join(raiz, '..', 'src', 'estilos.gen.ts'), 'utf8')
  assert.match(css, /\.h-screen/)
  assert.match(css, /emerald/)
})

test('las cabeceras defensivas son las pedidas', () => {
  const h = mod.CABECERAS_DIAGNOSTICO
  assert.equal(h['content-type'], 'text/html; charset=UTF-8')
  assert.equal(h['x-content-type-options'], 'nosniff')
  assert.equal(h['x-frame-options'], 'DENY')
  assert.equal(h['referrer-policy'], 'strict-origin-when-cross-origin')
  assert.equal(h['strict-transport-security'], 'max-age=31536000; includeSubDomains; preload')
  assert.equal(h['cache-control'], 'private, no-cache, no-store, must-revalidate')
})
