import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer((req,res)=>{
  const clean = decodeURIComponent((req.url || '/').split('?')[0]);
  const requested = clean.endsWith('/') ? `${clean}index.html` : clean;
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file,(err,data)=>{ if(err){res.writeHead(404);return res.end('Not found');} res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data); });
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '0.0.0.0', () => console.log(`EasyGoSIM Thailand site listening on ${port}`));
