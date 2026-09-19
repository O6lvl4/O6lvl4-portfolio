import { readFileSync } from "node:fs";
const COPY = {
  ja: { search: "キーワードで検索", placeholder: "名前・説明・タグなどで検索", family: "分野", language: "使用言語", sort: "並べ替え", all: "すべて", reset: "条件をリセット", clear: "検索をクリア", empty: "条件に合うプロジェクトがありません。", hint: "キーワードを短くするか、分野・言語の条件を変えてみてください。", count: "件", sorts: ["更新が新しい順", "コミットが多い順", "名前順", "言語順"] },
  en: { search: "Search projects", placeholder: "Search names, descriptions and tags", family: "Field", language: "Language", sort: "Sort by", all: "All", reset: "Reset filters", clear: "Clear search", empty: "No projects match your search.", hint: "Try a shorter keyword or change the field and language filters.", count: "projects", sorts: ["Recently updated", "Most commits", "Name", "Language"] },
  zh: { search: "按关键词搜索", placeholder: "搜索名称、介绍、标签等", family: "领域", language: "使用语言", sort: "排序", all: "全部", reset: "重置筛选", clear: "清除搜索", empty: "没有符合条件的项目。", hint: "尝试缩短关键词，或更改领域和语言筛选。", count: "个", sorts: ["最近更新", "提交最多", "名称", "语言"] },
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function select(id, title, values) {
  return `<div class="work-field"><span id="${id}-label">${esc(title)}</span><select id="${id}" aria-labelledby="${id}-label">${values.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("")}</select></div>`;
}
export function enhanceWorks(html, content) {
  const t = COPY[content.lang];
  const languages = [...new Set(content.series.flatMap((s) => s.works.map((w) => w.format)).filter(Boolean))].sort();
  const controls = `<div class="work-controls" hidden>
    <div class="work-search" role="search"><label class="visuallyHidden" for="work-query">${t.search}</label><div class="work-search-input"><svg class="work-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="work-query" type="search" placeholder="${t.placeholder}" autocomplete="off" spellcheck="false" aria-controls="project-results"><button id="work-clear" type="button" hidden>${t.clear}</button><kbd class="work-shortcut" aria-hidden="true">Ctrl K</kbd></div></div>
    <div class="work-filters">
      ${select("work-family", t.family, [["", t.all], ...content.series.map((s) => [s.id, s.title])])}
      ${select("work-language", t.language, [["", t.all], ...languages.map((l) => [l, l])])}
      ${select("work-sort", t.sort, ["date", "commits", "name", "format"].map((s, i) => [s, t.sorts[i]]))}
    </div>
    <div class="work-feedback"><p id="work-count" role="status" aria-live="polite" aria-atomic="true" data-unit="${t.count}"></p><button id="work-reset" type="button" disabled>${t.reset}</button></div>
  </div>
  <div class="work-empty" hidden><h3>${t.empty}</h3><p>${t.hint}</p></div>`;
  const target = /<div class="org-rail"[\s\S]*?(?=\s*<ul class="repo-list")/;
  if (!target.test(html)) throw new Error("Works controls not found");
  const css = readFileSync(new URL("./works-ui.css", import.meta.url), "utf8");
  const js = ["./works-picker.js", "./works-client.js"].map((file) => readFileSync(new URL(file, import.meta.url), "utf8")).join("\n");
  return html.replace('<body>', '<body class="works-page">')
    .replace(target, controls)
    .replace('<ul class="repo-list"', '<ul id="project-results" class="repo-list"')
    .replace("\nlisting();", "\n// The works page uses the combined search controller below.")
    .replace("</style>", `${css}\n</style>`)
    .replace("</body>", `<script type="module">${js}</script>\n</body>`);
}
