// What a pattern sees when it draws its region of a page.

import { esc, attrs } from "./html.ts";
import type { Derived, Size, WorkImages } from "./images.ts";
import type { Content, Geometry, PageSpec, Series, Template, Tokens, Work } from "./model.ts";

export interface Site {
  content: Content;
  tokens: Tokens;
  template: Template;
  geometry: Geometry;
  images: Map<string, WorkImages>;
}

export interface PageCtx {
  site: Site;
  spec: PageSpec;
  /** this page's path from the site root ("" or "fuji/") */
  path: string;
  /** relative prefix back to the site root ("" or "../") */
  root: string;
  series?: Series;
  work?: Work;
  workIndex?: number;
  /** which nav entry is current: a series id, the about id, or "" */
  current: string;
}

export interface Pattern {
  name: string;
  /** stylesheets under src/fit/css */
  css: string[];
  /** browser scripts under src/fit/client */
  scripts?: string[];
  /** the image sizes this pattern shows; only the sizes a template asks for are derived */
  sizes?: Size[];
  render(ctx: PageCtx): string;
}

/** A word this site uses for something, e.g. "prev", "index", "unit". */
export function label(ctx: PageCtx, key: string, fallback: string): string {
  return ctx.site.content.labels?.[key] ?? fallback;
}

/** A link from this page to a path from the site root. */
export function href(ctx: PageCtx, path: string): string {
  return ctx.root + path || "./";
}

export function seriesPath(s: Series): string {
  return `${s.id}/`;
}

export function workPath(s: Series, i: number): string {
  return `${s.id}/${String(i + 1).padStart(2, "0")}/`;
}

export function aboutPath(content: Content): string | undefined {
  return content.about ? `${content.about.id}/` : undefined;
}

/** The alt text of a work: the artist and the title, as a caption would name it. */
export function altOf(content: Content, work: Work): string {
  return `${content.artist.name}「${work.title}」`;
}

export function derived(ctx: PageCtx, work: Work, size: Size): Derived {
  const one = ctx.site.images.get(work.image)?.[size];
  if (!one) throw new Error(`no ${size} image for ${work.image}: does the pattern list that size?`);
  return one;
}

/** An <img> of a work at one size. */
export function imgTag(ctx: PageCtx, work: Work, size: Size, extra: Record<string, string | boolean | undefined> = {}): string {
  const d = derived(ctx, work, size);
  return `<img${attrs({ src: ctx.root + d.src, width: d.w, height: d.h, alt: altOf(ctx.site.content, work), ...extra })}>`;
}

/** The label fields of a work, in reading order: date, technique, holder (linked). */
export function metaSpans(work: Work): string {
  const parts: string[] = [];
  if (work.date) parts.push(`<span>${esc(work.date)}</span>`);
  if (work.format) parts.push(`<span>${esc(work.format)}</span>`);
  if (work.credit && work.url) parts.push(`<span><a href="${esc(work.url)}" target="_blank" rel="noopener noreferrer">${esc(work.credit)}</a></span>`);
  else if (work.credit) parts.push(`<span>${esc(work.credit)}</span>`);
  return parts.join("");
}

/** How many label fields a work carries (title, English title, date, technique, holder). */
export function captionFields(work: Work): number {
  return [work.title, work.titleEn, work.date, work.format, work.credit].filter(Boolean).length;
}
