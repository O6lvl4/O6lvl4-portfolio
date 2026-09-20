// Small HTML helpers and the document shell every fitted page shares.

import type { Content, Share, Tokens } from "./model.ts";

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(s: string | number | undefined): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Render `name="value"` pairs, skipping undefined and false. */
export function attrs(pairs: Record<string, string | number | boolean | undefined>): string {
  const out: string[] = [];
  for (const [k, v] of Object.entries(pairs)) {
    if (v === undefined || v === false) continue;
    out.push(v === true ? k : `${k}="${esc(v)}"`);
  }
  return out.length ? " " + out.join(" ") : "";
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export interface Head {
  title: string;
  description: string;
  /** path of the page from the site root, "" for the root */
  path: string;
  /** relative prefix from the page back to the site root ("" or "../") */
  root: string;
  share: Share;
  /** the site's icon, from the site root: the maker's own picture, or the seal */
  icon: { file: string; type: string };
}

function absolute(content: Content, path: string): string | undefined {
  if (!content.baseUrl) return undefined;
  return content.baseUrl.replace(/\/?$/, "/") + path;
}

/** Open Graph asks for language_TERRITORY; a bare language tag is quietly ignored. */
const OG_LOCALE: Record<string, string> = { ja: "ja_JP", en: "en_US", zh: "zh_CN" };

function shareMeta(content: Content, head: Head): string {
  const image = absolute(content, head.share.image) ?? head.root + head.share.image;
  const url = absolute(content, head.path);
  return [
    `<meta property="og:site_name" content="${esc(content.title)}">`,
    `<meta property="og:locale" content="${esc(OG_LOCALE[content.lang] ?? content.lang)}">`,
    `<meta property="og:type" content="website">`,
    url ? `<meta property="og:url" content="${esc(url)}"><link rel="canonical" href="${esc(url)}">` : "",
    `<meta property="og:title" content="${esc(head.title)}">`,
    `<meta property="og:description" content="${esc(head.description)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:alt" content="${esc(head.share.alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join("\n");
}

export interface Shell {
  content: Content;
  tokens: Tokens;
  head: Head;
  /** the page's stylesheet, inlined */
  css: string;
  body: string;
  /** module scripts, inlined */
  scripts: string[];
}

export function documentHtml(s: Shell): string {
  const { content, tokens, head } = s;
  return `<!doctype html>
<html lang="${esc(content.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>document.documentElement.classList.add("js")</script>
<title>${esc(head.title)}</title>
<meta name="description" content="${esc(head.description)}">
<meta name="theme-color" content="${esc(tokens.color.ground)}">
${shareMeta(content, head)}
<link rel="icon" href="${head.root}${head.icon.file}" type="${head.icon.type}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(tokens.fonts.href)}">
<style>
${s.css}
</style>
</head>
<body>
${s.body}
${s.scripts.map((js) => `<script type="module">\n${js}\n</script>`).join("\n")}
</body>
</html>
`;
}
