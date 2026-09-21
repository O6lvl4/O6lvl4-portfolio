// The sections of the oghma page, in the order they are read: who this is and the index of the
// whole (§1), every repository as a line you can filter and order (§2), the ones put forward as
// plates (§3), and one of them opened in full (§4). The figures and the families are in
// oghma-figures.ts.

import { esc } from "../html.ts";
import { href, imgTag, label, type PageCtx } from "../page.ts";
import type { Bar, Figure, Series, Work } from "../model.ts";
import { dot, head, meter, socialLinks, works } from "./oghma-parts.ts";
import { famLinks } from "./oghma-figures.ts";

// ── §1 entry ──────────────────────────────────────────────────────────────

function statPanel(figures: Figure[]): string {
  if (figures.length === 0) return "";
  const cells = figures.slice(0, 3).map((f, i) => {
    const value = i === 0 ? `<span class="accent">${esc(f.value)}</span>` : esc(f.value);
    return `<div class="stat-cell"><div class="stat-val">${value}</div><div class="stat-label">${esc(f.label)}</div></div>`;
  });
  return `<div class="stat-panel">${cells.join("")}</div>`;
}

/** The picture of the maker, written to the site root as `mark<ext>` when the content has one. */
function avatar(ctx: PageCtx): string {
  const { artist } = ctx.site.content;
  if (!artist.avatar) return "";
  const ext = artist.avatar.slice(artist.avatar.lastIndexOf("."));
  return `<img class="profile-avatar" src="${ctx.root}mark${esc(ext)}" width="96" height="96" alt="${esc(artist.name)}">`;
}

/**
 * The profile card a portfolio is read from: the face, the name, what this person does, then the
 * few figures that would otherwise have to be counted, and the places to go next.
 */
function profile(ctx: PageCtx): string {
  const c = ctx.site.content;
  const rows = c.landing?.panel ?? [];
  const body = rows.map(
    (r) =>
      `<div class="panel-row"><span class="panel-key">${esc(r.key)}</span><span class="panel-val">${esc(r.value)}</span>${r.fill ? meter(r.fill, r.key) : ""}</div>`,
  );
  return `<div class="instrument-panel profile-card">
      <div class="profile-head">
        ${avatar(ctx)}
        <div>
          <div class="profile-name">${esc(c.artist.name)}</div>
          ${c.artist.role ? `<div class="profile-role">${esc(c.artist.role)}</div>` : ""}
        </div>
      </div>
      ${statPanel(c.landing?.figures ?? [])}
      ${body.join("")}
      <div class="profile-links">${socialLinks(ctx, "entry-social-link")}</div>
    </div>`;
}

export function entry(ctx: PageCtx): string {
  const c = ctx.site.content;
  const about = c.landing?.about ?? [];
  return `<section id="entry" class="section" aria-labelledby="heading-entry">
    ${head({ at: 0, id: "entry", title: label(ctx, "about", "Entry") })}
    <div class="entry-grid">
      <div>
        <h1 class="entry-name">${esc(c.artist.role ?? c.title)}</h1>
        <div class="entry-handle"><span class="entry-handle-at" aria-hidden="true">@</span>${esc(c.artist.name)}</div>
        <p class="entry-title">${esc(c.home.lead)}</p>
        ${about.map((p) => `<p class="entry-bio">${p}</p>`).join("")}
      </div>
      ${profile(ctx)}
    </div>
  </section>`;
}

// ── §2 works ──────────────────────────────────────────────────────────────

const SORTS = ["date", "commits", "format", "name"] as const;

