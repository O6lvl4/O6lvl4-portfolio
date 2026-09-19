// Site-specific presentation of navigation, after the shared template renders it.
import { readFileSync, writeFileSync } from "node:fs";
import { enhanceWorks } from "./works-ui.mjs";

export function finishInterface(out, pages) {
  for (const page of pages) {
    const file = `${out}/${page}index.html`;
    let html = readFileSync(file, "utf8");
    // Remove only decorative navigation arrows, preserving symbols in project content.
    html = html.replace(/[ \t]*<span\b[^>]*aria-hidden="true"[^>]*>\s*[←→↗↘↙↖↑↓]\s*<\/span>/g, "")
      .replace(/(<a class="fam-back"[^>]*>)←\s*/g, "$1");
    if (page === "works/") {
      const content = JSON.parse(readFileSync(`data/content.${out.split("/").at(-1)}.json`, "utf8"));
      html = enhanceWorks(html, content);
      html = html.replace("</style>", `
.list-intro { margin-bottom: 0; }
.list-intro .works-lead { max-width: none; }
.list-intro + .section { padding-top: calc(var(--section-gap) * 0.4); }
</style>`);
    }
    writeFileSync(file, html);
  }
}
