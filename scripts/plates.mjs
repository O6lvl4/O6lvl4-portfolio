// A plate for every project, drawn from that project's own material: its site as it renders, its
// command as it answers, or what its README says it does. One frame for all of them, so the
// projects read as one body of work.
//
// Site and command plates are the same in every language and go to plates/shared/; the README
// summary is set in each language, under plates/<lang>/.
//
//   node scripts/plates.mjs [--only owner/name,…] [--langs ja,en,zh] [--force]

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const summaries = existsSync("data/summaries.json") ? JSON.parse(readFileSync("data/summaries.json", "utf8")) : {};
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const only = flag("only")?.split(",");
const langs = (flag("langs") ?? "ja,en,zh").split(",");
const force = args.includes("--force");

const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

// The same faces the site is set in, so a plate and the page around it read as one thing.
const FONTS =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700" +
  "&family=Noto+Sans+JP:wght@400;500&family=Noto+Sans+Ogham&family=Noto+Sans+SC:wght@400;500&display=swap";

/** OGMA, cut between the feather marks that open and close an inscription. */
const OGHAM = "᚛ᚑᚌᚋᚐ᚜";

/**
 * Projects whose README opens with a mark of their own: that mark is the plate, shown as the
 * project shows it, rather than a screenshot of anything.
 */
const LOGOS = {
  "almide/almide": { file: "assets/almide-banner.jpg", tint: "#08080a", type: "image/jpeg" },
};

const SOURCE = {
  ja: { label: "README.md より要約", font: "'JetBrains Mono', 'Noto Sans JP', monospace" },
  en: { label: "summarised from README.md", font: "'JetBrains Mono', monospace" },
  zh: { label: "由 README.md 摘要", font: "'JetBrains Mono', 'Noto Sans SC', monospace" },
};

const CSS = `
  :root { --ink:#090909; --ink-2:#6b6b6b; --ink-3:#a8a8a8; --paper:#ffffff; --mat:#f2f2f2; --rule:#dfdfdf; --accent:#c42b17; }
  *{box-sizing:border-box;margin:0}
  body{width:100vw;height:100vh;background:var(--mat);font-family:'JetBrains Mono','Noto Sans JP',monospace}
  .plate{width:100vw;height:100vh;padding:46px;display:grid}
  .plate.bare{padding:0}
  .sheet{position:relative;background:var(--paper);border:1px solid var(--rule);overflow:hidden;display:grid}
  .sheet::before{content:"";position:absolute;top:0;left:0;width:2px;height:100%;background:var(--accent);z-index:1}
  .shot{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
  .logo{position:relative;display:grid;place-items:center;overflow:hidden}
  .logo::before{content:"";position:absolute;inset:-20%;background:radial-gradient(46% 46% at 42% 50%,rgba(224,54,38,.2),transparent 70%)}
  .logoImg{position:relative;width:100%;height:auto;display:block}
  .term{background:#0c0c0c;color:#f2f2f2;padding:28px 30px;font-family:'JetBrains Mono',Menlo,monospace;font-size:15.5px;line-height:1.6;white-space:pre;overflow:hidden}
  .term .cmd{color:#e03626}
  .term .cmd::before{content:"$ ";color:#e03626}
  .card{padding:44px 48px;display:flex;flex-direction:column;gap:22px;overflow:hidden}
  .top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
  .src{font-family:'JetBrains Mono',Menlo,monospace;font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-3)}
  .mark{width:44px;height:44px;object-fit:cover;flex:none}
  .name{font-family:'JetBrains Mono',Menlo,monospace;font-size:33px;font-weight:500;letter-spacing:.02em;color:var(--ink)}
  .what{font-size:26px;line-height:1.65;letter-spacing:.01em;color:var(--ink)}
  .points{list-style:none;padding:0;display:flex;flex-direction:column;gap:14px;
          border-top:1px solid var(--rule);padding-top:24px}
  .points li{display:flex;gap:14px;font-size:18.5px;line-height:1.6;color:var(--ink-2)}
  .points li::before{content:"";flex:none;width:2px;height:17px;margin-top:.35em;background:var(--accent)}
  .foot{margin-top:auto;display:flex;align-items:baseline;justify-content:space-between;gap:24px}
  .langs{font-family:'JetBrains Mono',Menlo,monospace;font-size:13px;letter-spacing:.1em;color:var(--ink-3)}
  .stem{font-family:'Noto Sans Ogham',serif;font-size:22px;color:var(--ink-2)}
`;

