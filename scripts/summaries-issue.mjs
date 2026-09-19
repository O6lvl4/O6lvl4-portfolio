// One issue, kept in step with the projects that are still shown with their GitHub description.
//
// Summaries are written by hand (scripts/summarize.mjs, through the local Claude login), so what an
// automatic refresh can do is say which projects are waiting for one: it opens the issue when a
// project appears without a summary, keeps the list current, and closes it when none are left.
//
//   node scripts/summaries-issue.mjs
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const TITLE = "Projects without a summary";
// The portfolio is the site itself; its card is meant to read as the repository's own description.
const EXCLUDED = new Set(["O6lvl4/O6lvl4-portfolio"]);
const LANGS = ["ja", "en", "zh"];
// A checklist is a reminder, not an inventory: a lost summaries.json should not write a novel.
const SHOWN = 30;

const gh = (args, input) => execFileSync("gh", args, { encoding: "utf8", input });

const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const summaries = JSON.parse(readFileSync("data/summaries.json", "utf8"));
const missing = projects.filter((p) => !EXCLUDED.has(p.full) && LANGS.some((lang) => !summaries[p.full]?.[lang]));

const issues = JSON.parse(gh(["issue", "list", "--state", "open", "--limit", "100", "--json", "number,title"]));
const open = issues.find((issue) => issue.title === TITLE)?.number;

if (!missing.length) {
  if (open) gh(["issue", "close", String(open), "--comment", "Every project has a summary again."]);
  process.stdout.write(open ? `Closed #${open}: every project has a summary\n` : "Every project has a summary\n");
} else {
  const listed = missing.slice(0, SHOWN);
  const body = [
    "These projects are shown with their GitHub description, because `data/summaries.json` has",
    "nothing for them in one of the three languages yet.",
    "",
    "Summaries are written by hand, from each project's own README:",
    "",
    "```bash",
    `npm run summarize -- --only ${listed.map((p) => p.full).join(",")}`,
    "```",
    "",
    `Waiting for a summary (${missing.length}):`,
    "",
    ...listed.map((p) => `- [ ] [${p.full}](${p.url})${p.lead ? ` — ${p.lead}` : ""}`),
    missing.length > listed.length ? `- …and ${missing.length - listed.length} more` : undefined,
    "",
    "The daily refresh keeps this list current and closes the issue once nothing is left.",
  ].filter((line) => line !== undefined).join("\n");
  const issue = open
    ? gh(["issue", "edit", String(open), "--body-file", "-"], body)
    : gh(["issue", "create", "--title", TITLE, "--body-file", "-"], body);
  process.stdout.write(`${missing.length} without a summary: ${issue.trim()}\n`);
}
