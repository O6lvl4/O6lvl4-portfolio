// The way in: who the artist is in one line, then each series as a chapter with its cover.

import { esc } from "../html.ts";
import { aboutPath, href, imgTag, label, seriesPath, type PageCtx, type Pattern } from "../page.ts";
import type { Series } from "../model.ts";

function chapter(ctx: PageCtx, s: Series): string {
  const cover = s.works[0];
  const meta = [s.period, `${s.works.length}${label(ctx, "unit", "図")}`].filter(Boolean).join("　");
  return `<li class="chapter"><a href="${href(ctx, seriesPath(s))}">
  <span class="chImg">${imgTag(ctx, cover, "cover")}</span>
  <span class="chText">
    <span class="chTitle">${esc(s.title)}</span>
    ${s.titleEn ? `<span class="chEn">${esc(s.titleEn)}</span>` : ""}
    <span class="chMeta">${esc(meta)}</span>
  </span>
</a></li>`;
}

function note(ctx: PageCtx): string {
  const { home, about } = ctx.site.content;
  if (!home.note) return "";
  const path = aboutPath(ctx.site.content);
  const link = about && path ? `<a href="${href(ctx, path)}">${esc(about.nav)}と出典</a>` : "";
  return `<p class="landingNote">${esc(home.note)}${link}</p>`;
}

export const leadChapters: Pattern = {
  name: "lead-chapters",
  css: ["landing"],
  sizes: ["cover"],
  render(ctx) {
    const { home, series } = ctx.site.content;
    return `<main class="landing">
  <header class="lead">
    ${home.kicker ? `<p class="kicker">${esc(home.kicker)}</p>` : ""}
    <h1 class="leadTitle">${esc(home.lead)}</h1>
    ${home.text ? `<p class="leadText">${esc(home.text)}</p>` : ""}
  </header>
  <ol class="chapters">${series.map((s) => chapter(ctx, s)).join("\n")}</ol>
  ${note(ctx)}
</main>`;
  },
};
