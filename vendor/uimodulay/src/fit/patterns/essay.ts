// The text page, set like a catalogue essay: section labels in a narrow column on the left,
// the text in a measure of about 36 characters on the right.

import { esc } from "../html.ts";
import type { Block } from "../model.ts";
import type { PageCtx, Pattern } from "../page.ts";
import { contactList } from "./frame.ts";

function block(ctx: PageCtx, b: Block): string {
  switch (b.kind) {
    case "p":
      return `<p>${b.html}</p>`;
    case "list":
      return `<ul>${b.items.map((it) => `<li><strong>${esc(it.term)}</strong><span>${it.html}</span></li>`).join("")}</ul>`;
    default:
      return contactList(ctx, "articleContact", true);
  }
}

export const essay: Pattern = {
  name: "essay",
  css: ["essay"],
  render(ctx) {
    const about = ctx.site.content.about;
    if (!about) return "";
    const sections = about.sections.map((s) => `<h2>${esc(s.heading)}</h2>\n${s.blocks.map((b) => block(ctx, b)).join("\n")}`);
    const foot = about.footnote ? `<hr>\n<p class="footnote">${about.footnote}</p>` : "";
    return `<article class="essay">
<h1 class="visuallyHidden">${esc(about.nav)}</h1>
${sections.join("\n")}
${foot}
</article>`;
  },
};
