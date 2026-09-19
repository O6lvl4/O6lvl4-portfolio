import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";

const root = resolve("site");
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
      await page.locator("#work-query").fill("__no_such_portfolio_project__");
      await page.waitForTimeout(250);
      assert.match(await page.locator("#work-count").innerText(), /0/);
      await page.locator("#work-clear").click();
    }
    await page.goto(base);
    await page.waitForURL(`${base}/en/`);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log("PASS: all languages at mobile and desktop sizes, images, search, redirect and browser errors");
} finally {
  await browser.close();
  server.close();
}
