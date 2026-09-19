// The catalogue: the works themselves are the front page, in a close grid under a name bar and
// a row of sections, the way a catalogue raisonné opens; each work has a page of its own with
// its label, and the series and the essay sit one click away.

import { esc, pad2 } from "../html.ts";
import { aboutPath, derived, href, imgTag, label, metaSpans, seriesPath, workPath, type PageCtx, type Pattern } from "../page.ts";
import type { Link, Series, Work } from "../model.ts";
import { contactList, seal } from "./frame.ts";

export const brandBar: Pattern = {
  name: "brand-bar",
  css: ["catalogue"],
  render(ctx) {
    const a = ctx.site.content.artist;
    const en = [a.nameEn, a.life].filter(Boolean).map(esc).join("　");
    return `<header class="brandBar">
  <a class="brand" href="${href(ctx, "")}">${seal(ctx)}<span class="brandName">${esc(a.name)}</span><span class="brandEn">${en}</span></a>
  ${contactList(ctx, "brandContact")}
</header>`;
  },
};

interface Entry {
  id: string;
  path: string;
  label: string;
  count?: number;
}

function sectionLink(ctx: PageCtx, e: Entry): string {
  const current = ctx.current === e.id;
  const n = e.count === undefined ? "" : `<span class="count">${e.count}</span>`;
  return `<a href="${href(ctx, e.path)}" class="section${current ? " current" : ""}"${current ? ` aria-current="page"` : ""}><span class="full">${esc(e.label)}</span>${n}</a>`;
}

export const sectionNav: Pattern = {
  name: "section-nav",
  css: ["catalogue"],
  render(ctx) {
    const { content } = ctx.site;
    const total = content.series.reduce((n, s) => n + s.works.length, 0);
    const links = [sectionLink(ctx, { id: "", path: "", label: label(ctx, "catalogue", "作品目録"), count: total })];
    for (const s of content.series) links.push(sectionLink(ctx, { id: s.id, path: seriesPath(s), label: s.title, count: s.works.length }));
    const about = aboutPath(content);
    if (content.about && about) links.push(sectionLink(ctx, { id: content.about.id, path: about, label: content.about.nav }));
    return `<nav class="sectionNav" aria-label="目録"><div class="sections">${links.join("")}</div></nav>`;
  },
};

function seriesHead(ctx: PageCtx, s: Series, level: "h1" | "h2"): string {
  const meta = [s.period, `${s.works.length}${label(ctx, "unit", "図")}`].filter(Boolean).map(esc).join("　");
  const title = level === "h2" ? `<a href="${href(ctx, seriesPath(s))}">${esc(s.title)}</a>` : esc(s.title);
  const intro = level === "h1" && s.intro ? `<p class="gIntro">${esc(s.intro)}</p>` : "";
  return `<li class="gHead" id="${esc(s.id)}"><${level} class="gTitle">${title}</${level}>${s.titleEn ? `<p class="gEn">${esc(s.titleEn)}</p>` : ""}<p class="gMeta">${meta}</p>${intro}</li>`;
}

/** The frame of a series' cells: as tall as its tallest work needs (the reference height caps it). */
function cellRatio(ctx: PageCtx, s: Series): string {
  const ratios = s.works.map((w) => derived(ctx, w, "th")).map((d) => d.w / d.h);
  return Math.min(...ratios).toFixed(3);
}

function cells(ctx: PageCtx, s: Series): string[] {
  const ratio = cellRatio(ctx, s);
  return s.works.map((w, i) => `<li class="cell"><a href="${href(ctx, workPath(s, i))}">
  <span class="cImg" style="--ratio:${ratio}">${imgTag(ctx, w, "th", { loading: "lazy", decoding: "async" })}</span>
  <span class="cNo">${pad2(i + 1)}</span><span class="cTitle">${esc(w.title)}</span>
</a></li>`);
}

