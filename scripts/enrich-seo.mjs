import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const site = 'https://th.easygosim.us';
const line = 'https://line.me/R/ti/p/@712unbyr';

const destinationNames = {
  japan: { th: 'ญี่ปุ่น', en: 'Japan', image: '/assets/japan-fuji-sakura-hero.png' },
  korea: { th: 'เกาหลี', en: 'Korea', image: '/assets/korea-seoul-hero.png' },
  'hong-kong': { th: 'ฮ่องกง', en: 'Hong Kong', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=85' },
  china: { th: 'จีน', en: 'China', image: '/assets/china-great-wall-hero.png' },
  taiwan: { th: 'ไต้หวัน', en: 'Taiwan', image: '/assets/taiwan-taipei-hero.png' }
};

const titleOverrides = {
  'blog/china-esim-guide': ['คู่มือ eSIM จีนสำหรับคนไทย | EasyGoSIM', 'China eSIM guide for Thai travellers | EasyGoSIM'],
  'blog/esim-compatible-phones': ['มือถือรุ่นไหนรองรับ eSIM? | EasyGoSIM', 'Which phones support eSIM? | EasyGoSIM'],
  'blog/how-to-install-esim': ['วิธีติดตั้ง eSIM ก่อนเดินทาง | EasyGoSIM', 'How to install an eSIM before travel | EasyGoSIM'],
  'blog/japan-esim-guide': ['คู่มือซื้อ eSIM ญี่ปุ่นสำหรับคนไทย | EasyGoSIM', 'Japan eSIM buying guide for Thai travellers | EasyGoSIM'],
  'blog/korea-esim-guide': ['คู่มือซื้อ eSIM เกาหลีสำหรับคนไทย | EasyGoSIM', 'Korea eSIM buying guide for Thai travellers | EasyGoSIM']
};

const descriptionOverrides = {
  account: ['บัญชีสมาชิก EasyGoSIM สำหรับดูคำสั่งซื้อ สถานะ eSIM และข้อมูล QR Code ของลูกค้าไทย', 'Your EasyGoSIM member account for viewing orders, eSIM status and QR code details.'],
  login: ['เข้าสู่ระบบ EasyGoSIM ด้วยอีเมลหรือ Google เพื่อดูคำสั่งซื้อและจัดการ eSIM ของคุณ', 'Sign in to EasyGoSIM with email or Google to view orders and manage your travel eSIM.'],
  help: ['ศูนย์ช่วยเหลือ EasyGoSIM สำหรับการซื้อ ติดตั้ง ใช้งาน และแก้ไขปัญหา travel eSIM สำหรับคนไทย', 'EasyGoSIM help centre for buying, installing, using and troubleshooting travel eSIMs for Thai travellers.'],
  setup: ['คู่มือติดตั้ง eSIM บน iPhone และ Android พร้อมขั้นตอนสแกน QR Code ก่อนเดินทาง', 'Step-by-step eSIM installation guide for iPhone and Android, including QR code setup before travel.'],
  compatibility: ['เช็กว่า iPhone หรือ Android รุ่นของคุณรองรับ eSIM ก่อนซื้อแพ็กเกจท่องเที่ยว', 'Check whether your iPhone or Android phone supports eSIM before buying a travel plan.'],
  refund: ['นโยบายยกเลิกคำสั่งซื้อและคืนเงินของ EasyGoSIM สำหรับลูกค้าประเทศไทย', 'EasyGoSIM cancellation and refund policy for customers in Thailand.'],
  privacy: ['นโยบายความเป็นส่วนตัวของ EasyGoSIM และวิธีดูแลข้อมูลลูกค้าบนเว็บไซต์', 'EasyGoSIM privacy policy and how customer information is handled on this website.'],
  terms: ['ข้อกำหนดการใช้เว็บไซต์และบริการ travel eSIM ของ EasyGoSIM Thailand', 'Terms for using the EasyGoSIM Thailand website and travel eSIM services.']
};

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['assets', 'scripts'].includes(entry.name)) result.push(...walk(full));
    else if (entry.isFile() && entry.name === 'index.html') result.push(full);
  }
  return result;
}

function pagePath(file) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  return rel === 'index.html' ? '/' : `/${rel.slice(0, -'index.html'.length)}`;
}

