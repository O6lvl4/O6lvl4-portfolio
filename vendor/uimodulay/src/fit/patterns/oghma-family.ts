// One family of work on its own page: what kind of thing this is, how much of it there is, the
// one to look at first, and then all of it. The frame is the same as the whole body's page.

import { esc } from "../html.ts";
import { href, label, type PageCtx, type Pattern } from "../page.ts";
import { MARKS, TRUNK_ENDS, head, setColours, works } from "./oghma-parts.ts";
import { chart, figuresRow } from "./oghma-figures.ts";
import { objectFor, worksSection } from "./oghma-sections.ts";
import { footer, header, skip } from "./oghma-frame.ts";

/** What this family is, in its own words, with its own figures and its own years. */
function familyHead(ctx: PageCtx): string {
  const s = ctx.series;
  if (!s) throw new Error("the oghma-family pattern needs a series page");
  const at = ctx.site.content.series.findIndex((x) => x.id === s.id);
  return `<section id="entry" class="section" aria-labelledby="heading-entry">
    ${head({ at, id: "entry", title: label(ctx, "families", "Family") })}
    <div class="fam-hero">
      <div>
        <h1 class="entry-name">${esc(s.title)}</h1>
        ${s.intro ? `<p class="fam-intro">${esc(s.intro)}</p>` : ""}
        <a class="fam-back" href="${href(ctx, "")}#families">← ${esc(label(ctx, "allFamilies", "All families"))}</a>
      </div>
      <span class="fam-hero-mark" aria-hidden="true">${MARKS[at] ?? TRUNK_ENDS}</span>
    </div>
    ${figuresRow(s.figures ?? [])}
    ${chart(ctx, s.years ?? [])}
  </section>`;
}

export const oghmaFamily: Pattern = {
  name: "oghma-family",
  css: ["oghma", "oghma-frame", "oghma-entry", "oghma-works", "oghma-work", "oghma-figures", "oghma-page", "oghma-narrow", "oghma-surface"],
  scripts: ["oghma"],
  sizes: ["lo"],
  render(ctx) {
    const s = ctx.series;
    if (!s) throw new Error("the oghma-family pattern needs a series page");
    setColours(ctx.site.content.landing?.langs ?? []);
    const first = works([s])[0];
    return `<div class="app-shell">
  ${skip(ctx)}
  <div class="main-wrap">
    ${header(ctx)}
    <main id="main-content">
      <div class="content">
        ${familyHead(ctx)}
        ${objectFor(ctx, 3, first)}
        ${worksSection(ctx, s)}
      </div>
    </main>
    ${footer(ctx)}
  </div>
</div>`;
  },
};
