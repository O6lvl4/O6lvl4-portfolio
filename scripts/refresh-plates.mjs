// Only the projects actually shown with an image need a generated plate.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const content = JSON.parse(readFileSync("data/content.en.json", "utf8"));
const ids = content.series.flatMap((s) => s.works.filter((w) => w.image).map((w) => w.id));
if (ids.length) execFileSync(process.execPath, ["scripts/plates.mjs", "--only", [...new Set(ids)].join(",")], { stdio: "inherit" });
