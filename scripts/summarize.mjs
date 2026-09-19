// What each project does, in three languages, read out of its own README.
//
// One answer per project, no tools, through the local `claude` login. The result is kept in
// data/summaries.json and projects already there are skipped, so the run can be stopped and
// picked up again.
//
//   node scripts/summarize.mjs [--only owner/name,…] [--model sonnet] [--limit 20]

import { query } from "@anthropic-ai/claude-agent-sdk";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = join(homedir(), "workspace", "github.com");
const OUT = "data/summaries.json";
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const only = flag("only")?.split(",");
const limit = Number(flag("limit") ?? 0);
const model = flag("model") ?? "sonnet";

const projects = JSON.parse(readFileSync("data/projects.json", "utf8"));
const done = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const SYSTEM = `You read a repository's own README and say what the project does, for a portfolio.

Answer with JSON only, in this shape:

{"ja":{"what":"…","points":["…","…","…"]},
 "en":{"what":"…","points":["…","…","…"]},
 "zh":{"what":"…","points":["…","…","…"]}}

Rules:
- "what": one sentence, what the project is and what it is for. Japanese ≤ 42 characters,
  English ≤ 90 characters, Chinese ≤ 30 characters. No trailing period in Japanese or Chinese.
- "points": exactly three, each one capability the README actually claims. Japanese ≤ 26
  characters, English ≤ 54, Chinese ≤ 18. Noun phrases, not sentences.
- Say only what the README says. Do not invent features, numbers or status. If the README is thin,
  say what little it says and keep the points concrete (file formats, commands, targets).
- Japanese: plain 常体, no です/ます, no first person. Chinese: simplified.
- Keep the project's own names for things (commands, formats, languages) unchanged.`;

function readme(p) {
  const dir = join(ROOT, p.owner, p.name);
  const file = ["README.md", "readme.md"].map((f) => join(dir, f)).find(existsSync);
  if (!file) return "";
  return readFileSync(file, "utf8").slice(0, 7000);
}

function prompt(p) {
  const head = [
    `Repository: ${p.full}`,
    p.lead ? `GitHub description: ${p.lead}` : "",
    p.languages.length ? `Written in: ${p.languages.join(", ")}` : "",
    p.topics.length ? `Topics: ${p.topics.join(", ")}` : "",
  ].filter(Boolean).join("\n");
  const body = readme(p);
  return `${head}\n\n--- README.md ---\n${body || "(no README)"}\n--- end ---\n\nReturn the JSON now.`;
}

async function ask(text) {
  let out = "";
  for await (const m of query({
    prompt: text,
    options: {
      pathToClaudeCodeExecutable: join(homedir(), ".local/bin/claude"),
      model,
      systemPrompt: SYSTEM,
      tools: [],
      permissionMode: "default",
      effort: "low",
      maxTurns: 2,
      settingSources: [],
      stderr: () => undefined,
    },
  })) {
    if (m.type !== "result") continue;
    if (m.subtype !== "success") throw new Error(`claude returned ${m.subtype}`);
    out = m.result;
  }
  return out;
}

function parse(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0) throw new Error("no JSON: " + text.slice(0, 160));
  return JSON.parse(body.slice(start, end + 1));
}

const ok = (s) => s && typeof s.what === "string" && Array.isArray(s.points) && s.points.length >= 2;

function check(sum) {
  if (!ok(sum.ja) || !ok(sum.en) || !ok(sum.zh)) throw new Error("missing a language");
  return { ja: sum.ja, en: sum.en, zh: sum.zh };
}

const todo = projects.filter((p) => (only ? only.includes(p.full) : !done[p.full]));
const queue = limit ? todo.slice(0, limit) : todo;
process.stderr.write(`${queue.length} to summarise (${Object.keys(done).length} already done)\n`);

let at = 0;
let failed = 0;
const save = () => writeFileSync(OUT, JSON.stringify(done, null, 1) + "\n");

async function worker() {
  while (at < queue.length) {
    const p = queue[at++];
    try {
      done[p.full] = check(parse(await ask(prompt(p))));
    } catch (e) {
      failed++;
      process.stderr.write(`FAIL ${p.full}: ${String(e).split("\n")[0].slice(0, 120)}\n`);
    }
    if (at % 10 === 0) {
      save();
      process.stderr.write(`${at}/${queue.length}\n`);
    }
  }
}

await Promise.all([worker(), worker(), worker()]);
save();
process.stdout.write(`${Object.keys(done).length} summaries in ${OUT} (${failed} failed)\n`);
