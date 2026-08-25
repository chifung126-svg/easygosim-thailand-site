import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const line = 'https://line.me/R/ti/p/@712unbyr';
const checkout = 'https://checkout.easygosim.us/jpesim-airwallex-checkout';
const checkoutVariants = { japan: '48748094750875', korea: 'eSIM-SKTUL-01', 'hong-kong': 'eSIM-CHMA1G-01', china: 'eSIM-CNA1G-01', taiwan: 'eSIM-TWR1G-01' };
const destinations = [
  { slug:'japan', th:'ญี่ปุ่น', en:'Japan', flag:'🇯🇵', city:'โตเกียว โอซาก้า เกียวโต และทั่วญี่ปุ่น', network:'เครือข่ายท้องถิ่นญี่ปุ่น', image:'/assets/japan-fuji-sakura-hero.png' },
  { slug:'korea', th:'เกาหลี', en:'Korea', flag:'🇰🇷', city:'โซล ปูซาน และเมืองท่องเที่ยวสำคัญ', network:'เครือข่ายท้องถิ่นเกาหลี', image:'/assets/korea-seoul-hero.png' },
  { slug:'hong-kong', th:'ฮ่องกง', en:'Hong Kong', flag:'🇭🇰', city:'ฮ่องกง เกาลูน และนิวเทร์ริทอรีส์', network:'เครือข่ายท้องถิ่นฮ่องกง', image:'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=85' },
  { slug:'china', th:'จีน', en:'China', flag:'🇨🇳', city:'จีนแผ่นดินใหญ่และเมืองท่องเที่ยวสำคัญ', network:'เครือข่ายท้องถิ่นจีน', image:'/assets/china-great-wall-hero.png' },
  { slug:'taiwan', th:'ไต้หวัน', en:'Taiwan', flag:'🇹🇼', city:'ไทเป ไถจง เกาสง และทั่วไต้หวัน', network:'เครือข่ายท้องถิ่นไต้หวัน', image:'/assets/taiwan-taipei-hero.png' }
];

const japanPlans = [
  { group:'4G', name:'4G 無限 3日', days:'3日', id:'48748094423195' },
  { group:'4G', name:'4G 無限 4日', days:'4日', id:'48748094455963' },
  { group:'4G', name:'4G 無限 5日', days:'5日', id:'48748094488731' },
  { group:'4G', name:'4G 無限 6日', days:'6日', id:'48748094521499' },
  { group:'4G', name:'4G 無限 7日', days:'7日', id:'48748094554267' },
  { group:'4G', name:'4G 無限 8日', days:'8日', id:'48748094587035' },
  { group:'4G', name:'4G 無限 9日', days:'9日', id:'48748094619803' },
  { group:'4G', name:'4G 無限 10日', days:'10日', id:'48748094652571' },
  { group:'5G', name:'5G 無限 3日', days:'3日', id:'48748094685339' },
  { group:'5G', name:'5G 無限 4日', days:'4日', id:'48748094718107' },
  { group:'5G', name:'5G 無限 5日', days:'5日', id:'48748094750875', best:true },
  { group:'5G', name:'5G 無限 6日', days:'6日', id:'48748094783643' },
  { group:'5G', name:'5G 無限 7日', days:'7日', id:'48748094816411' },
  { group:'5G', name:'5G 無限 8日', days:'8日', id:'48748094849179' },
  { group:'5G', name:'5G 無限 9日', days:'9日', id:'48748094881947' },
  { group:'5G', name:'5G 無限 10日', days:'10日', id:'48748094914715' },
  { group:'5G', name:'5G 無限 15日', days:'15日', id:'48748094947483' },
  { group:'5G', name:'5G 無限 26日', days:'26日', id:'48748094980251' }
];

