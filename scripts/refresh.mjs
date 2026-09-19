// Refresh from public GitHub repositories in an isolated directory; never touch local clones.
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

const owners = ["O6lvl4", "Aid-On", "almide", "almide-graphics", "almide-ai", "almd-mc"];
const root = mkdtempSync(join(tmpdir(), "portfolio-refresh-"));
const env = { ...process.env, PORTFOLIO_CLONES: root, PORTFOLIO_AUTOMATED: "1", GIT_TERMINAL_PROMPT: "0", GIT_LFS_SKIP_SMUDGE: "1" };

function json(args) {
  return JSON.parse(execFileSync("gh", ["api", ...args], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }));
}

function clone(repo) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["clone", "--quiet", "--single-branch", `https://github.com/${repo.full_name}.git`, join(root, repo.full_name)], { env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Clone failed: ${repo.full_name} (${code})`)));
  });
}

const repos = [];
for (const owner of owners) {
  const account = json([`users/${owner}`]);
  const endpoint = account.type === "Organization" ? `orgs/${owner}/repos?type=public` : `users/${owner}/repos?type=owner`;
  const pages = json([`${endpoint}&per_page=100`, "--paginate", "--slurp"]);
  const publicRepos = pages.flat().filter((r) => !r.private && !r.fork && r.owner.login.toLowerCase() === owner.toLowerCase());
  if (!publicRepos.length) throw new Error(`No public repositories returned for ${owner}; refusing an incomplete update`);
  repos.push(...publicRepos);
}
repos.sort((a, b) => a.full_name.localeCompare(b.full_name));
process.stdout.write(`Collecting ${repos.length} public repositories into ${root}\n`);
let next = 0;
async function worker() {
  while (next < repos.length) {
    const repo = repos[next++];
    await clone(repo);
    process.stdout.write(`Collected ${repo.full_name}\n`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const cell = (value) => String(value ?? "").replace(/[\t\r\n]+/g, " ");
function tsv(name, rows) {
  const path = join(root, name);
  writeFileSync(path, rows.map((row) => row.map(cell).join("\t")).join("\n") + "\n");
  return path;
}
const meta = tsv("repos.tsv", repos.map((r) => [r.full_name, "public", "false", r.language ?? "-", r.stargazers_count, r.pushed_at?.slice(0, 10), r.description]));
const home = tsv("home.tsv", repos.map((r) => [r.full_name, r.homepage, r.license?.spdx_id, r.topics?.join(",")]));
function run(script, args = [], output) {
  const result = execFileSync(process.execPath, [`scripts/${script}.mjs`, ...args], {
    env, encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", output ? "pipe" : "inherit", "inherit"],
  });
  if (output) writeFileSync(output, result);
}
run("mine", [], "data/repos.json");
run("plan", [meta, home], "data/projects.json");
const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
assert.deepEqual(projects.map((p) => p.full).sort(), repos.map((r) => r.full_name).sort(), "Incomplete public repository inventory");
run("content", ["en"], "data/content.en.json");
run("refresh-plates");
for (const lang of ["en", "ja", "zh"]) run("content", [lang], `data/content.${lang}.json`);
rmSync("site", { recursive: true, force: true });
run("site");
run("verify-site");
writeFileSync("site/updated.json", JSON.stringify({ updatedAt: new Date().toISOString(), repositories: repos.length }) + "\n");
