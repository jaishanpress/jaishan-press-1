// Local preview only (excluded from deploys via .vercelignore): serves static files and mimics vercel.json rewrites.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const port = Number(process.env.PORT) || 3000;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

function withHelpers(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.send = (b) => res.end(b);
  res.redirect = (u) => { res.statusCode = 302; res.setHeader('Location', u); res.end(); };
  return res;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  try {
    const news = url.pathname.match(/^\/news\/([^/]+)\/?$/);
    const api = url.pathname.match(/^\/api\/(\w+)(?:\.js)?$/);
    if (news || api) {
      if (news) req.url = `/api/index.js?id=${news[1]}`;
      req.query = Object.fromEntries(new URL(req.url, url).searchParams);
      const mod = await import(join(root, 'api', `${api ? api[1] : 'index'}.js`) + `?t=${Date.now()}`);
      return mod.default(req, withHelpers(res));
    }
    const file = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!file.startsWith(root)) throw new Error('forbidden');
    const body = await readFile(file);
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(port, () => console.log(`Dev server on http://localhost:${port}`));
