// One work at a time. On a desktop the work hangs between the index and a plate that carries
// its label and place in the series; keys, either half of the work, or the buttons move on, and
// 「一覧」 opens every work of the series on one sheet. On a phone the works stack as you
// scroll and a tap opens them one by one with the label underneath.

import { esc, pad2 } from "../html.ts";
import { altOf, derived, imgTag, label, metaSpans, type PageCtx, type Pattern } from "../page.ts";
import type { Series, Work } from "../model.ts";

/* The plate is as tall as the reference's, so the label stays to the label: what a work is made
   of and where it lives belong on the work's own page, not here. */
function captionHtml(s: Series, w: Work): string {
  return `<div class="caption">
      <p class="series">${esc(s.title)}</p>
      <h2 class="title">${esc(w.title)}</h2>
      ${w.titleEn ? `<p class="en">${esc(w.titleEn)}</p>` : ""}
      <p class="meta">${metaSpans(w)}</p>
    </div>`;
}

function plate(ctx: PageCtx, s: Series): string {
  const n = s.works.length;
  return `<footer class="plate">
    ${captionHtml(s, s.works[0])}
    <div class="counter">
      <p class="count"><span class="now">01</span><span class="of">/ ${pad2(n)}</span></p>
      <div class="track" aria-hidden="true"><div class="fill" style="width:${((1 / n) * 100).toFixed(2)}%"></div></div>
      <div class="steps">
        <button type="button" data-step="-1"><span aria-hidden="true">←</span> ${esc(label(ctx, "prev", "前の作品"))}</button>
        <button type="button" class="toIndex" aria-expanded="false">${esc(label(ctx, "index", "一覧"))}</button>
        <button type="button" data-step="1">${esc(label(ctx, "next", "次の作品"))} <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </footer>`;
}

const opener = (i: number): string => `<button type="button" class="work" data-index="${i}"${i === 0 ? ` aria-current="true"` : ""}>`;

/** Thumbnails: work you recognise by sight. */
function grid(ctx: PageCtx, s: Series): string {
  const works = s.works.map((w, i) => `<li>${opener(i)}
        <span class="wImg">${imgTag(ctx, w, "th", { alt: "", loading: "lazy", decoding: "async" })}</span>
        <span class="wNo">${pad2(i + 1)}</span>
        <span class="wTitle">${esc(w.title)}</span>
      </button></li>`);
  return `<ol class="catGrid">${works.join("\n")}</ol>`;
}

/** The columns of the list, in order; a `sort` makes the heading a button you can order by. */
const COLUMNS: { cls: string; key: string; sort?: string; fallback: string }[] = [
  { cls: "wNo", key: "colNo", sort: "no", fallback: "番号" },
  { cls: "wTitle", key: "colTitle", sort: "name", fallback: "題" },
  { cls: "wLead", key: "colLead", fallback: "内容" },
  { cls: "wFormat", key: "colFormat", sort: "format", fallback: "技法" },
  { cls: "wDate", key: "colDate", sort: "date", fallback: "年" },
];

function listHead(ctx: PageCtx): string {
  const cells = COLUMNS.map((c) => {
    const text = esc(label(ctx, c.key, c.fallback));
    if (!c.sort) return `<span class="${c.cls}">${text}</span>`;
    const first = c.sort === "no" ? ` aria-pressed="true" data-dir="up"` : ` aria-pressed="false"`;
    return `<button type="button" class="${c.cls} catSortBtn" data-sort="${c.sort}"${first}>${text}<span class="dir" aria-hidden="true"></span></button>`;
  });
  return `<div class="catSort" role="group" aria-label="${esc(label(ctx, "sortBy", "並べ替え"))}">${cells.join("")}</div>`;
}

/** One line each: work you read rather than recognise, in whichever order you ask for. */
function list(ctx: PageCtx, s: Series): string {
  const rows = s.works.map((w, i) => {
    const keys = { no: String(i), name: w.title, format: w.format ?? "", date: w.order?.date ?? w.date ?? "" };
    const data = Object.entries(keys).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("");
    return `<li${data}>${opener(i)}
        <span class="wNo">${pad2(i + 1)}</span>
        <span class="wTitle">${esc(w.title)}</span>
        <span class="wLead">${esc(w.titleEn)}</span>
        <span class="wFormat">${esc(w.format)}</span>
        <span class="wDate">${esc(w.date)}</span>
      </button></li>`;
  });
  return `${listHead(ctx)}<ol class="catList">${rows.join("\n")}</ol>`;
}

