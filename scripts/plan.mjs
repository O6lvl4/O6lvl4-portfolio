// Merge what the clones say (data/repos.json) with what GitHub says (stars, description, site,
// license, topics) into the list the site is built from, and decide what each project's plate
// will be drawn from: the preview its author uploaded, its own site, its own command, or its code.
//
//   node scripts/plan.mjs <repos.tsv> <home.tsv> > data/projects.json

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { shown } from "./shown.mjs";

const [reposTsv, homeTsv] = process.argv.slice(2);
const OWNERS = ["O6lvl4", "almide", "almide-graphics", "almide-ai", "almd-mc", "Aid-On"];

/** repos whose command is installed here, so the plate can be its real output */
const COMMANDS = {
  "almide/almide": ["almide", ["--help"]],
  "O6lvl4/hew": ["hew", ["--help"]],
  "O6lvl4/codopsy": ["codopsy", ["--help"]],
  "O6lvl4/gramide-cli": ["gramide", ["--help"]],
  "O6lvl4/qusp": ["qusp", ["--help"]],
  "O6lvl4/ctxgate": ["ctxgate", ["--help"]],
};

const tsv = (file, cols) =>
  readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const c = l.split("\t");
      return Object.fromEntries(cols.map((k, i) => [k, c[i] ?? ""]));
    });

const github = new Map();
for (const r of tsv(reposTsv, ["full", "visibility", "fork", "language", "stars", "pushed", "description"])) {
  if (r.visibility === "public" && r.fork === "false" && shown(r.full)) github.set(r.full, r);
}
const extra = new Map();
for (const r of tsv(homeTsv, ["full", "site", "license", "topics", "og"])) extra.set(r.full, r);

const mined = new Map(JSON.parse(readFileSync("data/repos.json", "utf8")).map((m) => [m.full, m]));

/** A site worth a picture: the project's own page, not a package registry or its own repo. */
function siteOf(full) {
  const site = extra.get(full)?.site ?? "";
  if (!/^https?:\/\//.test(site)) return undefined;
  if (/github\.com|npmjs\.com|crates\.io|pypi\.org/.test(site)) return undefined;
  return site;
}

function help(full) {
  if (process.env.PORTFOLIO_AUTOMATED === "1") return undefined;
  const c = COMMANDS[full];
  if (!c) return undefined;
  try {
    const out = execFileSync(c[0], c[1], { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] });
    return { cmd: `${c[0]} ${c[1].join(" ")}`, out: out.split("\n").slice(0, 28).join("\n") };
  } catch (e) {
    const out = String(e.stdout ?? "") + String(e.stderr ?? "");
    return out.trim() ? { cmd: `${c[0]} ${c[1].join(" ")}`, out: out.split("\n").slice(0, 28).join("\n") } : undefined;
  }
}

const DAY = 864e5;

/** Worked on lately counts for something; a year ago, less. */
function recency(days) {
  if (days < 90) return 3;
  return days < 365 ? 1 : 0;
}

/**
 * What the plate is drawn from: the social preview its author uploaded, which is the picture they
 * chose for it; otherwise the project's command, its site, or its code.
 */
function plateKind(terminal, site, og) {
  if (og) return "og";
  if (terminal) return "terminal";
  return site ? "site" : "code";
}

/**
 * How many commits fell in each year. Repositories split from a common history share commits, so
 * each one counts once — for the first shown repository it appears in — and the years then add up
 * to the work actually done rather than to the sum of the histories.
 */
const counted = new Set();

function byYear(log) {
  const years = {};
  for (const line of log) {
    const [hash, date] = line.split(" ");
    const year = (date ?? "").slice(0, 4);
    if (!/^\d{4}$/.test(year) || counted.has(hash)) continue;
    counted.add(hash);
    years[year] = (years[year] ?? 0) + 1;
  }
  return years;
}

function score(p) {
  const days = (Date.now() - Date.parse(p.last || p.pushed)) / DAY;
  const recent = recency(days);
  return p.stars * 5 + (p.tag ? 4 : 0) + Math.min(p.commits / 50, 6) + (p.lead ? 2 : 0) + recent;
}

const projects = [];
for (const [full, g] of github) {
  const [owner, name] = full.split("/");
  if (!OWNERS.includes(owner)) continue;
  const m = mined.get(full) ?? {};
  const site = siteOf(full);
  const terminal = help(full);
  const langs = (m.languages ?? []).slice(0, 3).map((l) => l.name);
  const p = {
    full, owner, name,
    url: `https://github.com/${full}`,
    site,
    lead: (g.description || m.lead || "").replace(/\s+/g, " ").trim(),
    heading: m.heading,
    language: langs[0] ?? g.language.replace("-", "") ?? "",
    languages: langs,
    stars: Number(g.stars),
    commits: m.commits ?? 0,
    years: byYear(m.log ?? []),
    first: m.first ?? "",
    last: m.last ?? g.pushed,
    tag: m.tag,
    license: extra.get(full)?.license || undefined,
    topics: (extra.get(full)?.topics ?? "").split(",").filter(Boolean),
    og: extra.get(full)?.og || undefined,
    plate: plateKind(terminal, site, extra.get(full)?.og),
    terminal,
    sample: m.sample,
  };
  projects.push({ ...p, score: Number(score(p).toFixed(1)) });
}

projects.sort((a, b) => OWNERS.indexOf(a.owner) - OWNERS.indexOf(b.owner) || b.score - a.score);
process.stdout.write(JSON.stringify(projects, null, 1) + "\n");
