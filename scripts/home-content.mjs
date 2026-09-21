// Edit the profile card's words without changing the shared template or its layout.
import { readFileSync, writeFileSync } from "node:fs";
import { TEXT } from "./text.mjs";

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
  const path = `${out}/index.html`;
  const html = readFileSync(path, "utf8");
  const updated = updateProfile(html, content.lang)
    .replace(/[ \t]*<div class="entry-handle">[\s\S]*?<\/div>\n?/, '')
    .replace('</style>', `
#entry .entry-title { margin-top: 1rem; font-size: 0.8125rem; line-height: 1.8; letter-spacing: 0; text-transform: none; }
</style>`);
  writeFileSync(path, updated);
}