function toolbar(ctx: PageCtx, langs: Bar[]): string {
  const sorts = SORTS.map(
    (k, i) =>
      `<button type="button" class="sort-btn${i === 0 ? " active" : ""}" data-sort="${k}" aria-pressed="${i === 0}">${esc(label(ctx, `sort_${k}`, k))}</button>`,
  );
  const chips = [
    `<button type="button" class="lang-chip active" data-lang="" aria-pressed="true">${esc(label(ctx, "all", "All"))}</button>`,
    ...langs
      .slice(0, 10)
      .map((l) => `<button type="button" class="lang-chip" data-lang="${esc(l.name)}" aria-pressed="false">${dot(l.name)}${esc(l.name)}</button>`),
  ];
  return `<div class="works-toolbar">
      <div class="sort-bar" role="group" aria-label="${esc(label(ctx, "sortBy", "Sort"))}">${sorts.join("")}</div>
      <div class="lang-filter-list" role="group" aria-label="${esc(label(ctx, "colFormat", "Language"))}">${chips.join("")}</div>
    </div>`;
}

function orgRail(ctx: PageCtx, series: Series[], total: number): string {
  const all = `<button type="button" class="org-btn active" data-org="" aria-pressed="true">${esc(label(ctx, "catalogue", "All"))}<span class="org-btn-count" aria-hidden="true">${total}</span></button>`;
  const each = series.map(
    (s) =>
      `<button type="button" class="org-btn" data-org="${esc(s.id)}" aria-pressed="false"${s.intro ? ` title="${esc(s.intro)}"` : ""}>${esc(s.title)}<span class="org-btn-count" aria-hidden="true">${s.works.length}</span></button>`,
  );
  return `<div class="org-rail" role="group" aria-label="${esc(label(ctx, "orgs", "Organisations"))}">${all}${each.join("")}</div>`;
}

function rowKeys(work: Work, owner: Series, index: number): string {
  // the printed figure carries its thousands separator; the one the list sorts on must not
  const commits = (work.stats?.[0]?.value ?? "0").replace(/[^0-9]/g, "") || "0";
  return [
    ` data-org="${esc(owner.id)}"`,
    ` data-lang="${esc(work.format)}"`,
    ` data-name="${esc(work.title.toLowerCase())}"`,
    ` data-date="${esc(work.order?.date ?? "")}"`,
    ` data-commits="${esc(commits)}"`,
    ` data-rank="${index}"`,
  ].join("");
}

