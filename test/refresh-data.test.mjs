import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

test("refresh discovers new work, excludes removed/private/fork/furniture entries and counts shared history once", () => {
  const root = mkdtempSync(join(tmpdir(), "portfolio-data-test-"));
  const env = {
    ...process.env, PORTFOLIO_CLONES: root, PORTFOLIO_AUTOMATED: "1",
    GIT_AUTHOR_NAME: "Fixture", GIT_AUTHOR_EMAIL: "fixture@example.com",
    GIT_COMMITTER_NAME: "Fixture", GIT_COMMITTER_EMAIL: "fixture@example.com",
    GIT_AUTHOR_DATE: "2025-01-02T12:00:00Z", GIT_COMMITTER_DATE: "2025-01-02T12:00:00Z",
  };
  const git = (args) => execFileSync("git", args, { env, stdio: "pipe" });
  const source = join(root, "O6lvl4/new-work");
  mkdirSync(source, { recursive: true });
  mkdirSync(join(root, "data"));
  try {
    git(["init", source]);
    writeFileSync(join(source, "main.almd"), 'fn main() = println("hello")\n');
    writeFileSync(join(source, "README.md"), "# New work\n\nA newly published project with enough README text to become its portfolio description automatically.\n");
    git(["-C", source, "add", "."]);
    git(["-C", source, "commit", "-m", "First work"]);
    git(["clone", source, join(root, "O6lvl4/shared-history")]);
    git(["init", join(root, "O6lvl4/empty-work")]);
    const mined = execFileSync(process.execPath, [resolve("scripts/mine.mjs")], { cwd: root, env, encoding: "utf8" });
    writeFileSync(join(root, "data/repos.json"), mined);
    const minedRepos = JSON.parse(mined);
    assert.equal(minedRepos.find((p) => p.name === "new-work").log[0].split(" ")[0].length, 40);
    assert.equal(minedRepos.find((p) => p.name === "empty-work").commits, 0);
    writeFileSync(join(root, "repos.tsv"), [
      "O6lvl4/new-work\tpublic\tfalse\t-\t3\t2025-01-02\tNew work",
      "O6lvl4/shared-history\tpublic\tfalse\t-\t0\t2025-01-02\tShared",
      "O6lvl4/private-work\tprivate\tfalse\t-\t0\t2025-01-02\tPrivate",
      "O6lvl4/fork-work\tpublic\ttrue\t-\t0\t2025-01-02\tFork",
      "O6lvl4/.github\tpublic\tfalse\t-\t0\t2025-01-02\tProfile",
      "almide/.github\tpublic\tfalse\t-\t0\t2025-01-02\tProfile",
      "O6lvl4/O6lvl4-portfolio\tpublic\tfalse\t-\t0\t2025-01-02\tThis site",
      "O6lvl4/dotfiles\tpublic\tfalse\t-\t0\t2025-01-02\tDotfiles",
    ].join("\n"));
    writeFileSync(join(root, "home.tsv"), "O6lvl4/new-work\t\t\t\thttps://repository-images.githubusercontent.com/1/preview\n");
    writeFileSync(join(root, "data/projects.json"), JSON.stringify([{ full: "O6lvl4/deleted-work" }]));
    const projects = JSON.parse(execFileSync(process.execPath, [resolve("scripts/plan.mjs"), "repos.tsv", "home.tsv"], { cwd: root, env, encoding: "utf8" }));
    assert.deepEqual(projects.map((p) => p.full).sort(), ["O6lvl4/new-work", "O6lvl4/shared-history"]);
    assert(projects.every((p) => p.language === "Almide" && p.commits === 1));
    assert.equal(projects.reduce((n, p) => n + (p.years["2025"] ?? 0), 0), 1);
    assert(projects.every((p) => p.terminal === undefined));
    // an uploaded social preview is the plate; without one the code still is
    assert.equal(projects.find((p) => p.name === "new-work").plate, "og");
    assert.equal(projects.find((p) => p.name === "new-work").og, "https://repository-images.githubusercontent.com/1/preview");
    assert.equal(projects.find((p) => p.name === "shared-history").plate, "code");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
