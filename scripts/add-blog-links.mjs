import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()&&!['assets','scripts'].includes(e.name))walk(f);else if(e.isFile()&&e.name==='index.html')files.push(f)}}
walk(root);
for(const file of files){let h=fs.readFileSync(file,'utf8');if(h.includes('class="blog-entry"'))continue;const en=path.relative(root,file).split(path.sep).includes('en');const href=en?'/en/blog/':'/blog/';const label=en?'Blog':'บทความ';h=h.replace('</nav>',`<a class="blog-entry nav-link" href="${href}">${label}</a></nav>`);fs.writeFileSync(file,h,'utf8')}
console.log(`Added Blog links to ${files.length} pages.`)
