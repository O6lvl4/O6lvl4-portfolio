// The share card, rendered at its published 1200 × 630 size. One card, in English, for every
// language: what a link to this site shows in a timeline is the same everywhere.
//
// It is the site's own front page in one frame — the same monospaced display face, the same ogham
// signature, the same hairlines and the same red. The figures are read from the English content,
// so the card says what the site says today.
//
//   node scripts/og.mjs
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const LINES = ["Developer tools,", "from the language up."];
const CAPTION = "Language design. Tools built to be used.";
const EYEBROW = "SOFTWARE PORTFOLIO";
const SUBJECTS = ["Almide", "Developer tools", "AI infrastructure"];

const c = JSON.parse(readFileSync("data/content.en.json", "utf8"));
const esc = (s) => String(s).replace(/[&<>"']/g, (v) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[v]);
const avatar = `data:image/png;base64,${readFileSync("assets/avatar.png").toString("base64")}`;
const figure = (f) => `<div class="figure"><span class="value">${esc(f.value)}</span><span class="label">${esc(f.label)}</span></div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+Ogham&display=swap">
<style>
:root {
  --ink: oklch(0.04 0 0);
  --muted: oklch(0.46 0.008 250);
  --faint: oklch(0.68 0.008 250);
  --rule: oklch(0.88 0.004 250);
  --accent: oklch(0.5 0.22 25);
  --display: 'JetBrains Mono', ui-monospace, monospace;
}
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body {
  display: flex; flex-direction: column;
  background: oklch(0.985 0.002 250); color: var(--ink);
  font-family: var(--display); padding: 54px 64px 46px;
}
.rule { border-top: 1px solid var(--rule); }
.top { display: flex; justify-content: space-between; align-items: center; padding-bottom: 26px; }
.identity { display: flex; gap: 15px; align-items: center; }
.identity img { width: 40px; height: 40px; border-radius: 50%; filter: grayscale(1) contrast(1.05); }
.name { font: 500 24px/1 var(--display); letter-spacing: -.03em; }
.mark { display: flex; align-items: center; gap: 20px; }
.ogham { font-family: 'Noto Sans Ogham', serif; font-size: 22px; color: var(--faint); letter-spacing: .08em; }
.edition { display: flex; align-items: center; gap: 12px; font: 500 12px/1 var(--display); letter-spacing: .2em; color: var(--muted); }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 4px 0 14px; }
h1 { font-size: 62px; font-weight: 700; line-height: 1.18; letter-spacing: -.06em; }
h1 span { display: block; white-space: nowrap; }
h1 span:last-child { color: var(--accent); }
.caption { margin-top: 30px; color: var(--muted); font-size: 16px; font-weight: 400; letter-spacing: .01em; }
.figures { display: flex; padding: 24px 0; }
.figure { flex: 1; display: flex; flex-direction: column; gap: 9px; border-left: 1px solid var(--rule); padding-left: 22px; }
.figure:first-child { border-left: 0; padding-left: 0; }
.figure:first-child .value { color: var(--accent); }
.value { font: 500 33px/1 var(--display); letter-spacing: -.04em; }
.label { font-size: 12px; font-weight: 400; color: var(--muted); letter-spacing: .04em; }
.footer { display: flex; justify-content: space-between; align-items: center; padding-top: 22px; }
.subjects { display: flex; gap: 24px; align-items: center; font: 500 13px/1.4 var(--display); letter-spacing: -.01em; }
.subjects span + span::before { content: '/'; margin-right: 24px; color: var(--faint); font-weight: 400; }
.address { font: 400 12px/1.4 var(--display); color: var(--faint); letter-spacing: .02em; }
</style></head><body>
<header class="top">
  <div class="identity"><img src="${avatar}" alt=""><span class="name">${esc(c.artist.name)}</span></div>
  <div class="mark"><span class="ogham">${esc(c.artist.ogham.letters)}</span><span class="edition"><span class="dot"></span>${EYEBROW}</span></div>
</header>
<div class="rule"></div>
<main class="hero">
  <h1>${LINES.map((line) => `<span>${esc(line)}</span>`).join("")}</h1>
  <p class="caption">${esc(CAPTION)}</p>
</main>
<div class="rule"></div>
<section class="figures">${c.landing.figures.map(figure).join("")}</section>
<div class="rule"></div>
<footer class="footer">
  <div class="subjects">${SUBJECTS.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
  <span class="address">github.com/${esc(c.artist.name)}</span>
</footer>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const fits = await page.evaluate(() => {
    const within = (el) => el.scrollWidth <= el.clientWidth;
    return document.body.scrollHeight <= 630 && [...document.querySelectorAll("h1 span, .figure, .subjects")].every(within);
  });
  if (!fits) throw new Error("OG text overflows");
  await page.screenshot({ path: "og.jpg", type: "jpeg", quality: 95 });
} finally {
  await browser.close();
}
process.stdout.write("og.jpg\n");
