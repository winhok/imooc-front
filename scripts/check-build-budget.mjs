import { readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { resolve } from 'node:path'

const DIST_DIRECTORY = resolve('dist')
const MANIFEST_PATH = resolve(DIST_DIRECTORY, '.vite/manifest.json')
const INITIAL_JS_GZIP_BUDGET = 100 * 1024
const INITIAL_CSS_GZIP_BUDGET = 20 * 1024
const MAX_ASYNC_JS_GZIP_BUDGET = 190 * 1024

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
const entry = Object.values(manifest).find((chunk) => chunk.isEntry)

if (!entry) {
  throw new Error('Vite manifest does not contain an application entry')
}

function collectInitialFiles(chunk, files = new Set()) {
  files.add(chunk.file)

  for (const cssFile of chunk.css ?? []) {
    files.add(cssFile)
  }

  for (const importedKey of chunk.imports ?? []) {
    const importedChunk = manifest[importedKey]

    if (!importedChunk) {
      throw new Error(`Vite manifest references an unknown chunk: ${importedKey}`)
    }

    collectInitialFiles(importedChunk, files)
  }

  return files
}

async function gzipSize(relativePath) {
  const content = await readFile(resolve(DIST_DIRECTORY, relativePath))
  return gzipSync(content).byteLength
}

const initialFiles = collectInitialFiles(entry)
let initialJavaScriptGzip = 0
let initialCssGzip = 0
let largestAsyncJavaScript = { file: '', gzip: 0, raw: 0 }

for (const relativePath of initialFiles) {
  const size = await gzipSize(relativePath)

  if (relativePath.endsWith('.js')) {
    initialJavaScriptGzip += size
  } else if (relativePath.endsWith('.css')) {
    initialCssGzip += size
  }
}

for (const chunk of Object.values(manifest)) {
  if (!chunk.file?.endsWith('.js') || initialFiles.has(chunk.file)) {
    continue
  }

  const gzip = await gzipSize(chunk.file)

  if (gzip > largestAsyncJavaScript.gzip) {
    largestAsyncJavaScript = {
      file: chunk.file,
      gzip,
      raw: (await stat(resolve(DIST_DIRECTORY, chunk.file))).size
    }
  }
}

const formatKiB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`
const failures = []

if (initialJavaScriptGzip > INITIAL_JS_GZIP_BUDGET) {
  failures.push(
    `initial JavaScript ${formatKiB(initialJavaScriptGzip)} exceeds ${formatKiB(INITIAL_JS_GZIP_BUDGET)}`
  )
}

if (initialCssGzip > INITIAL_CSS_GZIP_BUDGET) {
  failures.push(
    `initial CSS ${formatKiB(initialCssGzip)} exceeds ${formatKiB(INITIAL_CSS_GZIP_BUDGET)}`
  )
}

if (largestAsyncJavaScript.gzip > MAX_ASYNC_JS_GZIP_BUDGET) {
  failures.push(
    `${largestAsyncJavaScript.file} gzip ${formatKiB(largestAsyncJavaScript.gzip)} exceeds ${formatKiB(MAX_ASYNC_JS_GZIP_BUDGET)}`
  )
}

console.log(
  [
    `initial JS gzip: ${formatKiB(initialJavaScriptGzip)}`,
    `initial CSS gzip: ${formatKiB(initialCssGzip)}`,
    `largest async JS: ${largestAsyncJavaScript.file} (${formatKiB(largestAsyncJavaScript.gzip)} gzip, ${formatKiB(largestAsyncJavaScript.raw)} raw)`
  ].join('\n')
)

if (failures.length > 0) {
  throw new Error(`Bundle budget exceeded:\n- ${failures.join('\n- ')}`)
}
