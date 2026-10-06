import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { familyOf } from "../scripts/families.mjs";
import { TEXT } from "../scripts/text.mjs";

test("Arlk is a language; its and nn's editorial copy retains all three languages", () => {
  assert.equal(familyOf({ full: "O6lvl4/arlk", owner: "O6lvl4", name: "arlk" }).id, "almide");
  const summaries = JSON.parse(readFileSync("data/summaries.json", "utf8"));
  const limits = { ja: [42, 26], en: [90, 54], zh: [30, 18] };
  for (const id of ["O6lvl4/arlk", "almide-graphics/nn"]) {
    for (const [lang, [lead, point]] of Object.entries(limits)) {
      const copy = summaries[id][lang];
      assert(copy.what.length <= lead);
      assert.equal(copy.points.length, 3);
      assert(copy.points.every((text) => text.length <= point));
      if (id.endsWith("/nn")) assert.match(JSON.stringify(copy), /Qwen/);
    }
  }
});

test("all languages prefer published releases, label fallback tags honestly, and omit absent versions", () => {
  const root = mkdtempSync(join(tmpdir(), "portfolio-content-test-"));
  mkdirSync(join(root, "data"));
  const project = (name, version) => ({ full: `O6lvl4/${name}`, owner: "O6lvl4", name, url: `https://github.com/O6lvl4/${name}`, language: "Almide", languages: ["Almide"], topics: [], commits: 1, years: { 2026: 1 }, first: "2026-01-01", last: "2026-01-01", score: 1, ...version });
  const projects = [
    project("arlk", { tag: "v0.60.0-rc3", release: { tag: "v0.66.0" } }),
    project("tagged", { tag: "v0.67.0-rc1" }),
    project("unversioned", {}),
  ];
  writeFileSync(join(root, "data/projects.json"), JSON.stringify(projects));
  try {
    for (const lang of ["ja", "en", "zh"]) {
      const result = JSON.parse(execFileSync(process.execPath, [resolve("scripts/content.mjs"), lang], { cwd: root, encoding: "utf8" }));
      const works = new Map(result.series.flatMap((s) => s.works.map((w) => [w.id, w])));
      const labels = TEXT[lang].stats;
      assert(works.get("O6lvl4/arlk").stats.some((s) => s.label === labels.release && s.value === "v0.66.0"));
      assert(!JSON.stringify(works.get("O6lvl4/arlk")).includes("v0.60.0-rc3"));
      assert(works.get("O6lvl4/tagged").stats.some((s) => s.label === labels.tag && s.value === "v0.67.0-rc1"));
      assert(!works.get("O6lvl4/unversioned").stats.some((s) => [labels.tag, labels.release].includes(s.label)));
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
