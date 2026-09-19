// Read the local clones under ~/workspace/github.com/<org>/<repo> and write what each project is:
// its own words (README), its history (git), what it is made of (files), and where it lives.
//
//   node scripts/mine.mjs > data/repos.json

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = join(homedir(), "workspace", "github.com");
const OWNERS = ["O6lvl4", "Aid-On", "almide", "almide-graphics", "almide-ai", "almd-mc"];

const git = (dir, args) => {
  try {
    return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

const EXT_LANG = {
  ".almd": "Almide", ".rs": "Rust", ".go": "Go", ".ts": "TypeScript", ".tsx": "TypeScript",
  ".js": "JavaScript", ".mjs": "JavaScript", ".jsx": "JavaScript", ".py": "Python", ".rb": "Ruby",
  ".zig": "Zig", ".swift": "Swift", ".java": "Java", ".kt": "Kotlin", ".c": "C", ".h": "C",
  ".cpp": "C++", ".cs": "C#", ".php": "PHP", ".ex": "Elixir", ".erl": "Erlang", ".hs": "Haskell",
  ".lua": "Lua", ".sh": "Shell", ".sql": "SQL", ".css": "CSS", ".scss": "CSS", ".html": "HTML",
 ".rkt": "Racket", ".lean": "Lean", ".nix": "Nix", ".dart": "Dart",
};
const SKIP_DIR = new Set([".git", "node_modules", "target", "dist", "build", "vendor", ".next", "out", "public", ".venv", "__pycache__", "resources"]);

function readDir(at) {
  try {
    return readdirSync(at, { withFileTypes: true });
  } catch {
    return [];
  }
}

function sizeOf(file) {
  try {
    return statSync(file).size;
  } catch {
    return 0; // a blobless clone can lack the file
  }
}

function langOf(name) {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? undefined : EXT_LANG[name.slice(dot)];
}

/** Bytes of source per language, from the files that are actually there. */
function languages(dir) {
  const bytes = new Map();
  const walk = (at, depth) => {
    if (depth > 4) return;
    for (const e of readDir(at)) {
      if (e.name.startsWith(".") && e.name !== ".github") continue;
      const p = join(at, e.name);
      if (e.isDirectory() && !SKIP_DIR.has(e.name)) walk(p, depth + 1);
      const lang = e.isDirectory() ? undefined : langOf(e.name);
      if (lang) bytes.set(lang, (bytes.get(lang) ?? 0) + sizeOf(p));
    }
  };
  walk(dir, 0);
  return [...bytes].sort((a, b) => b[1] - a[1]).map(([name, size]) => ({ name, size }));
}

/** The project in its own words: the README's first heading and first real paragraph. */
function readme(dir) {
  const file = ["README.md", "readme.md", "README.markdown"].map((f) => join(dir, f)).find(existsSync);
  if (!file) return {};
  const text = readFileSync(file, "utf8");
  const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim();
  const body = text
    .replace(/^#.*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[[!].*$/gm, "")
    .replace(/^\s*[-*|>].*$/gm, "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .find((p) => p.length > 60 && !p.startsWith("<"));
  const code = /```(\w+)?\n([\s\S]{40,900}?)```/.exec(text);
  return { heading, lead: body, sample: code ? { lang: code[1] ?? "", code: code[2].trimEnd() } : undefined, readmeBytes: text.length };
}

/**
 * Every commit of this repository as "<hash> <author date>", so the years can be counted later
 * over the repositories that are actually shown — repositories split from a common history share
 * commits, and a commit should be counted once — and so the first and last dates can be read off
 * the same list rather than trusted to the order git prints.
 */
function log(dir) {
  return git(dir, ["log", "--format=%h %aI"])
    .split("\n")
    .filter(Boolean);
}

function project(owner, name) {
  const dir = join(ROOT, owner, name);
  const commits = git(dir, ["rev-list", "--count", "HEAD"]);
  const tag = git(dir, ["tag", "--sort=-creatordate"]).split("\n")[0];
  // The dates come from the commits themselves, sorted. `git log --reverse --max-count=1` looks
  // like the first commit and is the last one — git takes the count before it reverses — and an
  // author date is not monotonic along the history anyway, so both ends are read off the list.
  const lines = log(dir);
  const dates = lines.map((l) => l.slice(l.indexOf(" ") + 1)).sort();
  const first = dates[0] ?? "";
  const last = dates[dates.length - 1] ?? "";
  return {
    log: lines,
    full: `${owner}/${name}`,
    owner,
    name,
    url: `https://github.com/${owner}/${name}`,
    cloned: existsSync(join(dir, ".git")),
    first: first.slice(0, 10),
    last: last.slice(0, 10),
    commits: commits ? Number(commits) : 0,
    tag: tag || undefined,
    languages: languages(dir),
    ...readme(dir),
  };
}

const out = [];
for (const owner of OWNERS) {
  const dir = join(ROOT, owner);
  if (!existsSync(dir)) continue;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && existsSync(join(dir, e.name, ".git"))) out.push(project(owner, e.name));
  }
}
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
