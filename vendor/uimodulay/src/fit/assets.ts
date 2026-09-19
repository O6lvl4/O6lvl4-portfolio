// Files that ship with fit: templates, tokens, pattern stylesheets and browser scripts.
// They live next to the sources (src/fit/css, src/fit/client) and at the package root (fit/).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";
import { esc } from "./html.ts";
import type { Geometry, Tokens } from "./model.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
/** the package root: src/fit/ and dist/fit/ are both two levels down */
export const PACKAGE_ROOT = resolve(HERE, "..", "..");

/** A template or tokens file by name (fit/<kind>/<name>.json) or by path. */
export function libraryFile(kind: "templates" | "tokens", nameOrPath: string): string {
  if (nameOrPath.endsWith(".json")) return resolve(nameOrPath);
  return join(PACKAGE_ROOT, "fit", kind, `${nameOrPath}.json`);
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

const cssCache = new Map<string, string>();

/** A pattern stylesheet from src/fit/css (copied beside dist/fit on build). */
export function css(name: string): string {
  let text = cssCache.get(name);
  if (text === undefined) {
    text = readFileSync(join(HERE, "css", `${name}.css`), "utf8");
    cssCache.set(name, text);
  }
  return text;
}

/** A browser script from src/fit/client, as JavaScript (types stripped when read from source). */
export function clientScript(name: string): string {
  const ts = join(HERE, "client", `${name}.ts`);
  if (existsSync(ts)) return stripTypeScriptTypes(readFileSync(ts, "utf8"));
  return readFileSync(join(HERE, "client", `${name}.js`), "utf8");
}

/** Tokens and measured geometry as custom properties on :root. */
export function rootVars(tokens: Tokens, geometry: Geometry): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(tokens.color)) lines.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(tokens.font)) lines.push(`  --font-${k}: ${v};`);
  for (const [k, v] of Object.entries(geometry)) lines.push(`  --g-${k}: ${v};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/** The seal as a favicon: the first character of the seal on the seal colour. */
export function sealSvg(tokens: Tokens, seal: string): string {
  const bg = tokens.color.seal ?? "#b3392b";
  const ink = tokens.color["seal-ink"] ?? "#f7f0e6";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="3" fill="${bg}"/><rect x="9" y="9" width="46" height="46" fill="none" stroke="${ink}" stroke-width="2"/><text x="32" y="44" text-anchor="middle" font-family="Hiragino Mincho ProN, Yu Mincho, serif" font-size="30" font-weight="700" fill="${ink}">${esc(seal)}</text></svg>\n`;
}
