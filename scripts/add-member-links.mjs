import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const htmlFiles = [];
function walk(dir){ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory() && !['assets','scripts'].includes(entry.name)) walk(full); else if(entry.isFile() && entry.name==='index.html') htmlFiles.push(full); } }
walk(root);
for(const file of htmlFiles){
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('class="member-entry"')) continue;
  const english=path.relative(root,file).split(path.sep).some(part=>part==='en');
  const href=english?'/en/login/':'/login/';
  const label=english?'Member':'สมาชิก';
  const marker=`<a class="member-entry" href="${href}">${label}</a>`;
  html=html.replace('</nav>',`${marker}</nav>`);
  fs.writeFileSync(file,html,'utf8');
}
console.log(`Added member links to ${htmlFiles.length} Thai-site pages.`);
