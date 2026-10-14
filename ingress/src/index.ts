import { catalogoResuelto, slugsEnrutados, type EnvCatalogo } from './catalogo.ts'
import { debeDiagnosticar, hechosDesde } from './hechos.ts'
import { CABECERAS_DIAGNOSTICO, htmlDiagnostico } from './plantilla.ts'

export interface Env extends EnvCatalogo {}

function respuestaDiagnostico(request: Request, catalogo: Awaited<ReturnType<typeof catalogoResuelto>>): Response {
  const html = htmlDiagnostico(hechosDesde(request), catalogo)
  return new Response(html, { status: 404, headers: CABECERAS_DIAGNOSTICO })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const lista = await catalogoResuelto(env)
    const host = new URL(request.url).hostname
    if (!debeDiagnosticar(host, slugsEnrutados(lista))) return fetch(request)
    return respuestaDiagnostico(request, lista)
  },
}
