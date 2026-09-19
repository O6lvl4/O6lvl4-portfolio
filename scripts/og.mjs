// The share card, one per language: the mark, the handle, what the work is, and the figures, on
// the same ground as the site.
//
//   node scripts/og.mjs ja

import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const lang = process.argv[2] ?? "ja";
const c = JSON.parse(readFileSync(`data/content.${lang}.json`, "utf8"));
const avatar = `data:image/jpeg;base64,${readFileSync("assets/avatar.png").toString("base64")}`;
const total = c.series.reduce((n, s) => n + s.works.length, 0);
const orgs = c.series.length;
const most = c.landing.stack[0].items[0].replace(/[（(].*/, "");
const FIGURES = {
  ja: ["リポジトリ", "置き場所", "よく書く言語"],
  en: ["REPOSITORIES", "ORGS", "MOST WRITTEN"],
  zh: ["仓库", "组织", "常写的语言"],
};
const FONT = {
  ja: "'Source Sans 3', 'Noto Sans JP', sans-serif",
  en: "'Source Sans 3', sans-serif",
  zh: "'Source Sans 3', 'Noto Sans SC', sans-serif",
};
const figures = FIGURES[lang] ?? FIGURES.en;

const html = `<style>
  @import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:opsz,wght@9..144,400..700&family=Noto+Sans+JP:wght@400;500&family=Noto+Sans+Ogham&family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+JP:wght@600&family=Source+Sans+3:wght@300;400;600&display=swap");
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;background:#ffffff;color:#090909;font-family:${FONT[lang] ?? FONT.en};
       padding:74px 84px;display:flex;flex-direction:column;justify-content:space-between}
  body::before{content:"";position:fixed;top:0;left:0;width:3px;height:100%;background:#c42b17}
  .top{display:flex;align-items:center;gap:24px}
  .mark{width:64px;height:64px;object-fit:cover}
  h1{font-family:"DM Mono",monospace;font-size:52px;font-weight:500;letter-spacing:.04em;line-height:1}
  .stem{margin-left:auto;font-family:"Noto Sans Ogham",serif;font-size:32px;color:#6b6b6b}
  .role{font-family:"Fraunces","Noto Serif JP","Noto Serif SC",Georgia,serif;font-size:36px;font-weight:600;letter-spacing:.01em;line-height:1.25;margin-top:30px}
  .lead{font-size:19px;line-height:1.9;color:#6b6b6b;margin-top:16px;max-width:36em}
  .figs{display:flex;gap:56px;border-top:1px solid #dfdfdf;padding-top:24px}
  .fig{display:flex;flex-direction:column;gap:6px}
  .fig b{font-family:"DM Mono",monospace;font-size:34px;font-weight:500;font-variant-numeric:tabular-nums}
  .fig span{font-family:"DM Mono",monospace;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#a8a8a8}
</style>
<div class="top"><img class="mark" src="${avatar}"><h1>O6lvl4</h1><p class="stem">᚛ᚑᚌᚋᚐ᚜</p></div>
<div><p class="role">${c.artist.role}</p><p class="lead">${c.home.lead}</p></div>
<div class="figs">
  <span class="fig"><b>${total}</b><span>${figures[0]}</span></span>
  <span class="fig"><b>${orgs}</b><span>${figures[1]}</span></span>
  <span class="fig"><b>${most}</b><span>${figures[2]}</span></span>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.waitForTimeout(2000);
await page.screenshot({ path: `og.${lang}.jpg`, type: "jpeg", quality: 92 });
await browser.close();
process.stdout.write(`og.${lang}.jpg\n`);
