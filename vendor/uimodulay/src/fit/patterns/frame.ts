// The frame around the work: the artist's name down the left edge with the seal, and the
// series index across the top. On a phone both fold into one bar.

import { esc } from "../html.ts";
import { aboutPath, href, seriesPath, type PageCtx, type Pattern } from "../page.ts";

const INSTAGRAM = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/></svg>`;
const MAIL = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>`;

/** Instagram and mail as marks; with `labels`, the handle and address beside them. */
export function contactList(ctx: PageCtx, cls: string, labels = false): string {
  const c = ctx.site.content.contact;
  if (!c || !(c.instagram || c.email)) return "";
  const items: string[] = [];
  if (c.instagram) {
    const handle = c.instagramHandle ? "　" + esc(c.instagramHandle) : "";
    const text = labels ? `<span>Instagram${handle}</span>` : "";
    items.push(`<li><a href="${esc(c.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${INSTAGRAM}${text}</a></li>`);
  }
  if (c.email) {
    const text = labels ? `<span>${esc(c.email)}</span>` : "";
    items.push(`<li><a href="mailto:${esc(c.email)}" aria-label="メール">${MAIL}${text}</a></li>`);
  }
  return `<ul class="contact ${cls}">${items.join("")}</ul>`;
}

/** The maker's mark: their own picture when the content has one, else the two-character seal. */
export function seal(ctx: PageCtx): string {
  const { artist } = ctx.site.content;
  if (artist.avatar) return `<img class="mark" src="${ctx.root}mark${extOf(artist.avatar)}" width="96" height="96" alt="" aria-hidden="true">`;
  if (!artist.seal) return "";
  return `<span class="seal" aria-hidden="true"><i>${esc(artist.seal[0])}</i><i>${esc(artist.seal[1])}</i></span>`;
}

function extOf(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot < 0 ? ".png" : path.slice(dot);
}

/**
 * Ogham is cut as notches along a stem and read from the foot of the stone up, which is what the
 * rail already is: a stem down the left edge. The letters carry no information the page needs, so
 * they are hidden from a reader that cannot render them and what they say is on the title.
 */
function oghamStem(ctx: PageCtx): string {
  const cut = ctx.site.content.artist.ogham;
  if (!cut) return "";
  return `<span class="ogham" aria-hidden="true" title="${esc(cut.reads)}">${esc(cut.letters)}</span>`;
}

export const rail: Pattern = {
  name: "rail",
  css: ["rail"],
  render(ctx) {
    const a = ctx.site.content.artist;
    const life = a.life ? `<span class="life">${esc(a.life)}</span>` : "";
    return `<aside class="rail" aria-label="${esc(a.name)}">
  <a class="railName" href="${href(ctx, "")}" aria-label="${esc(a.name)}　トップへ"><span class="ja">${esc(a.name)}</span></a>
  ${seal(ctx)}
  ${oghamStem(ctx)}
  <span class="railEn">${esc(a.nameEn)}${life}</span>
  ${contactList(ctx, "railContact")}
</aside>`;
  },
};

interface NavEntry {
  id: string;
  path: string;
  full: string;
  short: string;
  count?: number;
}

function navLink(ctx: PageCtx, e: NavEntry): string {
  const current = ctx.current === e.id;
  const n = e.count ? `<span class="count">${e.count}</span>` : "";
  return `<a href="${href(ctx, e.path)}" class="link${current ? " current" : ""}"${current ? ` aria-current="page"` : ""}><span class="full">${esc(e.full)}</span><span class="short">${esc(e.short)}</span>${n}</a>`;
}

function langLinks(ctx: PageCtx, cls: string): string {
  const list = ctx.site.content.langs;
  if (!list?.length) return "";
  const items = list.map((l) => (l.href ? `<a href="${href(ctx, l.href)}">${esc(l.label)}</a>` : `<span class="current">${esc(l.label)}</span>`));
  return `<div class="${cls}">${items.join("")}</div>`;
}

export { langLinks };

export const seriesNav: Pattern = {
  name: "series-nav",
  css: ["nav"],
  render(ctx) {
    const { content } = ctx.site;
    const links = content.series.map((s) => navLink(ctx, { id: s.id, path: seriesPath(s), full: s.title, short: s.short ?? s.title, count: s.works.length }));
    const about = aboutPath(content);
    if (content.about && about) links.push(navLink(ctx, { id: content.about.id, path: about, full: content.about.nav, short: content.about.nav }));
    return `<nav class="topNav">
  <a class="navArtist" href="${href(ctx, "")}">${seal(ctx)}<span class="ja">${esc(content.artist.name)}</span></a>
  <div class="links">${links.join("")}</div>
  ${langLinks(ctx, "navLangs")}
</nav>`;
  },
};
