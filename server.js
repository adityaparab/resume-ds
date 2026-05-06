import path from 'node:path';
import { createServer } from 'node:http';
import { readFileSync, statSync, existsSync, watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { createApp } from 'json-server/lib/app.js';
import { Observer } from 'json-server/lib/adapters/observer.js';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'db.json');
const STATIC_DIR = path.join(__dirname, 'dist');

// ---------------------------------------------------------------------------
// LowDB setup (json-server v1 uses lowdb internally)
// ---------------------------------------------------------------------------
const adapter = new Observer(new NormalizedAdapter(new JSONFile(DB_FILE)));
const db = new Low(adapter, {});
await db.read();

// ---------------------------------------------------------------------------
// Create json-server v1 app (REST API)
// ---------------------------------------------------------------------------
const jsonApp = createApp(db, { logger: false });

// ---------------------------------------------------------------------------
// MIME types for static file serving
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function serveStatic(urlPath, res) {
  let filePath = path.join(STATIC_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!existsSync(filePath)) {
    // SPA fallback: if the file doesn't exist, serve index.html
    filePath = path.join(STATIC_DIR, 'index.html');
  }
  try {
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (existsSync(indexPath)) filePath = indexPath;
      else { res.statusCode = 404; res.end('Not Found'); return; }
    }
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.end(readFileSync(filePath));
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // --- API routes (delegate to json-server) ---
  if (url.pathname.startsWith('/api')) {
    // Rewrite URL so json-server sees paths relative to /api
    req.url = url.pathname.replace(/^\/api/, '') + url.search;
    return jsonApp.attach(req, res);
  }

  // --- Static files + SPA fallback ---
  serveStatic(url.pathname, res);
});

// ---------------------------------------------------------------------------
// Watch db.json for changes (auto-reload) — in development
// ---------------------------------------------------------------------------
let writing = false;
let hadReadError = false;

adapter.onWriteStart = () => { writing = true; };
adapter.onWriteEnd = () => { writing = false; };

watch(DB_FILE).on('change', () => {
  if (!writing) {
    db.read().catch((e) => {
      if (e instanceof SyntaxError) {
        hadReadError = true;
        console.error(`❌ Invalid JSON in ${DB_FILE}:`, e.message);
      } else {
        throw e;
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend served from ${STATIC_DIR}`);
});