function repoRow(work: Work, owner: Series, index: number, tag?: string): string {
  const commits = work.stats?.[0];
  const topics = (work.tags ?? []).filter((t) => t !== work.format);
  const when = work.order?.date ? ` datetime="${esc(work.order.date)}"` : "";
  // The whole line is the link. A row is about one repository, so anywhere on it goes there —
  // nothing inside is interactive on its own, which is what lets the row be a single anchor.
  return `<li class="repo-item"${rowKeys(work, owner, index)}>
      <a class="repo-row" href="${esc(work.url)}" target="_blank" rel="noopener noreferrer">
        <div>
          <div class="repo-top-line">
            <span class="repo-name">${esc(work.title)}</span>
            <span class="repo-org-tag">${esc(tag ?? work.credit ?? owner.title)}</span>
          </div>
          ${work.titleEn ? `<p class="repo-desc">${esc(work.titleEn)}</p>` : ""}
          ${topics.length ? `<ul class="repo-topics">${topics.map((t) => `<li class="repo-topic">${esc(t)}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="repo-meta">
          ${commits ? `<span class="repo-stars">${esc(commits.value)}<span class="repo-meta-unit"> ${esc(commits.label)}</span></span>` : ""}
          ${work.date ? `<time class="repo-date"${when}>${esc(work.date)}</time>` : ""}
          <div class="repo-foot">
            ${work.format ? `<span class="repo-lang-tag">${dot(work.format)}${esc(work.format)}</span>` : ""}
            <span class="repo-go" aria-hidden="true">→</span>
          </div>
        </div>
      </a>
    </li>`;
}

/**
 * One line per family, the most-worked-on of each: enough to see what kind of thing is here,
 * with the whole list one link away. The front page is not the place to read 265 lines.
 */
export function worksBrief(ctx: PageCtx): string {
  const c = ctx.site.content;
  const all = works(c.series);
  const commitsOf = (w: Work): number => Number((w.stats?.[0]?.value ?? "0").replace(/[^0-9]/g, ""));
  const firsts = c.series
    .map((s) => [...works([s])].sort((a, b) => commitsOf(b.work) - commitsOf(a.work))[0])
    .filter(Boolean)
    // the tag says which family the line stands for, since that is why it is here
    .map(({ work, owner }, i) => repoRow(work, owner, i, owner.short ?? owner.title));
  return `<section id="works" class="section" aria-labelledby="heading-works">
    ${head({ at: 1, id: "works", title: label(ctx, "work", "Works"), count: `${firsts.length} / ${all.length}` })}
    <p class="works-lead">${esc(label(ctx, "briefLead", "One from each family; the rest are in the list."))}</p>
    ${famLinks(ctx)}
    <ul class="repo-list" role="list" aria-label="${esc(label(ctx, "work", "Works"))}">${firsts.join("")}</ul>
    <a class="show-more-btn" href="${href(ctx, "works/")}">${esc(label(ctx, "allWorks", "See all"))}<span class="show-more-count"> (${all.length})</span></a>
  </section>`;
}

/** Every repository, or only one family's when the page belongs to a family. */
export function worksSection(ctx: PageCtx, only?: Series): string {
  const c = ctx.site.content;
  const all = only ? works([only]) : works(c.series);
  const rows = all.map(({ work, owner }, i) => repoRow(work, owner, i));
  const langs = only
    ? [...new Set(all.map(({ work }) => work.format).filter(Boolean))].map((name) => ({
        name: name as string,
        count: all.filter(({ work }) => work.format === name).length,
        color: (c.landing?.langs ?? []).find((l) => l.name === name)?.color,
      }))
    : (c.landing?.langs ?? []);
  return `<section id="works" class="section" aria-labelledby="heading-works">
    ${head({ at: 1, id: "works", title: label(ctx, "work", "Works"), count: `${all.length} / ${all.length}` })}
    ${only ? "" : orgRail(ctx, c.series, all.length)}
    ${toolbar(ctx, langs)}
    <ul class="repo-list" role="list" aria-label="${esc(label(ctx, "work", "Works"))}">${rows.join("")}</ul>
  </section>`;
}

// ── §3 the work put forward, §4 one of it opened ──────────────────────────

function pick(ctx: PageCtx, ids: string[]): { work: Work; owner: Series }[] {
  const all = works(ctx.site.content.series);
  return ids.map((id) => all.find((x) => x.work.id === id)).filter((x): x is { work: Work; owner: Series } => Boolean(x));
}

/**
 * A work's own plate: which family it belongs to and what it is written in, its name as the line
 * you would type to fetch it, then its figures read as figures rather than as eleven rows of key
 * and value, the topics it carries, and the two places to go. Eleven labels down a column say
 * nothing about which number matters; four figures set large do.
 */
/** The head of the plate: the family it belongs to, and what it is written in. */
function panelHead(work: Work, owner: Series): string {
  const lang = work.format ? `<span class="om-lang">${dot(work.format)}${esc(work.format)}</span>` : "";
  const path = work.credit
    ? `<p class="om-path">${esc(work.credit)}<span class="om-slash">/</span>${esc(work.title)}</p>`
    : "";
  return `<div class="om-head">
      <span class="om-family">${esc(owner.short ?? owner.title)}</span>
      ${lang}
    </div>
    <h3 class="om-name">${esc(work.title)}</h3>
    ${path}`;
}

/** Its figures, two by two, each cell divided from the next by the panel's own hairlines. */
function panelFigures(work: Work): string {
  const cells = (work.stats ?? [])
    .slice(0, 4)
    .map((f) => `<div class="om-fig"><dd class="om-fig-val">${esc(f.value)}</dd><dt class="om-fig-key">${esc(f.label)}</dt></div>`);
  return cells.length ? `<dl class="om-figures">${cells.join("")}</dl>` : "";
}

/** What it carries, and where to go: the topics, then the repository and the site. */
function panelFoot(ctx: PageCtx, work: Work): string {
  const topics = work.tags ?? [];
  const links = (work.links ?? []).map(
    (l) => `<a class="om-link" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<span aria-hidden="true"> ↗</span></a>`,
  );
  const updated = work.date
    ? `<p class="om-updated">${esc(label(ctx, "colDate", "Updated"))}<span class="om-updated-val">${esc(work.date)}</span></p>`
    : "";
  return `${updated}
    ${topics.length ? `<ul class="om-topics">${topics.map((t) => `<li class="repo-topic">${esc(t)}</li>`).join("")}</ul>` : ""}
    ${links.length ? `<div class="om-links">${links.join("")}</div>` : ""}`;
}

function metaPanel(ctx: PageCtx, work: Work, owner: Series): string {
  return `<div class="object-meta-panel" aria-label="${esc(work.title)}">
      ${panelHead(work, owner)}
      ${panelFigures(work)}
      ${panelFoot(ctx, work)}
    </div>`;
}

/** Where a card sends you, named for what is there: the source, and the docs when the site is docs. */
function cardLinks(ctx: PageCtx, work: Work): string {
  const links = (work.links ?? []).map((l) => {
    const name = /^https:\/\/github\.com\//.test(l.href)
      ? label(ctx, "source", "Source code")
      : /\/docs\b/.test(l.href) ? label(ctx, "docs", "Documentation") : l.label;
    return `<a class="om-link" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(name)}<span aria-hidden="true"> ↗</span></a>`;
  });
  return links.length ? `<div class="om-links">${links.join("")}</div>` : "";
}

function readmePanel(ctx: PageCtx, work: Work, withLinks = false): string {
  const readme = work.readme;
  const shot = work.image ? `<figure class="readme-shot">${imgTag(ctx, work, "lo", { loading: "lazy", decoding: "async" })}</figure>` : "";
  const points = readme?.points ?? [];
  return `<article class="readme-panel" aria-label="${esc(work.title)} README">
      ${shot}
      <h3 class="readme-h1">${esc(work.title)}</h3>
      <p class="readme-p">${esc(readme?.lead ?? work.titleEn)}</p>
      ${points.length ? `<h4 class="readme-h2">${esc(label(ctx, "points", "What it does"))}</h4><ul class="readme-points">${points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${withLinks ? cardLinks(ctx, work) : ""}
    </article>`;
}

/** One work, opened in full: what it is made of on one side, what it says on the other. */
export function objectFor(ctx: PageCtx, at: number, chosen?: { work: Work; owner: Series }): string {
  if (!chosen) return "";
  return `<section id="object" class="section" aria-labelledby="heading-object">
    ${head({ at, id: "object", title: label(ctx, "object", "One opened") })}
    <div class="object-grid">
      ${metaPanel(ctx, chosen.work, chosen.owner)}
      ${readmePanel(ctx, chosen.work)}
    </div>
  </section>`;
}

/**
 * The front page's works, opened as cards side by side: what each one is, what it does, and where
 * it lives. A family page still opens its one work in full with objectFor.
 */
export function objectSection(ctx: PageCtx): string {
  const landing = ctx.site.content.landing;
  const chosen = pick(ctx, landing?.showcase ?? (landing?.featured ?? []).slice(0, 1));
  if (!chosen.length) return "";
  return `<section id="object" class="section" aria-labelledby="heading-object">
    ${head({ at: 2, id: "object", title: label(ctx, "showcase", label(ctx, "object", "Selected work")) })}
    <div class="object-grid showcase">
      ${chosen.map((c) => readmePanel(ctx, c.work, true)).join("\n      ")}
    </div>
  </section>`;
}
