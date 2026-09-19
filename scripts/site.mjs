// Build the site in every language, and the root that sends a visitor to theirs.
//
//   node scripts/site.mjs [ja en zh]

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "../../uimodulay/src/fit/build.ts";

const langs = process.argv.slice(2);
const wanted = langs.length ? langs : ["ja", "en", "zh"];

for (const lang of wanted) {
  const out = `site/${lang}`;
  mkdirSync(out, { recursive: true });
  const { pages, measured } = await build({ content: `data/content.${lang}.json`, template: "oghma", tokens: "oghma", out });
  const fallbacks = Object.entries(measured.readings).filter(([, v]) => v.from === "fallback").map(([k]) => k);
  process.stdout.write(`${lang}: ${pages.length} pages → ${out}${fallbacks.length ? ` (recorded values: ${fallbacks.join(", ")})` : ""}\n`);
}

writeFileSync("site/index.html", execFileSync("node", ["scripts/root.mjs"], { encoding: "utf8" }));
process.stdout.write("site/index.html\n");