const destinationPlans = {
  korea: [
    ...[1,2].flatMap(gb => [1,3,5,7,10,15,20,30].map(days => ({ group:`${gb}GB / 日`, name:`${gb}GB 每日 · ${days}日`, days, id:`eSIM-KR${gb}G-${String(days).padStart(2,'0')}` }))),
    ...[1,2,3,4,5,6,7,8,9,10,15,20,30,60,90].map(days => ({ group:'SKT unlimited', name:`SKT unlimited · ${days}日`, days, id:`eSIM-SKTUL-${String(days).padStart(2,'0')}`, best:days===5 }))
  ],
  'hong-kong': [1,2,3].flatMap(gb => [1,2,3,4,5,6,7,8,9,10,15,20,30].map(days => ({ group:`每日 ${gb}GB`, name:`${gb}GB 每日 · ${days}日`, days, id:`eSIM-CHMA${gb}G-${String(days).padStart(2,'0')}` }))),
  china: [
    ...[1,2,3].flatMap(gb => [1,2,3,4,5,6,7,8,9,10,15,20,30].map(days => ({ group:`每日 ${gb}GB`, name:`${gb}GB 每日 · ${days}日`, days, id:`eSIM-CNA${gb}G-${String(days).padStart(2,'0')}` }))),
    ...[1,2,3,4,5,6,7,8,9,10,15,20,30].flatMap(days => [
      { group:'MAX 10Mbps', name:`MAX 10Mbps · ${days}日`, days, id:`eSIM-CNA10M-${String(days).padStart(2,'0')}` },
      { group:'MAX 5Mbps', name:`MAX 5Mbps · ${days}日`, days, id:`eSIM-CNAMAX-${String(days).padStart(2,'0')}` }
    ])
  ],
  taiwan: [1,2,3].flatMap(gb => [1,3,5,7,10,15,20,30].map(days => ({ group:`每日 ${gb}GB`, name:`${gb}GB 每日 · ${days}日`, days, id:`eSIM-TWR${gb}G-${String(days).padStart(2,'0')}` })))
};

const pricing = {
  rmbToHkd: 1.1,
  marginMarkup: 1.55,
  fixedHkd: 5,
  hkdToThb: 4.1761,
  japan: {
    '48748094423195':22,'48748094455963':32,'48748094488731':37,'48748094521499':45,'48748094554267':52,'48748094587035':56,'48748094619803':65,'48748094652571':69,
    '48748094685339':35,'48748094718107':45,'48748094750875':54,'48748094783643':65,'48748094816411':74,'48748094849179':80,'48748094881947':94,'48748094914715':97,'48748094947483':142,'48748094980251':247
  },
  schedules: {
    'eSIM-KR1G':[4,7,10,13,18,27,35,52], 'eSIM-KR2G':[5,11,17,23,32,48,63,94], 'eSIM-SKTUL':[19,34,51,65,78,91,99,103,106,109,156,172,203,303,405],
    'eSIM-CHMA1G':[3,5,7,9,11,13,15,16,18,20,29,39,57], 'eSIM-CHMA2G':[5,8,12,15,19,22,25,29,32,36,53,70,104], 'eSIM-CHMA3G':[6,11,15,20,25,29,34,39,43,48,71,95,141],
    'eSIM-CNA1G':[4,6,8,10,12,14,16,18,20,23,33,44,65], 'eSIM-CNA2G':[5,9,13,17,21,25,28,32,36,40,59,79,117], 'eSIM-CNA3G':[7,12,17,23,28,33,38,44,49,54,80,107,159],
    'eSIM-CNA10M':[12,23,33,44,54,65,75,86,96,107,159,212,317], 'eSIM-CNAMAX':[10,19,28,37,45,54,63,72,80,89,133,177,264],
    'eSIM-TWR1G':[4,7,11,15,21,31,41,61], 'eSIM-TWR2G':[5,12,20,27,38,56,74,110], 'eSIM-TWR3G':[6,16,26,36,51,76,101,150]
  }
};
const scheduleDays = {
  dailyShort:[1,3,5,7,10,15,20,30], dailyLong:[1,2,3,4,5,6,7,8,9,10,15,20,30], skt:[1,2,3,4,5,6,7,8,9,10,15,20,30,60,90], japan4g:[3,4,5,6,7,8,9,10], japan5g:[3,4,5,6,7,8,9,10,15,26]
};
function costRmbFor(d,p) {
  if (d.slug === 'japan') return pricing.japan[p.id];
  const key = p.id.replace(/-\d+$/,'');
  const values = pricing.schedules[key];
  if (!values) return null;
  const days = d.slug === 'korea' && key === 'eSIM-SKTUL' ? scheduleDays.skt : d.slug === 'korea' ? scheduleDays.dailyShort : d.slug === 'taiwan' ? scheduleDays.dailyShort : scheduleDays.dailyLong;
  const index = days.indexOf(Number(p.days));
  return index < 0 ? null : values[index];
}
function thbPriceFor(d,p) {
  const cost = costRmbFor(d,p);
  if (cost == null) return null;
  const hkd = cost * pricing.rmbToHkd * pricing.marginMarkup + pricing.fixedHkd;
  return Math.max(1, Math.round((hkd * pricing.hkdToThb) / 10) * 10 - 1);
}

