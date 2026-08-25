import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const favicon = '<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"><link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">';

function htmlFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) result.push(full);
  }
  return result;
}

for (const file of htmlFiles(root)) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/\s*<link[^>]+rel=["'](?:icon|apple-touch-icon)["'][^>]*>/gi, '');
  fs.writeFileSync(file, html.replace('<head>', `<head>${favicon}`), 'utf8');
}

console.log(`Favicon added to ${htmlFiles(root).length} HTML pages.`);
