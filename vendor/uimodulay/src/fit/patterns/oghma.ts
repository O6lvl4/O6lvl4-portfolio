// A body of software work on one page, cut along an ogham stem: who this is and the index of the
// whole, every repository as a line, the ones put forward, one opened, the figures, what it is all
// written in, the families it falls into — each of which has a page of its own — and how the page
// was made. The sections are in oghma-sections.ts, the frame in oghma-frame.ts.

import { esc } from "../html.ts";
import { type PageCtx, type Pattern } from "../page.ts";
import { head, setColours } from "./oghma-parts.ts";
import { footer, header, skip } from "./oghma-frame.ts";
import { breakdown } from "./oghma-figures.ts";
import { entry, objectSection, worksBrief } from "./oghma-sections.ts";

/** How the page itself was made, in the words of the content's own text page. */
function notes(ctx: PageCtx): string {
  const about = ctx.site.content.about;
  if (!about) return "";
  const items = about.sections.map(
    (s) => `<div class="note-row">
        <h3 class="note-key">${esc(s.heading)}</h3>
        <div class="note-body">${s.blocks.map((b) => (b.kind === "p" ? `<p class="readme-p">${b.html}</p>` : "")).join("")}</div>
      </div>`,
  );
  return `<section id="notes" class="section" aria-labelledby="heading-notes">
    ${head({ at: 4, id: "notes", title: about.nav })}
    <div class="notes-grid">${items.join("")}</div>
    ${about.footnote ? `<p class="note-foot">${esc(about.footnote)}</p>` : ""}
  </section>`;
}

export const oghmaPage: Pattern = {
  name: "oghma-page",
  css: ["oghma", "oghma-frame", "oghma-entry", "oghma-works", "oghma-work", "oghma-figures", "oghma-page", "oghma-narrow", "oghma-surface"],
  scripts: ["oghma"],
  sizes: ["lo"],
  render(ctx) {
    setColours(ctx.site.content.landing?.langs ?? []);
    return `<div class="app-shell">
  ${skip(ctx)}
  <div class="main-wrap">
    ${header(ctx)}
    <main id="main-content">
      <div class="content">
        ${entry(ctx)}
        ${worksBrief(ctx)}
        ${objectSection(ctx)}
        ${breakdown(ctx)}
        ${notes(ctx)}
      </div>
    </main>
    ${footer(ctx)}
  </div>
</div>`;
  },
};
