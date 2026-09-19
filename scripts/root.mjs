// Prefer the reader's saved choice or browser languages; otherwise open English.
//
//   node scripts/root.mjs > site/index.html

import { readFileSync } from "node:fs";

const content = JSON.parse(readFileSync("data/content.en.json", "utf8"));
const languageClient = readFileSync(new URL("./language-client.js", import.meta.url), "utf8");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LANGS = [
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "zh", label: "中文" },
];

const links = LANGS.map((l) => `<a href="./${l.id}/" data-site-language="${l.id}">${l.label}</a>`).join("");

process.stdout.write(`<!doctype html>
<html lang="en" data-language-entry>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>O6lvl4</title>
<meta name="description" content="Public work under O6lvl4, Aid-On, almide and the almide-* orgs.">
<link rel="canonical" href="${esc(content.baseUrl)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="O6lvl4">
<meta property="og:title" content="${esc(content.artist.role)} | O6lvl4">
<meta property="og:description" content="${esc(content.home.lead)}">
<meta property="og:url" content="${esc(new URL('../', content.baseUrl).href)}">
<meta property="og:image" content="${esc(new URL('share/og.en.jpg', content.baseUrl).href)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(content.share.alt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="en/mark.png" type="image/png">
<link rel="alternate" hreflang="ja" href="./ja/">
<link rel="alternate" hreflang="en" href="./en/">
<link rel="alternate" hreflang="zh" href="./zh/">
<link rel="alternate" hreflang="x-default" href="./en/">
<style>
  body { margin: 0; min-height: 100dvh; display: grid; place-content: center; gap: 26px; justify-items: center;
         background: #f4f3ef; color: #1a1918; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  img { width: 56px; height: 56px; border-radius: 5px; }
  h1 { margin: 0; font-size: 28px; font-weight: 500; letter-spacing: 0.06em; }
  nav { display: flex; gap: 22px; }
  a { color: #1f4d6b; font-size: 13px; letter-spacing: 0.14em; text-decoration: none; border-bottom: 1px solid #dcd7cc; }
  a:hover { border-color: #1f4d6b; }
</style>
<script>
${languageClient}
</script>
</head>
<body>
<img src="en/mark.png" alt="">
<h1>O6lvl4</h1>
<nav>${links}</nav>
</body>
</html>
`);
