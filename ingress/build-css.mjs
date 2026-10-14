import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'

const raiz = dirname(fileURLToPath(import.meta.url))
const cli = join(raiz, 'node_modules', 'tailwindcss', 'lib', 'cli.js')
const cssSalida = join(raiz, 'src', '.entrada.min.css')

execFileSync(process.execPath, [cli, '-c', join(raiz, 'tailwind.config.js'), '-i', join(raiz, 'src', 'entrada.css'), '-o', cssSalida, '--minify'], {
  cwd: raiz,
  stdio: 'inherit',
})

const css = readFileSync(cssSalida, 'utf8')
writeFileSync(join(raiz, 'src', 'estilos.gen.ts'), `export const CSS = ${JSON.stringify(css)}\n`)

const destino = join(raiz, '..', 'functions', 'lib', 'diagnostico.js')
mkdirSync(dirname(destino), { recursive: true })
await esbuild.build({
  entryPoints: [join(raiz, 'src', 'publico.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  outfile: destino,
  logLevel: 'info',
})