function planMarkup(d, en) {
  const plans = d.slug === 'japan' ? japanPlans : destinationPlans[d.slug];
  const groups = [...new Set(plans.map(p=>p.group))];
  const gbLabel = value => value.match(/\d+GB/)?.[0] || '';
  const localizedName = p => {
    const days = Number.parseInt(p.days, 10);
    const gb = gbLabel(p.group);
    if (gb) return en ? `${gb}/day · ${days} days` : `${gb}/วัน · ${days} วัน`;
    if (p.group === 'SKT unlimited') return en ? `SKT unlimited · ${days} days` : `SKT ไม่จำกัด · ${days} วัน`;
    if (p.group === '4G' || p.group === '5G') return en ? `${p.group} unlimited · ${days} days` : `${p.group} ไม่จำกัด · ${days} วัน`;
    return `${p.group} · ${en ? `${days} days` : `${days} วัน`}`;
  };
  const localizedGroup = group => {
    const gb = gbLabel(group);
    if (gb) return en ? `${gb}/day plans` : `แพ็กเกจ ${gb}/วัน`;
    if (group === 'SKT unlimited') return en ? 'SKT unlimited data' : 'อินเทอร์เน็ต SKT ไม่จำกัด';
    if (group === '4G' || group === '5G') return en ? `${group} unlimited data` : `${group} อินเทอร์เน็ตไม่จำกัด`;
    return group;
  };
  return `<div class="live-plan-groups" data-plan-grid>${groups.map(group=>`<section class="plan-group"><h4>${localizedGroup(group)}</h4><div class="plans">${plans.filter(p=>p.group===group).map(p=>{const price=thbPriceFor(d,p);return `<a class="plan live-plan${p.best?' best selected':''}" data-esim-sku="${p.id}" href="${checkout}?variant=${p.id}&market=TH&lang=${en?'en':'th'}"><strong>${localizedName(p)}</strong><small>${price==null?(en?'View THB price in Checkout':'ดูราคาเป็น THB ใน Checkout'):(en?`Recommended ฿${price}`:`ราคาแนะนำ ฿${price}`)}</small></a>`}).join('')}</div></section>`).join('')}</div>`;
}

