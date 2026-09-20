// The share card, rendered at its published 1200 × 630 size. One card, in English, for every
// language: what a link to this site shows in a timeline is the same everywhere.
//
// A timeline shows it at a third of this size, where anything set small is simply not there. So
// the card carries four things, all of them large: the face, the name, what the work is, and how
// much of it there is. No labels, no captions, no fine print.
//
//   node scripts/og.mjs
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const LINES = ["Developer tools,", "from the language up."];
const FIGURES = ["Repositories", "Commits", "Languages"];

const c = JSON.parse(readFileSync("data/content.en.json", "utf8"));
const esc = (s) => String(s).replace(/[&<>"']/g, (v) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[v]);
const avatar = `data:image/png;base64,${readFileSync("assets/avatar.png").toString("base64")}`;
const figures = FIGURES.map((label) => c.landing.figures.find((f) => f.label === label)).filter(Boolean);
const tally = figures.map((f) => `<span class="n">${esc(f.value)}</span> ${esc(f.label.toLowerCase())}`).join('<span class="sep">·</span>');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap">
<style>
:root {
  --ink: oklch(0.04 0 0);
  --muted: oklch(0.46 0.008 250);
  --rule: oklch(0.88 0.004 250);
  --accent: oklch(0.5 0.22 25);
  --display: 'JetBrains Mono', ui-monospace, monospace;
}
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body {
  display: flex; flex-direction: column; justify-content: space-between; gap: 48px;
  background: oklch(0.985 0.002 250); color: var(--ink);
  font-family: var(--display); padding: 76px 72px 68px;
}
.who { display: flex; align-items: center; gap: 40px; }
.who img { width: 200px; height: 200px; border-radius: 50%; flex: none; filter: grayscale(1) contrast(1.05); }
.name { font-size: 46px; font-weight: 500; letter-spacing: -.05em; margin-bottom: 14px; }
h1 { font-size: 66px; font-weight: 700; line-height: 1.16; letter-spacing: -.06em; }
h1 span { display: block; white-space: nowrap; }
h1 span:last-child { color: var(--accent); }
.tally { border-top: 2px solid var(--rule); padding-top: 36px; font-size: 38px; font-weight: 400; color: var(--muted); letter-spacing: -.03em; white-space: nowrap; }
.tally .n { font-weight: 700; color: var(--ink); }
.tally .sep { color: var(--accent); margin: 0 22px; }
</style></head><body>
<div class="who">
  <img src="${avatar}" alt="">
  <div>
    <div class="name">${esc(c.artist.name)}</div>
    <h1>${LINES.map((line) => `<span>${esc(line)}</span>`).join("")}</h1>
  </div>
</div>
<div class="tally">${tally}</div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const fits = await page.evaluate(() => {
    const within = (el) => el.scrollWidth <= el.clientWidth;
    const smallest = [...document.querySelectorAll("body *")]
      .filter((el) => el.textContent?.trim() && !el.children.length)
      .reduce((px, el) => Math.min(px, parseFloat(getComputedStyle(el).fontSize)), Infinity);
    return { ok: document.body.scrollHeight <= 630 && [...document.querySelectorAll("h1 span, .tally")].every(within), smallest };
  });
  if (!fits.ok) throw new Error("OG card overflows");
  // Nothing on the card may be smaller than this: below it, a timeline's thumbnail shows a smudge.
  if (fits.smallest < 30) throw new Error(`OG card sets text at ${fits.smallest}px`);
  await page.screenshot({ path: "og.jpg", type: "jpeg", quality: 95 });
} finally {
  await browser.close();
}
process.stdout.write("og.jpg\n");
