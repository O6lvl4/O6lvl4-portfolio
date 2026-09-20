// The parts the oghma page is built from: its marks, its icons, and the small pieces every
// section uses — the section head, a meter, a language's own colour, the maker's links.

import { esc } from "../html.ts";
import { label, type PageCtx } from "../page.ts";
import type { Series, Work } from "../model.ts";

/**
 * Beith Luis Fearn Sail Nion, Huath Dair Tinne Coll Ceirt, Muin Gort nGéadal Straif Ruis, then
 * the vowels Ailm Onn Úr Eadhadh Iodhadh — the aicmi in their own order, one to five strokes on
 * one side of the stem, then the other, then across it, then notches through it. A mark therefore
 * counts what it marks, and twenty of them are as many as ogham has.
 */
export const MARKS = [
  "ᚁ", "ᚂ", "ᚃ", "ᚄ", "ᚅ",
  "ᚆ", "ᚇ", "ᚈ", "ᚉ", "ᚊ",
  "ᚋ", "ᚌ", "ᚍ", "ᚎ", "ᚏ",
  "ᚐ", "ᚑ", "ᚒ", "ᚓ", "ᚔ",
] as const;
/** The feather marks that open and close an inscription, for anything past the twentieth. */
export const TRUNK_ENDS = "᚛᚜";

export const GITHUB_ICON =
  `<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
export const X_ICON =
  `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
export const LINK_ICON =
  `<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M6.5 2.5H3.6A1.6 1.6 0 0 0 2 4.1v8.3A1.6 1.6 0 0 0 3.6 14h8.3a1.6 1.6 0 0 0 1.6-1.6V9.5"/><path d="M9.5 2.5H14v4.5M14 2.5 7.8 8.7"/></svg>`;
export const SUN_ICON =
  `<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" width="13" height="13"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/><line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/><line x1="3.05" y1="3.05" x2="4.1" y2="4.1"/><line x1="11.9" y1="11.9" x2="12.95" y2="12.95"/><line x1="12.95" y1="3.05" x2="11.9" y2="4.1"/><line x1="4.1" y1="11.9" x2="3.05" y2="12.95"/></svg>`;
export const MOON_ICON =
  `<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a.5.5 0 0 0-.6-.6A7 7 0 1 0 14.1 11.1a.5.5 0 0 0-.6-.6z"/></svg>`;

/** Every work of every body, in the order the content gives them. */
export function works(series: Series[]): { work: Work; owner: Series }[] {
  return series.flatMap((s) => s.works.map((w) => ({ work: w, owner: s })));
}

/** Each language keeps the colour it is known by; the house language takes the ink. */
let colours = new Map<string, string>();

export function setColours(bars: { name: string; color?: string }[]): void {
  colours = new Map(bars.map((b) => [b.name, b.color ?? "currentColor"]));
}

export function dot(lang?: string): string {
  const colour = (lang && colours.get(lang)) || "currentColor";
  return `<span class="lang-dot" style="background:${esc(colour)};width:5px;height:5px" aria-hidden="true"></span>`;
}

export interface Head {
  /** which section this is, from the top of the page */
  at: number;
  id: string;
  title: string;
  count?: string;
}

export function head(h: Head): string {
  return `<div class="section-head">
      <span class="ogham-mark" aria-hidden="true">${MARKS[h.at] ?? TRUNK_ENDS}</span>
      <h2 class="section-title" id="heading-${h.id}">${esc(h.title)}</h2>
      ${h.count ? `<span class="section-count">${esc(h.count)}</span>` : ""}
    </div>`;
}

export function meter(fill: number, name: string): string {
  const pct = Math.round(fill * 100);
  return `<div class="panel-track" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(name)}"><div class="panel-fill" style="width:${pct}%"></div></div>`;
}

/** The mark of the place a link goes to, rather than one mark for all of them. */
function iconFor(href: string): string {
  if (/^https?:\/\/(www\.)?github\.com\//.test(href)) return GITHUB_ICON;
  if (/^https?:\/\/(www\.)?(x|twitter)\.com\//.test(href)) return X_ICON;
  return LINK_ICON;
}

/** Where else the maker is, as named links. */
export function socialLinks(ctx: PageCtx, cls: string): string {
  return (ctx.site.content.links ?? [])
    .map(
      (l) =>
        `<a class="${cls}" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${iconFor(l.href)}<span>${esc(l.label)}</span></a>`,
    )
    .join("");
}

export function text(ctx: PageCtx, key: string, fallback: string): string {
  return label(ctx, key, fallback);
}