function thaiPage(d) {
  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${d.en} eSIM สำหรับคนไทย | EasyGoSIM</title><meta name="description" content="ซื้อ eSIM ${d.th} สำหรับนักท่องเที่ยวไทย ติดตั้งก่อนเดินทาง รับ QR Code ทางอีเมลอัตโนมัติ"><link rel="canonical" href="https://th.easygosim.us/${d.slug}/"><link rel="alternate" hreflang="en" href="https://th.easygosim.us/en/${d.slug}/"><link rel="stylesheet" href="/assets/site.css"></head><body><div class="promo">สั่งซื้อวันนี้ รับ QR Code ทางอีเมลทันทีหลังชำระเงิน</div><header class="header"><div class="wrap nav"><a class="brand" href="/"><img src="/assets/easygosim-logo.png" alt="EasyGoSIM"></a><nav class="nav-links"><a class="nav-link" href="/#destinations">จุดหมายปลายทาง</a><a class="nav-link" href="/#how">วิธีใช้งาน</a><a class="nav-link" href="#faq">คำถามที่พบบ่อย</a><a class="support" href="${line}" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน LINE</a><a class="lang-switch" href="/en/${d.slug}/">English</a></nav></div></header><main><section class="hero"><div class="wrap hero-grid"><div class="hero-photo" style="background-image:linear-gradient(180deg,#0000,#0008),url('${d.image}')"><div><div class="eyebrow" style="color:#fff">${d.en} TRAVEL eSIM</div><h1>eSIM ${d.th}<br>สำหรับทริปของคุณ</h1><p>${d.city}</p></div></div><div class="product-panel"><div class="eyebrow">${d.en} eSIM</div><div class="product-title"><span class="flag">${d.flag}</span><h2>eSIM ${d.th}</h2></div><p class="product-sub">${d.network} · เหมาะสำหรับการเดินทางจากประเทศไทย</p><div class="proof-pills"><span class="pill mint">QR Code ทันที</span><span class="pill">ชำระด้วยบัตรเครดิต</span><span class="pill yellow">ช่วยเหลือทาง LINE</span></div><div class="plan-head"><h3>เลือกแพ็กเกจ</h3><span>ราคาเป็น THB</span></div><div class="plans"><button class="plan selected" type="button"><strong>ทริปสั้น</strong><small>3–5 วัน</small></button><button class="plan" type="button"><strong>ทริปมาตรฐาน</strong><small>7–10 วัน</small></button><button class="plan best" type="button"><strong>ทริปยาว</strong><small>15–30 วัน</small></button></div><div class="price-row"><span class="price-label">ราคาแพ็กเกจ THB<br>เลือกแผนที่เหมาะกับทริป</span><strong class="price">THB</strong></div><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">สอบถามและซื้อผ่าน LINE</a><p class="buy-note">ระบบจะเชื่อมต่อการชำระเงินด้วยบัตรเครดิตเมื่อ SKU THB พร้อม</p><a class="compat" href="#faq">ตรวจสอบโทรศัพท์ที่รองรับ eSIM</a></div></div></section><section class="proof-strip"><div class="wrap proof-grid"><div class="proof">${d.network}<span>เชื่อมต่อเครือข่ายปลายทาง</span></div><div class="proof">ติดตั้งล่วงหน้า<span>พร้อมใช้เมื่อถึงที่หมาย</span></div><div class="proof">ราคาเป็น THB<span>เหมาะกับลูกค้าไทย</span></div><div class="proof">QR Code อัตโนมัติ<span>ส่งทางอีเมลหลังชำระเงิน</span></div></div></section><section class="section" id="benefits"><div class="wrap"><h2>ทำไมเลือก EasyGoSIM สำหรับ${d.th}</h2><p class="lead">ซื้อก่อนเดินทาง ติดตั้งง่าย และมีทีมงานช่วยเหลือผ่าน LINE</p><div class="why-grid"><div class="info-card"><div class="info-icon">📶</div><h3>เชื่อมต่อได้เมื่อถึงที่หมาย</h3><p>เลือก eSIM เป็นดาต้าหลักเมื่อเดินทางถึง${d.th} ใช้แผนที่และแอปท่องเที่ยวได้สะดวก</p></div><div class="info-card"><div class="info-icon">✉️</div><h3>รับ QR Code ทางอีเมล</h3><p>ไม่ต้องรอรับซิมจริง ติดตั้ง eSIM ก่อนออกเดินทางได้จากที่บ้าน</p></div><div class="info-card"><div class="info-icon">💬</div><h3>มีทีมงานช่วยเหลือ</h3><p>หากมีปัญหา ติดต่อ EasyGoSIM ผ่าน LINE Official Account ได้</p></div></div></div></section><section class="section gray" id="network"><div class="wrap evidence"><div class="evidence-card pink"><h3>${d.network}</h3><p>ใช้ดาต้าสำหรับแผนที่ การเดินทาง การจอง และการติดต่อระหว่างทริป ${d.th}</p><p class="source">ความเร็วและพื้นที่ให้บริการขึ้นอยู่กับเครือข่ายและแพ็กเกจที่เลือก</p></div><div class="evidence-card"><h3>ติดตั้งก่อนออกเดินทาง</h3><p>แนะนำให้ติดตั้ง eSIM ตอนอยู่บ้านที่มี Wi‑Fi และเปิด Data Roaming เมื่อถึงปลายทาง</p><p class="source"><a href="${line}" target="_blank" rel="noopener noreferrer">ต้องการความช่วยเหลือ? ติดต่อผ่าน LINE →</a></p></div></div></section><section class="section" id="setup"><div class="wrap"><h2>ติดตั้งและใช้งาน 3 ขั้นตอน</h2><p class="lead">เตรียมอินเทอร์เน็ตให้พร้อมก่อนขึ้นเครื่อง</p><div class="steps"><div class="step"><div class="step-num">1</div><h3>ซื้อแพ็กเกจ</h3><p>เลือกจำนวนวันและข้อมูลที่เหมาะกับทริป${d.th}</p></div><div class="step"><div class="step-num">2</div><h3>สแกน QR Code</h3><p>รับ QR Code ทางอีเมล แล้วเพิ่ม eSIM ในการตั้งค่าโทรศัพท์</p></div><div class="step"><div class="step-num">3</div><h3>เปิดใช้เมื่อถึงที่หมาย</h3><p>เลือก eSIM สำหรับดาต้า เปิด Data Roaming แล้วเริ่มใช้งาน</p></div></div></div></section><section class="section gray" id="faq"><div class="wrap faq"><h2>คำถามที่พบบ่อย</h2><details open><summary>ซื้อแล้วจะได้รับ eSIM อย่างไร?</summary><p>หลังชำระเงินสำเร็จ ระบบจะส่ง QR Code และคู่มือติดตั้งไปยังอีเมลที่ใช้สั่งซื้อโดยอัตโนมัติ</p></details><details><summary>ติดตั้งก่อนเดินทางได้หรือไม่?</summary><p>ได้ แนะนำให้ติดตั้งก่อนออกเดินทางในสถานที่ที่มี Wi‑Fi แล้วเปิดใช้งานดาต้าเมื่อถึง${d.th}</p></details><details><summary>โทรศัพท์รุ่นใดรองรับ eSIM?</summary><p>iPhone รุ่นใหม่ส่วนใหญ่และ Android บางรุ่นรองรับ eSIM โปรดตรวจสอบรุ่นก่อนซื้อ หากไม่แน่ใจติดต่อทาง LINE</p></details><details><summary>ถ้ามีปัญหาต้องทำอย่างไร?</summary><p>ติดต่อ EasyGoSIM ผ่าน LINE Official Account พร้อมแจ้งหมายเลขคำสั่งซื้อ ทีมงานจะช่วยตรวจสอบให้</p></details></div></section><section class="final-cta"><div class="wrap"><h2>พร้อมเดินทางไป${d.th}แล้วหรือยัง?</h2><p>เลือกแพ็กเกจ รับ QR Code และเชื่อมต่อได้ทันทีเมื่อถึงที่หมาย</p><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">ติดต่อผ่าน LINE</a></div></section></main><footer class="footer"><div class="wrap footer-row"><div>EasyGoSIM Thailand · บริการลูกค้าตามเวลาประเทศไทย</div><div><a href="${line}">ติดต่อผ่าน LINE</a> · <a href="/en/${d.slug}/">English</a></div></div></footer><div class="mobile-purchase-bar"><div class="mobile-bar-inner"><div class="mobile-selected">eSIM ${d.th}<span>ราคาเป็น THB · QR Code ทางอีเมล</span></div><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">ติดต่อ LINE</a></div></div></body></html>`;
}

