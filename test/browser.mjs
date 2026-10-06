import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";
import { TEXT } from "../scripts/text.mjs";

const root = resolve("site");
const summaries = JSON.parse(await readFile("data/summaries.json", "utf8"));
const projects = JSON.parse(await readFile("data/projects.json", "utf8"));
const almide = projects.find((p) => p.full === "almide/almide");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = resolve(root, `.${path}${path.endsWith("/") ? "index.html" : ""}`);
  try {
    assert(file.startsWith(root + sep));
    res.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch();
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, locale: "en-US" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const lang of ["en", "ja", "zh"]) {
      for (const route of ["", "works/"]) {
        await page.goto(`${base}/${lang}/${route}`, { waitUntil: "networkidle" });
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${lang}/${route} overflows at ${width}`);
        assert(await page.evaluate(() => [...document.images].filter((img) => img.loading !== "lazy").every((img) => img.complete && img.naturalWidth > 0)), `${lang}/${route}: broken image`);
      }
      const arlk = page.locator('.repo-item[data-name="arlk"]');
      assert.equal(await arlk.getAttribute("data-org"), "almide");
      assert.equal(await arlk.locator(".repo-desc").textContent(), summaries["O6lvl4/arlk"][lang].what);
      assert.equal(await page.locator('.repo-item[data-name="nn"] .repo-desc').textContent(), summaries["almide-graphics/nn"][lang].what);
      await page.locator("#work-query").fill("arlk");
      assert.equal(await arlk.isVisible(), true);
      await page.locator("#work-clear").click();
      await page.locator("#work-query").fill("__no_such_portfolio_project__");
      await page.waitForTimeout(250);
      assert.match(await page.locator("#work-count").innerText(), /0/);
      await page.locator("#work-clear").click();
      await page.goto(`${base}/${lang}/almide/`, { waitUntil: "networkidle" });
      assert(almide.release, "Almide's published release metadata was not collected");
      const release = page.locator('.object-meta-panel[aria-label="almide"] .om-fig').filter({ has: page.locator(".om-fig-key", { hasText: TEXT[lang].stats.release }) });
      assert.equal(await release.locator(".om-fig-val").textContent(), almide.release.tag);
      assert.equal(await page.locator('.repo-item[data-name="arlk"]').count(), 1);
    }
    await page.goto(base);
    await page.waitForURL(`${base}/en/`);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log("PASS: all languages at mobile and desktop sizes, images, search, redirect, release label, Arlk family and translated Arlk/nn summaries");
} finally {
  await browser.close();
  server.close();
}
