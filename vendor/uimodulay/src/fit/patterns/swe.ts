// The way a maker of software is usually introduced: a profile that stays put on the left — who
// they are, what they do, where else they are — and, scrolling past it, what they have written
// about themselves, the work they put forward, where it all lives, what it is made with, and
// when it happened. Measured from a portfolio in the corpus; the work itself is shown by the
// same patterns as any other body of work.

import { esc } from "../html.ts";
import type { Period, Series, Work } from "../model.ts";
import { aboutPath, href, imgTag, label, seriesPath, workPath, type PageCtx, type Pattern } from "../page.ts";
import { langLinks, seal } from "./frame.ts";

const SECTIONS: [string, string][] = [["about", "これまで"], ["work", "仕事"], ["orgs", "置き場所"], ["stack", "道具"], ["history", "年表"]];

interface Found {
  series: Series;
  work: Work;
  index: number;
}

function findWork(ctx: PageCtx, id: string): Found | undefined {
  for (const series of ctx.site.content.series) {
    const index = series.works.findIndex((w) => w.id === id || `${series.id}/${w.title}` === id);
    if (index >= 0) return { series, work: series.works[index], index };
  }
  return undefined;
}

function tags(list: string[] | undefined): string {
  if (!list?.length) return "";
  return `<ul class="swTags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

function card(ctx: PageCtx, f: Found): string {
  const { series, work, index } = f;
  return `<li class="swCard"><a href="${href(ctx, workPath(series, index))}">
      <span class="swThumb">${imgTag(ctx, work, "th", { alt: "", loading: "lazy", decoding: "async" })}</span>
      <span class="swCardText">
        <span class="swCardTitle">${esc(work.title)}</span>
        ${work.titleEn ? `<span class="swCardLead">${esc(work.titleEn)}</span>` : ""}
        ${tags(work.tags)}
      </span>
    </a></li>`;
}

function profile(ctx: PageCtx): string {
  const { artist, links, home } = ctx.site.content;
  const sections = SECTIONS.map(([id, fallback]) => [id, label(ctx, id, fallback)]);
  const named = links?.map((l) => `<li><a href="${esc(l.href)}"${l.href.startsWith("http") ? ` target="_blank" rel="noopener noreferrer"` : ""}>${esc(l.label)}</a></li>`).join("") ?? "";
  return `<aside class="swProfile">
    <div class="swHead">${seal(ctx)}<h1 class="swName">${esc(artist.name)}</h1></div>
    ${artist.role ? `<p class="swRole">${esc(artist.role)}</p>` : ""}
    <p class="swLead">${esc(home.lead)}</p>
    <nav class="swSections" aria-label="このページの中">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("")}</nav>
    ${named ? `<ul class="swLinks">${named}</ul>` : ""}
    ${langLinks(ctx, "swLangs")}
  </aside>`;
}

function about(ctx: PageCtx): string {
  const paras = ctx.site.content.landing?.about ?? [];
  if (!paras.length) return "";
  return `<section class="swSection swAbout" id="about"><h2>${esc(label(ctx, "about", "これまで"))}</h2>${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`;
}

function featured(ctx: PageCtx): string {
  const ids = ctx.site.content.landing?.featured ?? [];
  const found = ids.map((id) => findWork(ctx, id)).filter((f) => f !== undefined);
  if (!found.length) return "";
  const first = ctx.site.content.series[0];
  return `<section class="swSection swWork" id="work"><h2>${esc(label(ctx, "work", "仕事"))}</h2>
    <ol class="swCards">${found.map((f) => card(ctx, f)).join("\n")}</ol>
    <a class="swMore" href="${href(ctx, seriesPath(first))}">${esc(label(ctx, "more", "すべての仕事を順に見る"))}</a>
  </section>`;
}

function orgs(ctx: PageCtx): string {
  const rows = ctx.site.content.series.map((s) => `<li><a href="${href(ctx, seriesPath(s))}">
      <span class="swOrgName">${esc(s.title)}</span>
      <span class="swOrgCount">${s.works.length}</span>
      ${s.intro ? `<span class="swOrgLead">${esc(s.intro)}</span>` : ""}
    </a></li>`);
  return `<section class="swSection swOrgs" id="orgs"><h2>${esc(label(ctx, "orgs", "置き場所"))}</h2><ol>${rows.join("\n")}</ol></section>`;
}

function stack(ctx: PageCtx): string {
  const groups = ctx.site.content.landing?.stack ?? [];
  if (!groups.length) return "";
  const rows = groups.map((g) => `<div class="swStackRow"><dt>${esc(g.heading)}</dt><dd>${g.items.map(esc).join("・")}</dd></div>`);
  return `<section class="swSection swStack" id="stack"><h2>${esc(label(ctx, "stack", "道具"))}</h2><dl>${rows.join("")}</dl></section>`;
}

function period(p: Period): string {
  return `<li><span class="swWhen">${esc(p.period)}</span><span class="swWhat">
      <span class="swWhatTitle">${esc(p.title)}</span>
      ${p.lead ? `<span class="swWhatLead">${esc(p.lead)}</span>` : ""}
      ${tags(p.tags)}
    </span></li>`;
}

function timeline(ctx: PageCtx): string {
  const items = ctx.site.content.landing?.timeline ?? [];
  if (!items.length) return "";
  return `<section class="swSection swTimeline" id="history"><h2>${esc(label(ctx, "history", "年表"))}</h2><ol>${items.map(period).join("\n")}</ol></section>`;
}

function note(ctx: PageCtx): string {
  const { home, about: page } = ctx.site.content;
  if (!home.note) return "";
  const path = aboutPath(ctx.site.content);
  const link = page && path ? `<a href="${href(ctx, path)}">${esc(page.nav)}</a>` : "";
  return `<p class="swNote">${esc(home.note)}${link}</p>`;
}

export const profileHero: Pattern = {
  name: "profile-hero",
  css: ["swe"],
  sizes: ["th"],
  render(ctx) {
    return `<main class="swe">
  <div class="swInner">
    ${profile(ctx)}
    <div class="swMain">
      ${about(ctx)}
      ${featured(ctx)}
      ${orgs(ctx)}
      ${stack(ctx)}
      ${timeline(ctx)}
      ${note(ctx)}
    </div>
  </div>
</main>`;
  },
};
