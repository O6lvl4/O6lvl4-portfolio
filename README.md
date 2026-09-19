# O6lvl4-portfolio

Every public repository under **O6lvl4**, **Aid-On**, **almide**, **almide-graphics**, **almide-ai**
and **almd-mc** — 265 of them — shown one at a time, the way a body of work is shown, in Japanese,
English and Chinese.

O6lvl4 と Aid-On、almide、almide-* の公開リポジトリ265件を、一つずつ見せるポートフォリオです。日本語・英語・中国語。

**Live:** https://o6lvl4.github.io/O6lvl4-portfolio/ ([ja](https://o6lvl4.github.io/O6lvl4-portfolio/ja/) · [en](https://o6lvl4.github.io/O6lvl4-portfolio/en/) · [zh](https://o6lvl4.github.io/O6lvl4-portfolio/zh/))

## What the site does

- **One page, the whole body of work.** Who this is and an instrument panel of the figures, then
  every public repository as a line, the ones put forward as plates, one of them opened in full,
  the figures of the lot, and what it is all written in. The proportions are measured from a real
  portfolio's Layout AST, not guessed.
- **265 lines, read the way you want them.** Filter by org or by language, order by date, commits,
  language or name, and ask for the rest when the first 28 are not enough. The page renders
  complete without JavaScript; the script only narrows and reorders what is already there.
- **Named after Ogma.** The god of eloquence and writing, credited with ogham — an alphabet
  spelled as notches cut along a stem. The rail down the left edge is that stem, reading ᚑᚌᚋᚐ from
  the foot up, with a hairline for each year; the sections are marked ᚁ ᚂ ᚃ ᚄ ᚅ, the ogham letters
  that count one to five.
- **White, obsidian, and one red.** Both themes are complete — OKLCH through `light-dark()`, with a
  toggle that remembers — and the red marks only what is chosen, current or counted. The panels are
  solid instruments on a lit ground: no blur anywhere, because a translucent pane costs a backdrop
  snapshot per frame on a page that scrolls hundreds of lines. Everything Latin is set in JetBrains
  Mono, the face code is written in, with Noto Sans Ogham for the stem and Noto Sans JP and SC for
  Japanese and Chinese — all OFL.
- **Fourteen families, each with its own page.** The work is grouped by what kind of thing it is —
  languages, the standard library, an agent's tools, LLM groundwork, an AITuber's parts, Minecraft,
  drawing, the edge and the web, toolchains, knowledge, public pages, tools at hand, other
  languages, and what was only tried out. A family is a kind of thing and not a place, so `wyve`
  sits with the language work however little Almide is in it, and a sandbox stays a sandbox however
  many commits it has. Every family has its own page with its own figures, years and repositories.
- **Every figure comes from the repositories.** The languages, the commits, the years and the counts
  are measured from the local clones. The year chart is linear and prints each year's number, and
  history shared between repositories is counted once — the page says so in its own footnote.
- **Plates from the projects' own material.** The work opened in full shows its own plate: its site
  as it renders, its command as it answers, or a summary of what its README says it does — taken
  from that README alone, in each of the three languages. Nothing is drawn or mocked up.
- **Three languages.** `/ja/`, `/en/` and `/zh/` are three built pages; the root sends a visitor to
  theirs and links the other two, as does the page itself.

`docs/PROMPT.ui.md` is the brief this interface was generated from; the design it produced (React
+ Tailwind, one page) is ported into uimodulay's `oghma` template — the same faces, palette and
behaviour, rendered from this repository's data in three languages.

## How it is built

The site is fitted together by [uimodulay](https://github.com/O6lvl4/uimodulay)'s `fit`: the content
is this repository's data, the layout's proportions are measured from Layout ASTs, and the look
comes from hand-made patterns and tokens. `docs/FIT.ja.md` in uimodulay describes the method.

```bash
npm install                                        # playwright, sharp, the Claude Agent SDK

node scripts/mine.mjs   > data/repos.json          # read the local clones: README, git, files
node scripts/plan.mjs <repos.tsv> <home.tsv> > data/projects.json   # + what GitHub says
node scripts/summarize.mjs                         # what each README says it does, ja/en/zh
node scripts/plates.mjs                            # a plate per project per language → plates/
for l in ja en zh; do
  node scripts/content.mjs $l > data/content.$l.json   # the content each site is built from
  node scripts/og.mjs $l                               # the share card → og.$l.jpg
done
node scripts/site.mjs                              # → site/{ja,en,zh} (273 pages each) + site/index.html
node ../uimodulay/src/cli.ts fit check site/ja -o check
```

`scripts/summarize.mjs` reads each README and answers in three languages through the local `claude`
login (no tools, one turn per project); the result is kept in `data/summaries.json`, and projects
already there are skipped, so the run can be stopped and picked up again.

`scripts/mine.mjs`, `scripts/summarize.mjs` and `scripts/plates.mjs` read the clones under
`~/workspace/github.com/<org>/<repo>` and run the commands that are installed here, so they only
work on this machine; `site/` is therefore committed, and GitHub Pages only uploads it. `plates/`
is not committed — it is derived.

The two tab-separated inputs to `scripts/plan.mjs` come from the GitHub API:

```bash
gh api users/O6lvl4/repos --paginate \
  -q '.[] | [.full_name, (if .private then "private" else "public" end), (.fork|tostring), (.language // "-"), (.stargazers_count|tostring), (.pushed_at[0:10]), (.description // "")] | @tsv'
gh api users/O6lvl4/repos --paginate \
  -q '.[] | [.full_name, (.homepage // ""), (.license.spdx_id // ""), ((.topics // []) | join(","))] | @tsv'
```

## Layout

```
data/          what the projects are (mined, planned, summarised, and the content per language)
scripts/       how that data and the plates are made
assets/        the avatar, used as the mark and the icon
plates/        a plate per project (derived, not committed): shared/ and one dir per language
site/          the built sites (ja, en, zh) and the root, uploaded by the Pages workflow
og.<lang>.jpg  the share cards
```

## Credits

- **Type:** Shippori Mincho (FONTDASU), Inter (Rasmus Andersson) and JetBrains Mono (JetBrains),
  all under the SIL Open Font License, served by Google Fonts.
- **Patterns:** the way the work is shown comes from
  [hokusai-portfolio](https://github.com/O6lvl4/hokusai-portfolio), which is built on
  [Bridget](https://github.com/Sped0n/bridget) (MIT, © 2023 sped0n).
- **Proportions:** measured from the Layout ASTs of real sites; each template records which page it
  measured and what it read.
- **Everything here:** MIT (`LICENSE`).
