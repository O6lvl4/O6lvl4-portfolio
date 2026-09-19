// Turn the mined projects into the content the site is built from, in one language at a time:
// the orgs as bodies of work, every public repository as a work with its own plate and figures,
// and a landing page whose words come from the same data.
//
//   node scripts/content.mjs ja > data/content.ja.json

import { existsSync, readFileSync } from "node:fs";
import { FAMILIES, familyOf } from "./families.mjs";
import { TEXT } from "./text.mjs";

const lang = process.argv[2] ?? "ja";
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const summaries = existsSync("data/summaries.json") ? JSON.parse(readFileSync("data/summaries.json", "utf8")) : {};

const ORGS = [
  { id: "o6lvl4", owner: "O6lvl4" },
  { id: "almide", owner: "almide" },
  { id: "almide-graphics", owner: "almide-graphics" },
  { id: "almide-ai", owner: "almide-ai" },
  { id: "almd-mc", owner: "almd-mc" },
  { id: "aid-on", owner: "Aid-On" },
];

/** The work put forward: shown as plates, and the first one opened in full. */
const FEATURED = [
  "almide/almide",
  "O6lvl4/gramide",
  "O6lvl4/hew",
  "almide/porta",
  "O6lvl4/codopsy",
  "O6lvl4/uimodulay",
];

const LANGS = [
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
  { id: "zh", label: "中文" },
];

const t = TEXT[lang];
if (!t) throw new Error(`unknown language: ${lang}`);

/** The shared plate when the site or the command gave one; otherwise this language's summary card. */
function plateOf(p) {
  const shared = `plates/shared/${p.owner}/${p.name}.jpg`;
  if ((p.plate === "site" || p.plate === "terminal") && existsSync(shared)) return shared;
  return `plates/${lang}/${p.owner}/${p.name}.jpg`;
}

/** The works a page opens in full: the ones put forward, and the first of every family. */
const OPENED = new Set([
  ...FEATURED,
  ...FAMILIES.map((f) => {
    const list = projects.filter((p) => familyOf(p).id === f.id);
    return [...list].sort((a, b) => b.score - a.score)[0]?.full;
  }).filter(Boolean),
]);

/** Only the works a page shows large carry a picture; the rest are read, not looked at. */
function imageOf(p) {
  return OPENED.has(p.full) ? plateOf(p) : "";
}

/** The work in its own words, for the works a page opens in full. */
function readmeOf(p) {
  const s = summaries[p.full]?.[lang];
  if (!OPENED.has(p.full) || !s) return undefined;
  return {
    lead: s.what,
    points: s.points ?? [],
    code: p.terminal ? { cmd: p.terminal.cmd, out: p.terminal.out } : undefined,
  };
}

function work(p) {
  const s = summaries[p.full]?.[lang];
  const stats = [
    { label: t.stats.commits, value: String(p.commits) },
    p.first ? { label: t.stats.first, value: t.date(p.first) } : undefined,
    p.tag ? { label: t.stats.tag, value: p.tag } : undefined,
    p.stars ? { label: t.stats.stars, value: String(p.stars) } : undefined,
  ].filter(Boolean);
  const links = [{ label: t.links.repo, href: p.url }];
  if (p.site) links.push({ label: t.links.site, href: p.site });
  return {
    image: imageOf(p),
    readme: readmeOf(p),
    id: p.full,
    title: p.name,
    titleEn: s?.what ?? p.lead ?? undefined,
    date: p.last ? t.date(p.last) : undefined,
    format: p.language || undefined,
    // where it lives: the org that holds it, shown as the tag on its line
    credit: p.owner,
    url: p.url,
    tags: [...new Set([...p.languages, ...p.topics])].slice(0, 4),
    stats,
    links,
    // the printed date is written for reading, so the list sorts on the ISO one
    order: { date: p.last ?? "" },
  };
}

/** How many commits fell in each year, over a set of repositories; each commit counted once. */
function yearsOf(list) {
  const m = new Map();
  for (const p of list) for (const [y, n] of Object.entries(p.years ?? {})) m.set(y, (m.get(y) ?? 0) + n);
  return [...m].sort((a, b) => Number(a[0]) - Number(b[0])).map(([name, count]) => ({ name, count }));
}

// The work is grouped by what kind of thing it is, and each family gets its own page: the list is
// read by family, not by where the repository happens to live.
const byFamily = new Map(FAMILIES.map((f) => [f.id, []]));
for (const p of projects) byFamily.get(familyOf(p).id).push(p);

const series = FAMILIES.map((f) => {
  const list = [...byFamily.get(f.id)].sort((a, b) => b.score - a.score);
  const years = yearsOf(list);
  const langs = new Set(list.map((p) => p.language).filter(Boolean));
  const span = years.length ? `${years[0].name}–${years[years.length - 1].name}` : "—";
  return {
    id: f.id,
    title: f.name[lang],
    short: f.short[lang],
    intro: f.intro[lang],
    figures: [
      { value: String(list.length), label: t.figures.repos },
      { value: years.reduce((n, y) => n + y.count, 0).toLocaleString("en-US"), label: t.figures.commits },
      { value: String(langs.size), label: t.figures.langs },
      { value: span, label: t.figures.span },
    ],
    years,
    works: list.map(work),
  };
});

// what the work is made with: the languages the repositories are actually written in
const langCount = new Map();
for (const p of projects) for (const l of p.languages) langCount.set(l, (langCount.get(l) ?? 0) + 1);
const byCount = [...langCount].sort((a, b) => b[1] - a[1]);
const stack = [
  { heading: t.stack[0], items: byCount.slice(0, 5).map(([l, n]) => `${l}（${n}）`) },
  { heading: t.stack[1], items: byCount.slice(5, 12).map(([l]) => l) },
];