function wireCheckout(html,d,en=false){const url=`${checkout}?variant=${encodeURIComponent(checkoutVariants[d.slug])}&market=TH&lang=${en?'en':'th'}`;return html.replace(`href="${line}" target="_blank" rel="noopener noreferrer">สอบถามและซื้อผ่าน LINE`,`data-esim-sku="${d.slug==='japan'?'eSIM-KDDI-UL05':checkoutVariants[d.slug]}" href="${url}">ชำระเงินและซื้อผ่านบัตร`).replace(`href="${line}" target="_blank" rel="noopener noreferrer">Ask and buy via LINE`,`data-esim-sku="${d.slug==='japan'?'eSIM-KDDI-UL05':checkoutVariants[d.slug]}" href="${url}">Pay by credit card`).replace(new RegExp(`(<div class="mobile-purchase-bar">[\\s\\S]*?<a class="buy") href="${line.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}"`),`$1 href="${url}"`).replace('บริการลูกค้าตามเวลาประเทศไทย','บริการช่วยเหลือผ่าน LINE').replace('Support in Thailand time','LINE support');}
function polishPurchaseCopy(html){const thai=html.includes('<html lang="th"');const plans=html.includes('data-plan-grid')?html:html.replace(/<div class="plans">[\s\S]*?<\/div><div class="price-row">/,`<div class="plans"><div class="plan selected"><strong>${thai?'ดูแพ็กเกจจริงใน Checkout':'View live plans in Checkout'}</strong><small>${thai?'เลือกวันและแพ็กเกจที่มีอยู่ในระบบ':'Choose from the live days and plans'}</small></div></div><div class="price-row">`);return plans.replace('ระบบจะเชื่อมต่อการชำระเงินด้วยบัตรเครดิตเมื่อ SKU THB พร้อม','ไปที่ Checkout เพื่อยืนยันแพ็กเกจและราคา THB ก่อนชำระเงิน').replace('Credit-card checkout will be connected when the Thailand THB SKU is ready','Open Checkout to confirm the plan and THB price before paying.').replace(/(<div class="mobile-purchase-bar">[\s\S]*?<a class="buy" href="[^"]+"[^>]*>)[^<]*(<\/a>)/,`$1${thai?'ซื้อผ่านบัตร':'Checkout'}$2`);}

function englishPage(d) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${d.en} eSIM for Thai travellers | EasyGoSIM</title><meta name="description" content="Buy a ${d.en} travel eSIM for Thai travellers. Install before departure and receive your QR code automatically by email."><link rel="canonical" href="https://th.easygosim.us/en/${d.slug}/"><link rel="alternate" hreflang="th" href="https://th.easygosim.us/${d.slug}/"><link rel="stylesheet" href="/assets/site.css"></head><body><div class="promo">Order today and receive your QR code by email after payment</div><header class="header"><div class="wrap nav"><a class="brand" href="/en/"><img src="/assets/easygosim-logo.png" alt="EasyGoSIM"></a><nav class="nav-links"><a class="nav-link" href="/en/#destinations">Destinations</a><a class="nav-link" href="/en/#how">How it works</a><a class="nav-link" href="#faq">FAQ</a><a class="support" href="${line}" target="_blank" rel="noopener noreferrer">Contact via LINE</a><a class="lang-switch" href="/${d.slug}/">ไทย</a></nav></div></header><main><section class="hero"><div class="wrap hero-grid"><div class="hero-photo" style="background-image:linear-gradient(180deg,#0000,#0008),url('${d.image}')"><div><div class="eyebrow" style="color:#fff">${d.en.toUpperCase()} TRAVEL eSIM</div><h1>${d.en} eSIM<br>for your trip</h1><p>${d.city}</p></div></div><div class="product-panel"><div class="eyebrow">${d.en} eSIM</div><div class="product-title"><span class="flag">${d.flag}</span><h2>${d.en} travel eSIM</h2></div><p class="product-sub">${d.network} · built for travellers from Thailand</p><div class="proof-pills"><span class="pill mint">Instant QR code</span><span class="pill">Credit card payment</span><span class="pill yellow">LINE support</span></div><div class="plan-head"><h3>Choose a plan</h3><span>Prices in THB</span></div><div class="plans"><button class="plan selected" type="button"><strong>Short trip</strong><small>3–5 days</small></button><button class="plan" type="button"><strong>Standard trip</strong><small>7–10 days</small></button><button class="plan best" type="button"><strong>Long trip</strong><small>15–30 days</small></button></div><div class="price-row"><span class="price-label">THB plan pricing<br>Choose the right length</span><strong class="price">THB</strong></div><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">Ask and buy via LINE</a><p class="buy-note">Credit-card checkout will be connected when the Thailand THB SKU is ready</p><a class="compat" href="#faq">Check eSIM compatibility</a></div></div></section><section class="proof-strip"><div class="wrap proof-grid"><div class="proof">${d.network}<span>Local destination network</span></div><div class="proof">Install before flying<span>Ready on arrival</span></div><div class="proof">THB pricing<span>Made for Thai customers</span></div><div class="proof">Automatic QR delivery<span>Sent by email after payment</span></div></div></section><section class="section" id="benefits"><div class="wrap"><h2>Why EasyGoSIM for ${d.en}</h2><p class="lead">Buy before departure, install easily and get support through LINE</p><div class="why-grid"><div class="info-card"><div class="info-icon">📶</div><h3>Connect on arrival</h3><p>Choose the eSIM for mobile data when you arrive in ${d.en} and use travel apps with ease.</p></div><div class="info-card"><div class="info-icon">✉️</div><h3>QR code by email</h3><p>No physical SIM delivery. Install your eSIM before you leave home.</p></div><div class="info-card"><div class="info-icon">💬</div><h3>LINE support</h3><p>Contact EasyGoSIM through the LINE Official Account if you need help.</p></div></div></div></section><section class="section gray" id="network"><div class="wrap evidence"><div class="evidence-card pink"><h3>${d.network}</h3><p>Use data for maps, transport, bookings and communication throughout your ${d.en} trip.</p><p class="source">Speed and coverage depend on the selected plan and local network conditions.</p></div><div class="evidence-card"><h3>Install before departure</h3><p>Install your eSIM on Wi‑Fi before flying and turn on Data Roaming when you arrive.</p><p class="source"><a href="${line}" target="_blank" rel="noopener noreferrer">Need help? Contact us on LINE →</a></p></div></div></section><section class="section" id="setup"><div class="wrap"><h2>Three simple steps</h2><p class="lead">Prepare your connection before you fly</p><div class="steps"><div class="step"><div class="step-num">1</div><h3>Choose a plan</h3><p>Select the length and data plan for your ${d.en} trip.</p></div><div class="step"><div class="step-num">2</div><h3>Scan your QR code</h3><p>Receive the QR code by email and add the eSIM in your phone settings.</p></div><div class="step"><div class="step-num">3</div><h3>Activate on arrival</h3><p>Select the eSIM for data, turn on Data Roaming and connect.</p></div></div></div></section><section class="section gray" id="faq"><div class="wrap faq"><h2>Frequently asked questions</h2><details open><summary>How will I receive my eSIM?</summary><p>After successful payment, your QR code and setup guide are sent automatically to your order email.</p></details><details><summary>Can I install it before travelling?</summary><p>Yes. Install it on Wi‑Fi before departure and activate mobile data when you arrive in ${d.en}.</p></details><details><summary>Which phones support eSIM?</summary><p>Most newer iPhones and selected Android phones support eSIM. Check your model before buying or contact us on LINE.</p></details><details><summary>What if I need help?</summary><p>Contact EasyGoSIM through LINE with your order number and our team will help.</p></details></div></section><section class="final-cta"><div class="wrap"><h2>Ready for ${d.en}?</h2><p>Choose your plan, receive your QR code and connect when you arrive</p><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">Contact us on LINE</a></div></section></main><footer class="footer"><div class="wrap footer-row"><div>EasyGoSIM Thailand · Support in Thailand time</div><div><a href="${line}">Contact via LINE</a> · <a href="/${d.slug}/">ไทย</a></div></div></footer><div class="mobile-purchase-bar"><div class="mobile-bar-inner"><div class="mobile-selected">${d.en} eSIM<span>THB pricing · QR code by email</span></div><a class="buy" href="${line}" target="_blank" rel="noopener noreferrer">LINE support</a></div></div></body></html>`;
}

for (const d of destinations) {
  fs.mkdirSync(path.join(root,d.slug),{recursive:true});
  fs.mkdirSync(path.join(root,'en',d.slug),{recursive:true});
  const thaiHtml = thaiPage(d).replace(/<div class="plans">[\s\S]*?<\/div><div class="price-row">/,`${planMarkup(d,false)}<div class="price-row">`);
  const englishHtml = englishPage(d).replace(/<div class="plans">[\s\S]*?<\/div><div class="price-row">/,`${planMarkup(d,true)}<div class="price-row">`);
  fs.writeFileSync(path.join(root,d.slug,'index.html'),polishPurchaseCopy(wireCheckout(thaiHtml,d,false)),'utf8');
  fs.writeFileSync(path.join(root,'en',d.slug,'index.html'),polishPurchaseCopy(wireCheckout(englishHtml,d,true)),'utf8');
}
console.log(`Built ${destinations.length * 2} destination pages.`);
