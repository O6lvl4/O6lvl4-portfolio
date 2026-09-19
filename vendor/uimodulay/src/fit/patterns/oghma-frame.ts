// The frame every oghma page shares: the ogham stem down the left, the bar across the top that
// says where you are and what the figures are, and the foot that closes the inscription.

import { esc } from "../html.ts";
import { href, label, type PageCtx } from "../page.ts";
import { MOON_ICON, SUN_ICON, works } from "./oghma-parts.ts";

/** The bar's own table of contents: anchors on the front page, except the list, which is a page. */
const NAV_KEYS = ["about", "object", "breakdown"] as const;
const NAV_IDS = ["entry", "object", "breakdown"] as const;

export function skip(ctx: PageCtx): string {
  return `<a class="skip-link" href="#main-content">${esc(label(ctx, "skip", "Skip to content"))}</a>`;
}


function localeSwitch(ctx: PageCtx): string {
  const langLinks = ctx.site.content.langs ?? [];
  if (langLinks.length < 2) return "";
  const btns = langLinks.map((l) => {
    const short = esc(l.label.slice(0, 2).toUpperCase());
    if (!l.href) return `<span class="locale-btn active" aria-current="true" lang="${esc(ctx.site.content.lang)}">${short}</span>`;
    return `<a class="locale-btn" href="${esc(ctx.root + l.href)}">${short}</a>`;
  });
  return `<div class="locale-switcher" role="group" aria-label="${esc(label(ctx, "language", "Language"))}">${btns.join("")}</div>`;
}

function readout(value: string, text: string): string {
  return `<div class="hdr-readout"><span class="hdr-readout-val">${esc(value)}</span><span class="hdr-readout-lbl">${esc(text)}</span></div>`;
}

export function header(ctx: PageCtx): string {
  const c = ctx.site.content;
  const home = href(ctx, "");
  const here = ctx.path === "";
  const anchors = NAV_IDS.map((id, i) => {
    const current = here && i === 0 ? ` aria-current="location"` : "";
    return `<a href="${home}#${id}"${current}>${esc(label(ctx, NAV_KEYS[i], id))}</a>`;
  });
  // The list of every repository is a page, not a section, so it is linked as one.
  const list = `<a href="${href(ctx, "works/")}"${ctx.path === "works/" ? ` aria-current="page"` : ""}>${esc(label(ctx, "work", "Work"))}</a>`;
  const nav = [anchors[0], list, ...anchors.slice(1)];
  const langCount = c.landing?.langs?.length ?? 0;
  return `<header class="site-header">
    <a class="hdr-callsign" href="${home}">${esc(c.artist.name)}</a>
    <nav class="hdr-nav" aria-label="${esc(label(ctx, "sections", "Sections"))}">${nav.join("")}</nav>
    <div class="hdr-right">
      ${readout(String(works(c.series).length), label(ctx, "unitShort", "repos"))}
      ${langCount ? readout(String(langCount), label(ctx, "langsShort", "langs")) : ""}
      ${localeSwitch(ctx)}
      <div class="theme-toggle" role="group" aria-label="${esc(label(ctx, "theme", "Colour scheme"))}">
        <button type="button" class="theme-icon-btn" data-theme-set="light" aria-pressed="false" aria-label="${esc(label(ctx, "light", "Light"))}">${SUN_ICON}</button>
        <button type="button" class="theme-icon-btn" data-theme-set="dark" aria-pressed="false" aria-label="${esc(label(ctx, "dark", "Dark"))}">${MOON_ICON}</button>
      </div>
    </div>
  </header>`;
}

/**
 * The foot closes the inscription and says nothing else. The cut is set between the feather marks
 * that open and close an ogham inscription — those in red, the name itself in ink — held between
 * two hairlines that run out to the edges of the page, the way a stem runs out of stone.
 */
export function footer(ctx: PageCtx): string {
  const cut = ctx.site.content.artist.ogham;
  if (!cut) return "";
  const [open, close] = [cut.letters.slice(0, 1), cut.letters.slice(-1)];
  const letters = cut.letters.slice(1, -1);
  return `<footer class="site-footer">
    <div class="footer-mark" role="img" aria-label="${esc(cut.reads)}" title="${esc(cut.reads)}">
      <span class="fm-rule" aria-hidden="true"></span>
      <span class="fm-cut" aria-hidden="true"><span class="fm-feather">${esc(open)}</span><span class="fm-letters">${esc(letters)}</span><span class="fm-feather">${esc(close)}</span></span>
      <span class="fm-rule" aria-hidden="true"></span>
    </div>
  </footer>`;
}
