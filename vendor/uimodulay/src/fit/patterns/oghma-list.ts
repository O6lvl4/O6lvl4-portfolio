// Every repository on one page: the list the front page links to rather than unrolling in place.
// The frame is the same as the front page's; the list itself, with its filters and its ordering,
// is the works section in oghma-sections.ts.

import { esc } from "../html.ts";
import { href, label, type PageCtx, type Pattern } from "../page.ts";
import { setColours } from "./oghma-parts.ts";
import { footer, header, skip } from "./oghma-frame.ts";
import { worksSection } from "./oghma-sections.ts";

/**
 * The way back and what this page is — no heading of its own, because the list below carries the
 * one heading this page needs, with the count in it.
 */
function listIntro(ctx: PageCtx): string {
  return `<div class="list-intro">
    <a class="fam-back" href="${href(ctx, "")}">← ${esc(label(ctx, "home", "Front page"))}</a>
    <p class="works-lead">${esc(label(ctx, "listLead", "Every public repository, in one list."))}</p>
  </div>`;
}

export const oghmaList: Pattern = {
  name: "oghma-list",
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
        ${listIntro(ctx)}
        ${worksSection(ctx)}
      </div>
    </main>
    ${footer(ctx)}
  </div>
</div>`;
  },
};