function jumpMenu(ctx: PageCtx): string {
  const items = ctx.site.content.series.map((s) => `<li><a href="${ctx.series ? href(ctx, seriesPath(s)) : `#${esc(s.id)}`}">${esc(s.title)}</a></li>`);
  return `<details class="jump"><summary aria-label="${esc(label(ctx, "groups", "揃物"))}へ移る">${esc(label(ctx, "groups", "揃物"))}</summary><ol>${items.join("")}</ol></details>`;
}

export const worksGrid: Pattern = {
  name: "works-grid",
  css: ["catalogue"],
  sizes: ["th"],
  render(ctx) {
    const one = ctx.series;
    const groups = one ? [one] : ctx.site.content.series;
    const rows = groups.flatMap((s) => [seriesHead(ctx, s, one ? "h1" : "h2"), ...cells(ctx, s)]);
    const heading = one ? "" : `<h1 class="visuallyHidden">${esc(ctx.site.content.title)}　作品目録</h1>`;
    return `<main class="works">${heading}<ol class="grid">${rows.join("\n")}</ol>${jumpMenu(ctx)}</main>`;
  },
};

function stepLinks(ctx: PageCtx, s: Series, i: number): string {
  const n = s.works.length;
  const prev = href(ctx, workPath(s, (i - 1 + n) % n));
  const next = href(ctx, workPath(s, (i + 1) % n));
  return `<div class="steps">
    <a href="${prev}" data-key="ArrowLeft" rel="prev"><span aria-hidden="true">←</span> ${esc(label(ctx, "prev", "前の作品"))}</a>
    <a href="${href(ctx, seriesPath(s))}" data-key="Escape" class="toIndex">${esc(label(ctx, "index", "一覧"))}</a>
    <a href="${next}" data-key="ArrowRight" rel="next">${esc(label(ctx, "next", "次の作品"))} <span aria-hidden="true">→</span></a>
  </div>`;
}

/** What a work carries besides its label: what it is made of, its own figures, where it lives. */
function extras(w: Work): string {
  const tags = w.tags?.length ? `<ul class="capTags">${w.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const stats = w.stats?.length
    ? `<dl class="capStats">${w.stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("")}</dl>`
    : "";
  const anchor = (l: Link): string => {
    const out = l.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${esc(l.href)}"${out}>${esc(l.label)}</a>`;
  };
  const links = w.links?.length ? `<p class="capLinks">${w.links.map(anchor).join("")}</p>` : "";
  return tags + stats + links;
}

export const workView: Pattern = {
  name: "work-view",
  css: ["plate", "work"],
  scripts: ["work"],
  sizes: ["hi", "lo"],
  render(ctx) {
    const { series: s, work: w, workIndex: i } = ctx;
    if (!s || !w || i === undefined) throw new Error("the work-view pattern needs a work page");
    const lo = derived(ctx, w, "lo");
    const hi = derived(ctx, w, "hi");
    const img = imgTag(ctx, w, "hi", { srcset: `${ctx.root + lo.src} ${lo.w}w, ${ctx.root + hi.src} ${hi.w}w`, sizes: "(max-width: 767px) 100vw, 70vw", fetchpriority: "high" });
    const n = s.works.length;
    return `<main class="workView">
  <figure class="workImg">${img}</figure>
  <div class="workPlate">
    <div class="caption">
      <p class="series"><a href="${href(ctx, seriesPath(s))}">${esc(s.title)}</a></p>
      <h1 class="title">${esc(w.title)}</h1>
      ${w.titleEn ? `<p class="en">${esc(w.titleEn)}</p>` : ""}
      <p class="meta">${metaSpans(w)}</p>
      ${extras(w)}
    </div>
    <div class="counter">
      <p class="count"><span class="now">${pad2(i + 1)}</span><span class="of">/ ${pad2(n)}</span></p>
      <div class="track" aria-hidden="true"><div class="fill" style="width:${(((i + 1) / n) * 100).toFixed(2)}%"></div></div>
      ${stepLinks(ctx, s, i)}
    </div>
  </div>
</main>`;
  },
};

export const siteFooter: Pattern = {
  name: "site-footer",
  css: ["catalogue"],
  render(ctx) {
    const { content } = ctx.site;
    const links = content.series.map((s) => `<a href="${href(ctx, seriesPath(s))}">${esc(s.title)}</a>`);
    const about = aboutPath(content);
    if (content.about && about) links.push(`<a href="${href(ctx, about)}">${esc(content.about.nav)}</a>`);
    const note = content.about?.footnote ?? esc(content.home.note);
    return `<footer class="siteFooter">
  <nav class="fLinks" aria-label="${esc(label(ctx, "groups", "揃物"))}">${links.join("")}</nav>
  ${contactList(ctx, "fContact", true)}
  <p class="fNote">${note}</p>
</footer>`;
  },
};
