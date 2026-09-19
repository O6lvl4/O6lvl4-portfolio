// The figures of a body of work, what it is written in, and the families it falls into — each
// of which has a page of its own.

import { esc } from "../html.ts";
import { href, label, seriesPath, type PageCtx } from "../page.ts";
import type { Bar, Figure } from "../model.ts";
import { MARKS, TRUNK_ENDS, dot, head } from "./oghma-parts.ts";


/**
 * Bars are read as lengths from zero, so the scale stays linear even though one year holds two
 * hundred times another — that difference is the point. Each bar carries its own number, and a
 * year too small to draw still gets a hairline.
 */
export function chart(ctx: PageCtx, years: Bar[]): string {
  // One bar is not a chart: it can only be as long as itself, so it says nothing the figures row
  // has not already said. A family that ran for a single year simply shows no chart.
  if (years.length < 2) return "";
  const max = Math.max(...years.map((y) => y.count));
  const last = years[years.length - 1];
  const bars = years.map((y) => {
    const pct = Math.max((y.count / max) * 100, 0.4).toFixed(1);
    return `<div class="tl-bar-wrap">
        <span class="tl-count">${y.count.toLocaleString("en-US")}</span>
        <div class="tl-bar${y === last ? " current" : ""}" style="height:${pct}%" title="${esc(y.name)}: ${y.count}"></div>
      </div>`;
  });
  const said = years.map((y) => `${y.name} ${y.count}`).join(", ");
  // Two or three years get bars of a bar's width rather than a third of the track each.
  const few = years.length < 4 ? " few" : "";
  return `<div>
      <div class="timeline-sub">${esc(label(ctx, "byYear", "Commits by year"))}</div>
      <div class="timeline-chart${few}" role="img" aria-label="${esc(label(ctx, "history", "By year"))}: ${esc(said)}">${bars.join("")}</div>
      <div class="timeline-labels${few}" aria-hidden="true">${years.map((y) => `<span class="tl-yr">${esc(y.name)}</span>`).join("")}</div>
    </div>`;
}

/** The figures of a body of work, large. */
export function figuresRow(figures: Figure[]): string {
  if (figures.length === 0) return "";
  const cards = figures.map(
    (f) => `<div class="kpi-card" role="listitem"><div class="kpi-val">${esc(f.value)}</div><div class="kpi-label">${esc(f.label)}</div></div>`,
  );
  return `<div class="overview-kpis" role="list">${cards.join("")}</div>`;
}

/**
 * Where the work went, by the org that holds it: the commits of each, with the repositories they
 * are spread over. A year says only when something happened; an org says what it was for.
 */
function orgBars(ctx: PageCtx): string {
  const orgs = ctx.site.content.landing?.orgCommits ?? [];
  if (orgs.length === 0) return "";
  const max = Math.max(...orgs.map((o) => o.count));
  const rows = orgs.map((o) => {
    const pct = Math.max((o.count / max) * 100, 0.3).toFixed(1);
    return `<div class="lang-bar-row org-bar-row">
        <a class="lbr-name" href="https://github.com/${esc(o.name)}" target="_blank" rel="noopener noreferrer">${esc(o.name)}${o.of ? `<span class="lbr-sub">${o.of}</span>` : ""}</a>
        <div class="lbr-track" role="meter" aria-valuenow="${o.count}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${esc(o.name)}">
          <div class="lbr-fill" style="width:${pct}%"></div>
        </div>
        <span class="lbr-count" aria-hidden="true">${o.count.toLocaleString("en-US")}</span>
      </div>`;
  });
  return `<div class="org-chart">
      <div class="timeline-sub">${esc(label(ctx, "byOrg", "Commits by org"))}</div>
      ${rows.join("")}
    </div>`;
}


/**
 * The families as one line of links rather than fourteen cards: from the front page a reader needs
 * to know they exist and be able to open one, not read every introduction twice.
 */
export function famLinks(ctx: PageCtx): string {
  const c = ctx.site.content;
  const links = c.series.map(
    (s, i) => `<a class="fam-link" href="${href(ctx, seriesPath(s))}"${s.intro ? ` title="${esc(s.intro)}"` : ""}>
        <span class="fam-link-mark" aria-hidden="true">${MARKS[i] ?? TRUNK_ENDS}</span>${esc(s.title)}<span class="fam-link-count">${s.works.length}</span>
      </a>`,
  );
  return `<nav class="fam-links" aria-label="${esc(label(ctx, "families", "Families"))}">${links.join("")}</nav>`;
}

function langBar(bar: Bar, max: number): string {
  const pct = ((bar.count / max) * 100).toFixed(1);
  const fill = bar.color ? `width:${pct}%;background:${esc(bar.color)}` : `width:${pct}%`;
  return `<div class="lang-bar-row">
      <span class="lbr-name">${dot(bar.name)}${esc(bar.name)}</span>
      <div class="lbr-track" role="meter" aria-valuenow="${bar.count}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${esc(bar.name)}">
        <div class="lbr-fill" style="${fill}"></div>
      </div>
      <span class="lbr-count" aria-hidden="true">${bar.count}</span>
    </div>`;
}

/**
 * What the whole body of work is made of, in two readings of the same commits: the language each
 * repository is written in, and the org each one is kept under.
 */
export function breakdown(ctx: PageCtx): string {
  const bars = ctx.site.content.landing?.langs ?? [];
  if (bars.length === 0) return "";
  const max = Math.max(...bars.map((b) => b.count));
  const half = Math.ceil(bars.length / 2);
  return `<section id="breakdown" class="section" aria-labelledby="heading-breakdown">
    ${head({ at: 3, id: "breakdown", title: label(ctx, "breakdown", "Breakdown") })}
    <div class="timeline-sub">${esc(label(ctx, "stack", "What it is written in"))}</div>
    <div class="lang-dist-grid">
      <div>${bars.slice(0, half).map((b) => langBar(b, max)).join("")}</div>
      <div>${bars.slice(half).map((b) => langBar(b, max)).join("")}</div>
    </div>
    ${orgBars(ctx)}
  </section>`;
}