// when it happened: the years the work started in, and what started then
const byYear = new Map();
for (const p of projects) {
  const year = (p.first || p.last || "").slice(0, 4);
  if (!/^\d{4}$/.test(year)) continue;
  byYear.set(year, [...(byYear.get(year) ?? []), p]);
}
const timeline = [...byYear]
  .sort((a, b) => Number(b[0]) - Number(a[0]))
  .map(([year, list]) => {
    const top = [...list].sort((a, b) => b.score - a.score).slice(0, 4);
    const rest = list.length - top.length;
    return {
      period: lang === "en" ? year : `${year}年`,
      title: t.started(list.length),
      lead: top.map((p) => p.name).join(lang === "en" ? ", " : "、") + (rest > 0 ? t.andMore(rest) : ""),
      tags: [...new Set(top.map((p) => p.language).filter(Boolean))],
    };
  });

const total = projects.length;
const page = t.aboutPage;

// what the work is written in, as a distribution: the primary language of each repository.
// Almide is the house language, so it takes the ink colour; the rest keep GitHub's own.
const LANG_COLOR = {
  Almide: "currentColor", TypeScript: "#3178c6", JavaScript: "#f1e05a", Rust: "#dea584",
  Go: "#00add8", Python: "#3572a5", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c",
  C: "#555555", "C++": "#f34b7d", Ruby: "#701516", Java: "#b07219", Kotlin: "#a97bff",
  Swift: "#f05138", Lua: "#000080", Nix: "#7e7eff", Dart: "#00b4ab", SQL: "#e38c00",
  Racket: "#3c5caa", Lean: "#4c3023", Zig: "#ec915c", TOML: "#9c4221", YAML: "#cb171e",
};
const primary = new Map();
for (const p of projects) if (p.language) primary.set(p.language, (primary.get(p.language) ?? 0) + 1);
const langBars = [...primary]
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count, color: LANG_COLOR[name] }));

// the years, measured from the commits themselves; history shared between repositories was
// already counted once when it was mined, so these add up to the work actually done
const commitYears = new Map();
for (const p of projects) for (const [y, n] of Object.entries(p.years ?? {})) commitYears.set(y, (commitYears.get(y) ?? 0) + n);
const yearBars = [...commitYears].sort((a, b) => Number(a[0]) - Number(b[0])).map(([name, count]) => ({ name, count }));
const commits = yearBars.reduce((n, y) => n + y.count, 0);

const firstCommit = projects.map((p) => p.first).filter(Boolean).sort()[0] ?? "";
const lastRepo = [...projects].sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""))[0];
const houseShare = Math.round(((primary.get("Almide") ?? 0) / total) * 100);
const thisYear = yearBars[yearBars.length - 1];
const yearShare = Math.round((thisYear.count / commits) * 100);

const figures = [
  { value: String(total), label: t.figures.repos },
  { value: commits.toLocaleString("en-US"), label: t.figures.commits },
  { value: String(langBars.length), label: t.figures.langs },
  { value: String(yearBars.length), label: t.figures.years },
];

const panel = [
  { key: t.panel.handle, value: "O6lvl4" },
  { key: t.panel.orgs, value: String(ORGS.length) },
  { key: t.panel.first, value: t.date(firstCommit) },
  { key: t.panel.last, value: `${lastRepo.name} · ${t.date(lastRepo.last)}` },
  { key: t.panel.repos, value: String(total) },
  { key: t.panel.commits, value: commits.toLocaleString("en-US") },
  { key: t.panel.house, value: `${houseShare}%`, fill: houseShare / 100 },
  { key: t.panel.thisYear(thisYear.name), value: `${yearShare}%`, fill: yearShare / 100 },
];

const content = {
  lang,
  baseUrl: `https://o6lvl4.github.io/O6lvl4-portfolio/${lang}/`,
  root: "..",
  title: "O6lvl4",
  description: t.description(total),
  share: { image: `og.${lang}.jpg`, alt: `O6lvl4 — ${t.kicker(total)}` },
  artist: {
    name: "O6lvl4",
    nameEn: t.nameEn,
    life: `${total} repos`,
    avatar: "assets/avatar.png",
    role: t.role,
    // OGMA, between the feather marks that open and close an inscription
    ogham: { letters: "᚛ᚑᚌᚋᚐ᚜", reads: "ogma" },
  },
  links: [
    { label: "GitHub", href: "https://github.com/O6lvl4" },
    { label: "Almide", href: "https://almide.github.io/docs/" },
  ],
  langs: LANGS.map((l) => ({ label: l.label, href: l.id === lang ? "" : `../${l.id}/` })),
  labels: t.labels,
  // an org holds many projects you read rather than recognise: open on a list, with each line
  index: { style: "list", first: true },
  home: { kicker: t.kicker(total), lead: t.lead, note: t.note(total), description: t.description(total) },
  landing: {
    about: t.about(total, commits),
    stack,
    timeline,
    featured: FEATURED,
    panel,
    figures,
    langs: langBars,
    orgs: ORGS.map((o) => ({ name: o.owner, count: projects.filter((p) => p.owner === o.owner).length })),
    years: yearBars,
  },
  series,
  about: {
    id: "about",
    nav: page.nav,
    description: page.description,
    sections: page.sections(total).map((s) => ({ heading: s.heading, blocks: [{ kind: "p", html: s.text }] })),
    footnote: page.footnote,
  },
};

process.stdout.write(JSON.stringify(content, null, 1) + "\n");
