// A typography-led share card, rendered at its published 1200 × 630 size.
//   node scripts/og.mjs [ja|en|zh]
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const lang = process.argv[2] ?? "en";
const copy = {
  ja: { lines: ['開発の道具を、', '言語からつくる。'], caption: '言語設計から、使い続ける道具まで。', font: 'Noto Sans JP' },
  en: { lines: ['Developer tools,', 'from the language up.'], caption: 'Language design. Tools built to be used.', font: 'Inter' },
  zh: { lines: ['从语言开始，', '构建开发工具。'], caption: '从语言设计，到持续使用的工具。', font: 'Noto Sans SC' },
}[lang];
if (!copy) throw new Error(`Unknown language: ${lang}`);
const c = JSON.parse(readFileSync(`data/content.${lang}.json`, "utf8"));
const esc = (s) => String(s).replace(/[&<>"']/g, (v) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[v]);
const avatar = `data:image/png;base64,${readFileSync("assets/avatar.png").toString("base64")}`;
const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap">
<style>
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: #f5f4f0; color: #20201e; font-family: '${copy.font}', sans-serif; padding: 48px 64px 42px; }
.top { display: flex; justify-content: space-between; align-items: center; }
.identity { display: flex; gap: 14px; align-items: center; }
.identity img { width: 42px; height: 42px; border-radius: 50%; filter: grayscale(1); }
.name { font: 500 25px/1 'Inter', sans-serif; letter-spacing: -.06em; }
.edition { display: flex; align-items: center; gap: 14px; font: 500 12px/1.5 'Inter', sans-serif; letter-spacing: .14em; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #bd362a; }
.hero { position: absolute; left: 64px; right: 64px; top: 173px; }
h1 { font-size: 76px; font-weight: 700; line-height: 1.3; letter-spacing: -.065em; }
h1 span { display: block; white-space: nowrap; }
h1 span:last-child { color: #b63429; }
.caption { margin-top: 24px; color: #6b6b65; font-size: 17px; font-weight: 400; letter-spacing: .015em; }
.footer { position: absolute; bottom: 42px; left: 64px; right: 64px; border-top: 1px solid #d2d1ca; padding-top: 22px; display: flex; justify-content: space-between; align-items: center; }
.subjects { display: flex; gap: 27px; align-items: center; font: 500 13px/1.4 'Inter', sans-serif; letter-spacing: -.015em; }
.subjects span + span::before { content: '/'; margin-right: 27px; color: #aaa99f; }
.address { font: 400 12px/1.4 'Inter', sans-serif; color: #73736d; }
.registration { position: absolute; right: 64px; top: 170px; width: 50px; height: 50px; border-right: 1px solid #b63429; border-top: 1px solid #b63429; }
html[lang='en'] h1 { font-size: 78px; line-height: 1.18; letter-spacing: -.065em; }
html[lang='en'] .hero { top: 184px; }
html[lang='en'] .caption { margin-top: 30px; }
</style></head><body>
<header class="top"><div class="identity"><img src="${avatar}" alt=""><span class="name">${esc(c.artist.name)}</span></div><div class="edition"><span class="dot"></span> SOFTWARE PORTFOLIO</div></header>
<div class="registration" aria-hidden="true"></div>
<main class="hero"><h1>${copy.lines.map((line) => `<span>${esc(line)}</span>`).join('')}</h1><p class="caption">${esc(copy.caption)}</p></main>
<footer class="footer"><div class="subjects"><span>Almide</span><span>Developer tools</span><span>AI infrastructure</span></div><span class="address">github.com/${esc(c.artist.name)}</span></footer>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const fits = await page.evaluate(() => {
    const hero = document.querySelector('.hero').getBoundingClientRect();
    const footer = document.querySelector('.footer').getBoundingClientRect();
    return hero.bottom < footer.top && [...document.querySelectorAll('h1 span')].every((line) => line.scrollWidth <= line.clientWidth);
  });
  if (!fits) throw new Error(`OG text overflows for ${lang}`);
  await page.screenshot({ path: `og.${lang}.jpg`, type: 'jpeg', quality: 95 });
} finally {
  await browser.close();
}
process.stdout.write(`og.${lang}.jpg\n`);
