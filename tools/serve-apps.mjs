/**
 * Serves apps on its own origin.
 *
 * Submitted work runs in an iframe. If it were served from the Guild's own
 * origin we would face a bad choice: sandbox it without `allow-same-origin`,
 * which gives it an opaque origin — no localStorage, and every module script or
 * fetch it makes becomes a blocked cross-origin request — or grant
 * `allow-same-origin` and let arbitrary submitted code reach into the Guild.
 *
 * Serving apps from a different origin dissolves the dilemma: `allow-same-origin`
 * then refers to the *app's* origin, so an app keeps its own storage and loads
 * its own assets normally, while still being unable to touch anything of ours.
 *
 * In production point PUBLIC_APPS_ORIGIN at a separate host or subdomain. This
 * script is the local stand-in for that.
 */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('apps');
const PORT = Number(process.env.APPS_PORT ?? 4322);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  // Resolve inside ROOT and verify — never let ../ escape the apps folder.
  // decodeURIComponent throws on a malformed escape like `%zz`, and an
  // uncaught throw in a request handler takes the whole dev server down —
  // one stray link would end the session for every app being served.
  let path;
  try {
    path = resolve(join(ROOT, normalize(decodeURIComponent(url.pathname))));
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (!path.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }

  let info;
  try {
    info = statSync(path);
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': info.size,
    // Embedded from the Guild, which is a different origin by design.
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  createReadStream(path).pipe(res);
}).listen(PORT, () => {
  console.log(`apps origin  http://localhost:${PORT}  (serving ${ROOT})`);
});