function sheet(ctx: PageCtx, s: Series): string {
  const style = ctx.site.content.index?.style ?? "grid";
  return `<section class="catalogue" hidden aria-hidden="true" aria-label="${esc(s.title)}　${esc(label(ctx, "index", "一覧"))}">
    <header class="catHead">
      <div>
        <p class="catCount">${s.works.length}${esc(label(ctx, "unit", "図"))}</p>
        <h2 class="catSeries">${esc(s.title)}</h2>
        ${s.titleEn ? `<p class="catEn">${esc(s.titleEn)}</p>` : ""}
      </div>
      ${s.intro ? `<p class="catIntro">${esc(s.intro)}</p>` : ""}
      <button type="button" class="catClose">${esc(label(ctx, "close", "閉じる"))}</button>
    </header>
    ${style === "list" ? list(ctx, s) : grid(ctx, s)}
  </section>`;
}

function collection(ctx: PageCtx, s: Series): string {
  const items = s.works.map((w, i) => `<li><button type="button" class="cItem" data-index="${i}" aria-label="${esc(w.title)}">${imgTag(ctx, w, "lo", { loading: i < 3 ? undefined : "lazy", decoding: "async" })}</button></li>`);
  return `<ol class="collection">${items.join("\n")}</ol>`;
}

function slideCaption(s: Series, w: Work): string {
  const meta = [w.date, w.format].filter(Boolean).map(esc).join("・");
  return `<figcaption class="slideCaption"><span class="series">${esc(s.title)}</span><span class="title">${esc(w.title)}</span>${w.titleEn ? `<span class="en">${esc(w.titleEn)}</span>` : ""}${meta ? `<span class="meta">${meta}</span>` : ""}</figcaption>`;
}

function viewer(ctx: PageCtx, s: Series): string {
  const slides = s.works.map((w) => {
    const lo = derived(ctx, w, "lo");
    const hi = derived(ctx, w, "hi");
    const img = `<img src="${ctx.root + lo.src}" srcset="${ctx.root + lo.src} ${lo.w}w, ${ctx.root + hi.src} ${hi.w}w" sizes="100vw" width="${lo.w}" height="${lo.h}" alt="${esc(altOf(ctx.site.content, w))}" loading="lazy" decoding="async">`;
    return `<figure class="slide">${img}${slideCaption(s, w)}</figure>`;
  });
  return `<div class="viewer" hidden role="dialog" aria-modal="true" aria-label="${esc(s.title)}">
    <div class="viewerBar"><p class="galleryCount"><span class="now">01</span> <span class="of">/ ${pad2(s.works.length)}</span></p><button type="button" class="viewerClose">${esc(label(ctx, "close", "閉じる"))}</button></div>
    <div class="viewerTrack">${slides.join("\n")}</div>
  </div>`;
}

function worksJson(ctx: PageCtx, s: Series): string {
  const data = s.works.map((w) => ({
    hi: ctx.root + derived(ctx, w, "hi").src,
    w: derived(ctx, w, "hi").w,
    h: derived(ctx, w, "hi").h,
    alt: altOf(ctx.site.content, w),
    caption: captionHtml(s, w),
  }));
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const stage: Pattern = {
  name: "stage",
  css: ["stage", "plate", "sheet", "phone"],
  scripts: ["stage"],
  sizes: ["hi", "lo", "th"],
  render(ctx) {
    const s = ctx.series;
    if (!s) throw new Error("the stage pattern needs a series page");
    const first = s.works[0];
    const indexFirst = ctx.site.content.index?.first ? ` data-index-first="true"` : "";
    return `<main class="stageWrap" aria-label="${esc(s.title)}"${indexFirst}>
  <h1 class="visuallyHidden">${esc(s.title)}</h1>
  <div class="stage">${imgTag(ctx, first, "hi", { class: "stageImg on", fetchpriority: "high" })}</div>
  <div class="halves" aria-hidden="true"><div class="half" data-step="-1" data-label="${esc(label(ctx, "prev", "前の作品"))}"></div><div class="half" data-step="1" data-label="${esc(label(ctx, "next", "次の作品"))}"></div></div>
  <div class="cursorLabel" aria-hidden="true"></div>
  ${plate(ctx, s)}
  ${sheet(ctx, s)}
  ${collection(ctx, s)}
  ${viewer(ctx, s)}
  <script type="application/json" id="fit-works">${worksJson(ctx, s)}</script>
</main>`;
  },
};
