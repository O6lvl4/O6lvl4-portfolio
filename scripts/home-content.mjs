// Edit the featured project's words without changing the shared template or its layout.
import { readFileSync, writeFileSync } from "node:fs";
import { TEXT } from "./text.mjs";

const COPY = {
  ja: {
    category: "プログラミング言語の設計・開発",
    lead: "AIと一緒に書き、直し続けられる言語を。",
    sections: [
      ["目指していること", "LLMによる編集後も動くコードを目指した、静的型付け言語です。型の検査と修正案を示す診断で、コードを直す作業を支えます。"],
      ["つくっているもの", "Rustで実装した言語本体に加え、仕様・文法・標準ライブラリ・エディタ支援・実行環境まで開発しています。"],
      ["実際の道具へ", "Almideで、構文木をつくるgramide、コードを構造で読むhew、エージェントを隔離して実行するportaをつくっています。"],
    ],
    repo: "ソースコード", docs: "言語のドキュメント",
  },
  en: {
    category: "Language design & development",
    lead: "A language for writing and revising code with AI.",
    sections: [
      ["The aim", "A statically typed language designed to keep code working after LLM edits. Type checking and diagnostics that suggest fixes support the next revision."],
      ["What I build", "The language implementation in Rust, together with its specification, grammar, standard library, editor support and runtimes."],
      ["Tools built with it", "I use Almide to build gramide for syntax trees, hew for reading code by structure, and porta for running agents in isolation."],
    ],
    repo: "Source code", docs: "Language documentation",
  },
  zh: {
    category: "编程语言设计与开发",
    lead: "与AI一起编写、持续修改代码的语言。",
    sections: [
      ["目标", "一门以LLM编辑后代码仍能运行为目标的静态类型语言。通过类型检查和提供修复建议的诊断，支持持续修改代码。"],
      ["开发内容", "除用Rust实现的语言本体外，还开发规范、语法、标准库、编辑器支持与运行时。"],
      ["用于实际工具", "用Almide开发构建语法树的gramide、按结构读取代码的hew，以及隔离运行智能体的porta。"],
    ],
    repo: "源代码", docs: "语言文档",
  },
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function updateProfile(html, lang) {
  const profile = TEXT[lang].profile;
  const highlights = `<div class="stat-panel">${profile.highlights.map((item) => `<div class="stat-cell"><div class="stat-val">${esc(item.value)}</div><div class="stat-label">${esc(item.label)}</div></div>`).join("")}</div>`;
  const rows = profile.rows.map((row) => `<div class="panel-row"><span class="panel-key">${esc(row.key)}</span><span class="panel-val">${esc(row.value)}</span></div>`).join("\n");
  const target = /(<div class="instrument-panel profile-card">[\s\S]*?)<div class="stat-panel">[\s\S]*?(?=<div class="profile-links">)/;
  if (!target.test(html)) throw new Error("Profile card not found");
  return html.replace(target, (_, head) => head.replace(/<div class="profile-role">[\s\S]*?<\/div>/, `<div class="profile-role">${esc(profile.role)}</div>`) + highlights + rows);
}

export function updateHomeContent(out, content) {
  const work = content.series.flatMap((s) => s.works).find((w) => w.id === content.landing.featured[0]);
  if (work?.id !== "almide/almide") return;
  const t = COPY[content.lang];
  const panel = `<div class="object-meta-panel" aria-label="Almide">
    <div class="om-head"><span class="om-family">${esc(t.category)}</span></div>
    <h3 class="om-name">Almide</h3>
    <p class="readme-p">${esc(t.lead)}</p>
    ${t.sections.map(([heading, body]) => `<div><h4 class="readme-h2">${esc(heading)}</h4><p class="readme-p">${esc(body)}</p></div>`).join("\n")}
    <div class="om-links">${work.links.map((link, i) => `<a class="om-link" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(i === 0 ? t.repo : t.docs)}</a>`).join("")}</div>
  </div>`;
  const path = `${out}/index.html`;
  const html = readFileSync(path, "utf8");
  const target = /<div class="object-meta-panel"[^>]*>[\s\S]*?(?=\s*<article class="readme-panel")/;
  if (!target.test(html)) throw new Error("Featured project panel not found");
  writeFileSync(path, updateProfile(html.replace(target, panel), content.lang));
}
