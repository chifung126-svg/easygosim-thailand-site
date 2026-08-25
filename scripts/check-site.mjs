import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(root, '..');
const required = ['index.html', 'en/index.html', 'japan/index.html', 'en/japan/index.html', 'assets/site.css', 'sitemap.xml', 'robots.txt'];
const errors = required.filter((file) => !fs.existsSync(path.join(siteRoot, file)));

for (const file of required.filter((item) => item.endsWith('.html'))) {
  const fullPath = path.join(siteRoot, file);
  if (!fs.existsSync(fullPath)) continue;
  const html = fs.readFileSync(fullPath, 'utf8');
  if (!html.includes('https://line.me/R/ti/p/@712unbyr')) errors.push(`${file}: LINE link missing`);
  if (!html.includes('ไทย') && !html.includes('English')) errors.push(`${file}: language switch missing`);
  if (!html.includes('/assets/site.css')) errors.push(`${file}: stylesheet missing`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Thailand site check passed for ${required.length} files.`);