function cardHtml(p, lang, avatar) {
  const s = summaries[p.full]?.[lang];
  const src = SOURCE[lang];
  const what = s?.what ?? p.lead ?? p.name;
  const points = (s?.points ?? []).slice(0, 3);
  return `<div class="plate"><div class="sheet"><div class="card" style="font-family:${src.font}">
    <div class="top"><div>
      <p class="src">${esc(src.label)}</p>
      <p class="name">${esc(p.name)}</p>
    </div>${avatar ? `<img class="mark" src="${avatar}">` : ""}</div>
    <p class="what">${esc(what)}</p>
    ${points.length ? `<ul class="points">${points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    <div class="foot">
      <p class="langs">${esc([p.language, ...p.languages.slice(1, 3)].filter(Boolean).join(" · "))}</p>
      <p class="stem">${OGHAM}</p>
    </div>
  </div></div></div>`;
}

const shotHtml = (data) => `<div class="plate"><div class="sheet"><img class="shot" src="${data}"></div></div>`;
const termHtml = (t) => `<div class="plate"><div class="sheet"><div class="term"><span class="cmd">${esc(t.cmd)}</span>\n${esc(t.out)}</div></div></div>`;

/** A project with a mark of its own is shown by that mark, on the ground the mark is drawn on. */
function logoHtml(logo) {
  const data = `data:${logo.type};base64,${readFileSync(logo.file).toString("base64")}`;
  return `<div class="plate bare"><div class="sheet"><div class="logo" style="background:${logo.tint}">
      <img class="logoImg" src="${data}">
    </div></div></div>`;
}

/**
 * A page that needed something this browser has not got (WebGPU, a camera) renders as one flat
 * colour, sometimes with an error line on it. Such a shot says nothing about the project, so it
 * counts as a failure and the README summary is drawn instead.
 */
async function isFlat(buf) {
  const { channels } = await sharp(buf).stats();
  return channels.every((c) => c.stdev < 8);
}

async function shootSite(page, url) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 40000 });
  await page.waitForTimeout(2200);
  const buf = await page.screenshot({ type: "jpeg", quality: 88 });
  if (await isFlat(buf)) throw new Error("the page rendered as one flat colour");
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const avatarData = existsSync("assets/avatar.png")
  ? `data:image/jpeg;base64,${readFileSync("assets/avatar.png").toString("base64")}`
  : undefined;

const browser = await chromium.launch();
const shot = await browser.newPage();
const plate = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2 });

/** Every plate is 1200×750, except one made of a mark, which keeps the mark's own proportions. */
const PLATE = { width: 1200, height: 750 };

async function write(file, html, size = PLATE) {
  if (existsSync(file) && !force && !only) return false;
  await plate.setViewportSize(size);
  await plate.setContent(`<link rel="stylesheet" href="${FONTS}"><style>${CSS}</style>${html}`, { waitUntil: "load" });
  await plate.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  await plate.screenshot({ path: file, type: "jpeg", quality: 90 });
  return true;
}

/**
 * A project whose author uploaded a social preview is shown by that picture, as they drew it and at
 * its own proportions — the same courtesy a project's own mark gets.
 */
async function writePreview(file, url) {
  if (existsSync(file) && !force && !only) return false;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`social preview answered ${res.status}`);
  mkdirSync(dirname(file), { recursive: true });
  await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: 1600, withoutEnlargement: true })
    .flatten({ background: "#000000" })
    .jpeg({ quality: 90 })
    .toFile(file);
  return true;
}

/** The size a mark's plate is drawn at: the mark's own, with the frame added around it. */
async function logoSize(logo) {
  const { width, height } = await sharp(logo.file).metadata();
  const w = Math.min(width, 1600);
  return { width: w, height: Math.round((height / width) * w) };
}

let made = 0;
for (const p of projects) {
  if (only && !only.includes(p.full)) continue;
  if (p.plate === "og") {
    try {
      if (await writePreview(join("plates", "shared", p.owner, `${p.name}.jpg`), p.og)) made++;
      continue;
    } catch (e) {
      process.stderr.write(`social preview failed, falling back to the summary: ${p.full}: ${String(e).slice(0, 90)}\n`);
    }
  }
  const logo = LOGOS[p.full];
  if (logo || p.plate === "site" || p.plate === "terminal") {
    const file = join("plates", "shared", p.owner, `${p.name}.jpg`);
    let html;
    try {
      if (logo) html = logoHtml(logo);
      else html = p.plate === "site" ? shotHtml(await shootSite(shot, p.site)) : termHtml(p.terminal);
    } catch (e) {
      process.stderr.write(`site failed, falling back to the summary: ${p.full}: ${String(e).split("\n")[0].slice(0, 90)}\n`);
      html = undefined;
    }
    const size = logo ? await logoSize(logo) : PLATE;
    if (html && (await write(file, html, size))) made++;
    if (html) continue;
  }
  for (const lang of langs) {
    if (await write(join("plates", lang, p.owner, `${p.name}.jpg`), cardHtml(p, lang, avatarData))) made++;
  }
  if (made % 50 === 0 && made) process.stderr.write(`${made} plates\n`);
}
await browser.close();
process.stdout.write(`${made} plates → plates/\n`);
