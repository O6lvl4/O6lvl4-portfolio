// Fail deployment if collection, rendered repository lists or local assets are incomplete.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const site = new URL("../", JSON.parse(readFileSync("data/content.en.json", "utf8")).baseUrl).href;
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
assert(projects.length > 0, "No projects");
assert.equal(new Set(projects.map((p) => p.full)).size, projects.length, "Duplicate projects");
for (const lang of ["en", "ja", "zh"]) {
  const content = JSON.parse(readFileSync(`data/content.${lang}.json`, "utf8"));
  const ids = content.series.flatMap((s) => s.works.map((w) => w.id)).sort();
  assert.deepEqual(ids, projects.map((p) => p.full).sort(), `${lang}: missing projects`);
  const works = readFileSync(`site/${lang}/works/index.html`, "utf8");
  for (const p of projects) assert(works.includes(p.url), `${lang}: missing ${p.full}`);
  assert(existsSync(`site/${lang}/index.html`), `${lang}: no home page`);
  // The share card is named in a meta tag by its absolute URL, where a missing file shows up
  // only once the link is posted somewhere.
  assert(existsSync(`site/${lang}/share/og.jpg`), `${lang}: no share card`);
}
function verifyPage(file) {
  const html = readFileSync(file, "utf8");
  assert(!/\bNaN\b/.test(html), `${file}: invalid statistics`);
  // A share card is named by its absolute URL, so a stale name is a 404 nobody sees until the
  // link is posted somewhere.
  for (const [, url] of html.matchAll(/property="og:image" content="([^"]+)"/g)) {
    assert(url.startsWith(site), `${file}: share card is not on this site: ${url}`);
    assert(existsSync(join("site", decodeURIComponent(url.slice(site.length)))), `${file}: missing share card ${url}`);
  }
  for (const [, locale] of html.matchAll(/property="og:locale" content="([^"]+)"/g)) {
    assert(/^[a-z]{2}_[A-Z]{2}$/.test(locale), `${file}: og:locale is not language_TERRITORY: ${locale}`);
  }
  for (const [, url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/|\/)/i.test(url)) continue;
    const path = resolve(dirname(file), url.split(/[?#]/)[0]);
    assert(existsSync(path), `${file}: missing ${url}`);
  }
}
function verify(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) verify(file);
    else if (entry.name.endsWith(".html")) verifyPage(file);
  }
}
verify("site");
process.stdout.write(`Verified ${projects.length} projects in all three languages and local page assets\n`);
