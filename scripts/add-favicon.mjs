import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const favicon = '<link rel="icon" type="image/png" href="/assets/easygosim-logo.png">';

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
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('rel="icon"')) continue;
  fs.writeFileSync(file, html.replace('<head>', `<head>${favicon}`), 'utf8');
}

console.log(`Favicon added to ${htmlFiles(root).length} HTML pages.`);
