import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pages = [
  'japan/index.html', 'korea/index.html', 'hong-kong/index.html', 'china/index.html', 'taiwan/index.html',
  'en/japan/index.html', 'en/korea/index.html', 'en/hong-kong/index.html', 'en/china/index.html', 'en/taiwan/index.html',
];

for (const relative of pages) {
  const file = path.join(root, relative);
  const english = relative.startsWith('en/');
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(
    /https:\/\/checkout\.easygosim\.us\/jpesim-airwallex-checkout\?variant=([^&"']+)/g,
    `https://checkout.easygosim.us/jpesim-airwallex-checkout?variant=$1&market=TH&lang=${english ? 'en' : 'th'}`,
  );
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}
console.log('Patched 10 Thailand destination pages with regional checkout parameters.');