function basePath(file) {
  const current = pagePath(file).replace(/^\//, '').replace(/\/$/, '');
  return current.startsWith('en/') ? current.slice(3) : current;
}

function textFromHtml(value) {
  return value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function attr(value, name) {
  const match = value.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
}

function replaceOrAdd(html, pattern, replacement, anchor = '</head>') {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(anchor, `${replacement}${anchor}`);
}

function metadata(html, file) {
  const current = pagePath(file);
  const base = basePath(file);
  const english = current.startsWith('/en/');
  const lang = english ? 'en' : 'th';
  const canonical = `${site}${current}`;
  const thaiUrl = `${site}/${base}${base ? '/' : ''}`;
  const englishUrl = `${site}/en/${base}${base ? '/' : ''}`;
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  let title = textFromHtml(titleMatch?.[1] || 'EasyGoSIM Thailand travel eSIM');
  let description = descMatch?.[1] || '';
  const overrideKey = base.replace(/\/$/, '');
  if (titleOverrides[overrideKey]) title = titleOverrides[overrideKey][english ? 1 : 0];
  if (descriptionOverrides[overrideKey]) description = descriptionOverrides[overrideKey][english ? 1 : 0];
  if (base === '' && english) description = 'EasyGoSIM helps Thai travellers prepare travel eSIMs for Japan, Korea, Hong Kong, China and Taiwan. Choose a plan, pay by card and receive your QR code by email.';
  if (base === '' && !english) description = 'EasyGoSIM ช่วยคนไทยเตรียม travel eSIM สำหรับญี่ปุ่น เกาหลี ฮ่องกง จีน และไต้หวัน เลือกแพ็กเกจ ชำระด้วยบัตร และรับ QR Code ทางอีเมล';
  if (title.length < 30) {
    title = `${title.replace(/\s*\|\s*EasyGoSIM$/i, '')} | ${english ? 'Thailand travel eSIM' : 'travel eSIM สำหรับคนไทย'} | EasyGoSIM`;
  }
  if (description.length < 70) description = `${description} ${english ? 'Built for Thai travellers.' : 'สำหรับนักท่องเที่ยวไทย'}`;
  if (description.length > 160) description = `${description.slice(0, 157).trimEnd()}...`;

  html = html.replace(/<title[^>]*>.*?<\/title>/is, `<title>${title}</title>`);
  html = html.replace(/<meta[^>]+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta[^>]+content=["'][^"']*["'][^>]+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}">`);

  html = html.replace(/\s*<link[^>]+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi, '');
  const languageLinks = `<link rel="alternate" hreflang="th" href="${thaiUrl}"><link rel="alternate" hreflang="en" href="${englishUrl}"><link rel="alternate" hreflang="x-default" href="${thaiUrl}">`;
  html = replaceOrAdd(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">${languageLinks}`);

  html = html.replace(/\s*<meta[^>]+property=["']og:[^>]+>/gi, '').replace(/\s*<meta[^>]+name=["']twitter:[^>]+>/gi, '');
  const slug = base.split('/')[0];
  const image = destinationNames[slug]?.image || `${site}/assets/easygosim-logo.png`;
  const og = `<meta property="og:type" content="${base.startsWith('blog/') && base !== 'blog' ? 'article' : 'website'}"><meta property="og:locale" content="${lang === 'th' ? 'th_TH' : 'en_US'}"><meta property="og:site_name" content="EasyGoSIM Thailand"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}">`;
  html = replaceOrAdd(html, /<meta[^>]+property=["']og:title["'][^>]*>/i, og);

  html = html.replace(/\s*<script[^>]+data-seo-generated=["']true["'][^>]*>.*?<\/script>/gis, '');
  const structured = [];
  structured.push({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: lang });
  if (destinationNames[base]) {
    const prices = [...html.matchAll(/฿([0-9,]+)/g)].map((m) => Number(m[1].replace(/,/g, ''))).filter(Boolean);
    const productImage = destinationNames[base].image.startsWith('http') ? destinationNames[base].image : `${site}${destinationNames[base].image}`;
    const product = { '@context': 'https://schema.org', '@type': 'Product', name: `${english ? destinationNames[base].en : destinationNames[base].th} travel eSIM`, description, image: productImage, brand: { '@type': 'Brand', name: 'EasyGoSIM' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'THB', offerCount: Math.max(1, (html.match(/data-esim-sku=/g) || []).length), lowPrice: String(Math.min(...(prices.length ? prices : [1]))), highPrice: String(Math.max(...(prices.length ? prices : [1]))), url: canonical } };
    structured.push(product);
  }
  const questions = [...html.matchAll(/<details[^>]*>\s*<summary>(.*?)<\/summary>\s*<p>(.*?)<\/p>\s*<\/details>/gis)].map((m) => ({ '@type': 'Question', name: textFromHtml(m[1]), acceptedAnswer: { '@type': 'Answer', text: textFromHtml(m[2]) } }));
  if (questions.length) structured.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions });
  const scripts = structured.map((item) => `<script type="application/ld+json" data-seo-generated="true">${JSON.stringify(item)}</script>`).join('');
  if (scripts) html = html.replace('</head>', `${scripts}</head>`);
  return html;
}

for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, metadata(original, file), 'utf8');
}
console.log(`Enriched SEO metadata for ${walk(root).length} HTML pages.`);
