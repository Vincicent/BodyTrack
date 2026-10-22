// Serves the exported web build (dist/) like production: with the COOP/COEP headers that SQLite in the browser needs
// , and Expo Router's static pages (/entry/new → entry/new.html).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'dist');
const PORT = Number(process.env.PORT ?? 8090);
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.ttf': 'font/ttf',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  for (const candidate of [clean, `${clean}.html`, join(clean, 'index.html')]) {
    const path = join(ROOT, candidate);
    if (path.startsWith(ROOT) && (await isFile(path))) return path;
  }
  return join(ROOT, '+not-found.html');
}

createServer(async (req, res) => {
  const path = await resolve(new URL(req.url ?? '/', 'http://localhost').pathname);
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Content-Type', TYPES[extname(path)] ?? 'application/octet-stream');
  res.end(await readFile(path));
}).listen(PORT, () => console.log(`Serving dist/ on http://localhost:${PORT}`));
