// Fit content into a template: measure the template's geometry off its reference ASTs, draw
// every page with the patterns it names, and write a static site that works from any path.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { css as cssFile, clientScript, libraryFile, readJson, rootVars, sealSvg } from "./assets.ts";
import { documentHtml, type Head } from "./html.ts";
import { deriveImages, SIZES, type Size } from "./images.ts";
import { loadReferences, measure, type Measured } from "./measure.ts";
import type { Content, PageSpec, Series, Share, Template, Tokens, Work } from "./model.ts";
import type { PageCtx, Site } from "./page.ts";
import { pattern } from "./patterns/index.ts";

export interface BuildOptions {
  content: string;
  template: string;
  tokens: string;
  out: string;
}

export interface BuildResult {
  pages: string[];
  measured: Measured;
}

export function loadContent(file: string): { content: Content; sourceRoot: string } {
  const content = JSON.parse(readFileSync(file, "utf8")) as Content;
  if (!content.series?.length) throw new Error(`${file}: no series`);
  return { content, sourceRoot: resolve(dirname(file), content.root) };
}

interface Instance {
  path: string;
  series?: Series;
  work?: Work;
  workIndex?: number;
}

function fill(path: string, content: Content, s?: Series, i?: number): string {
  return path
    .replace("{series}", s?.id ?? "")
    .replace("{work}", i === undefined ? "" : String(i + 1).padStart(2, "0"))
    .replace("{about}", content.about?.id ?? "about");
}

function instances(spec: PageSpec, content: Content): Instance[] {
  if (spec.each === "series") return content.series.map((s) => ({ path: fill(spec.path, content, s), series: s }));
  if (spec.each === "work") {
    return content.series.flatMap((s) => s.works.map((w, i) => ({ path: fill(spec.path, content, s, i), series: s, work: w, workIndex: i })));
  }
  if (spec.id === "about" && !content.about) return [];
  return [{ path: fill(spec.path, content) }];
}

/** Share cards are published under share/, whatever their path in the content. */
function published(s: Share): Share {
  return { image: `share/${basename(s.image)}`, alt: s.alt };
}

type Titled = Omit<Head, "path" | "root" | "share" | "icon">;

function workHead(content: Content, s: Series, w: Work): Titled {
  const description = [w.titleEn, w.date, w.format].filter(Boolean).join("　");
  return { title: `${w.title} | ${s.title} | ${content.title}`, description: description || content.description };
}

function pageHead(content: Content, spec: PageSpec, s?: Series): Titled {
  if (s) return { title: `${s.title} | ${content.title}`, description: s.intro ?? content.description };
  if (spec.id === "about" && content.about) return { title: `${content.about.nav} | ${content.title}`, description: content.about.description ?? content.description };
  return { title: content.title, description: content.home.description ?? content.description };
}

function headFor(content: Content, spec: PageSpec, inst: Instance): Omit<Head, "path" | "root" | "icon"> {
  const { series: s, work: w } = inst;
  const titled = w && s ? workHead(content, s, w) : pageHead(content, spec, s);
  return { ...titled, share: published(s?.share ?? content.share) };
}

function stylesheet(site: Site, spec: PageSpec): string {
  const names = ["base", ...spec.regions.flatMap((r) => pattern(r.pattern).css)];
  return [rootVars(site.tokens, site.geometry), ...[...new Set(names)].map(cssFile)].join("\n");
}

/** The image sizes a template needs: what its patterns show, or every size if none say. */
function sizesFor(template: Template): Size[] {
  const asked = new Set(template.pages.flatMap((p) => p.regions.flatMap((r) => pattern(r.pattern).sizes ?? [])));
  return asked.size ? [...asked] : (Object.keys(SIZES) as Size[]);
}

function scriptsFor(spec: PageSpec): string[] {
  const names = new Set(spec.regions.flatMap((r) => pattern(r.pattern).scripts ?? []));
  return [...names].map(clientScript);
}

function renderPage(site: Site, spec: PageSpec, inst: Instance, icon: Head["icon"]): string {
  const depth = inst.path.split("/").filter(Boolean).length;
  const root = "../".repeat(depth);
  const current = inst.series?.id ?? (spec.id === "about" ? site.content.about?.id ?? "" : "");
  const ctx: PageCtx = { site, spec, path: inst.path, root, series: inst.series, work: inst.work, workIndex: inst.workIndex, current };
  const body = spec.regions.map((r) => pattern(r.pattern).render(ctx)).filter(Boolean).join("\n");
  const head: Head = { ...headFor(site.content, spec, inst), path: inst.path, root, icon };
  return documentHtml({ content: site.content, tokens: site.tokens, head, css: stylesheet(site, spec), body, scripts: scriptsFor(spec) });
}

const MEDIA: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };

/**
 * The maker's mark: their own picture copied to mark.<ext> when the content has one, else the
 * seal drawn from the tokens. It is both the mark on the page and the site's icon.
 */
function writeMark(content: Content, tokens: Tokens, sourceRoot: string, out: string): Head["icon"] {
  const { avatar } = content.artist;
  const from = avatar ? resolve(sourceRoot, avatar) : undefined;
  if (from && existsSync(from)) {
    const ext = extname(from).toLowerCase();
    copyFileSync(from, join(out, `mark${ext}`));
    return { file: `mark${ext}`, type: MEDIA[ext] ?? "image/png" };
  }
  writeFileSync(join(out, "seal.svg"), sealSvg(tokens, content.artist.seal?.[0] ?? content.artist.name.slice(0, 1)));
  return { file: "seal.svg", type: "image/svg+xml" };
}

function copyShares(content: Content, sourceRoot: string, out: string): void {
  const shares = [content.share, ...content.series.map((s) => s.share)].filter((s) => s !== undefined);
  for (const s of shares) {
    const from = resolve(sourceRoot, s.image);
    if (!existsSync(from)) continue;
    const to = join(out, published(s).image);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  }
}

export async function build(opts: BuildOptions): Promise<BuildResult> {
  const { content, sourceRoot } = loadContent(opts.content);
  const templateFile = libraryFile("templates", opts.template);
  const template = readJson<Template>(templateFile);
  const tokens = readJson<Tokens>(libraryFile("tokens", opts.tokens));
  const measured = measure(template, loadReferences(template, templateFile));
  const images = await deriveImages(content, sourceRoot, opts.out, sizesFor(template));
  const site: Site = { content, tokens, template, geometry: measured.geometry, images };
  const icon = writeMark(content, tokens, sourceRoot, opts.out);
  const pages: string[] = [];
  for (const spec of template.pages) {
    for (const inst of instances(spec, content)) {
      const file = join(opts.out, inst.path, "index.html");
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, renderPage(site, spec, inst, icon));
      pages.push(inst.path);
    }
  }
  copyShares(content, sourceRoot, opts.out);
  return { pages, measured };
}
