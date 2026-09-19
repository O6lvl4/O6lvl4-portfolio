# UI 自動生成に渡すプロンプト

`data/content.<lang>.json`（ja / en / zh）を材料に、オグマ（ogham）を主題とした画面を作らせるための指示書。
以下の `---` の間をそのまま貼る。日本語版が必要なら言ってください（いまは生成器向けに英語）。

---

## ROLE

You are the design lead for a software engineer's public portfolio. You produce the complete,
production-ready front end: layout, type, colour, motion, and the code that renders it from a
given JSON file. Make deliberate, specific choices; no templates, no placeholder text.

## SUBJECT

`O6lvl4` — a person who builds a statically-typed programming language (**Almide**) and writes
their own tools in it (a code reader, a syntax-tree engine, a code-quality meter, an agent
sandbox). The site shows **265 public repositories** across six GitHub owners — `O6lvl4`,
`almide`, `almide-graphics`, `almide-ai`, `almd-mc`, `Aid-On` — in **three languages**
(Japanese, English, Simplified Chinese). Every figure and every plate comes from the real
repositories; nothing is invented.

## THE THEME — OGMA, AND OGHAM AS THE STRUCTURAL SYSTEM

The handle comes from **Ogma**, the Irish god of eloquence and writing, credited with **ogham**:
an alphabet spelled as **notches cut across a stem**, carved on standing stones and read **from
the foot of the stone upward**. This is not decoration — it is the page's organising system,
because the subject is a person who makes a language.

Use it exactly like this, and nowhere else:

1. **The stem is the layout's left edge.** A fixed vertical rail (92px at 1440px) runs the full
   height of every page but the landing. The maker's name sits in it, set vertically. Below the
   name: the avatar, then the maker's name cut in ogham — the literal string `᚛ᚑᚌᚋᚐ᚜` (OGMA,
   between the feather marks that open and close an inscription), set in **Noto Sans Ogham** with
   `writing-mode: vertical-rl; writing-mode: sideways-lr;` (the second reads foot-up where
   supported, the first is the fallback), `aria-hidden` with a `title` of `ogma`.
2. **Section headings are counted in notches.** Ogham counts a letter with one to five strokes
   (B L F S N). Each section of the landing page opens with a stem — a 38px hairline in the accent
   colour — carrying **as many notches as that section's position on the page** (1st section: one
   notch, 5th: five). The notch count is information, not ornament.
3. **A year on the timeline is one stroke across the stem.** A 2px × 10px accent stroke before
   each year.
4. **Nothing else gets the ogham treatment.** No ogham in body copy except where a sentence quotes
   the letters themselves (give that span the ogham face, 1.2em). No rune-like display type, no
   Celtic knots, no stone textures, no fantasy.

## THE REGISTER — SCIENCE FICTION, 2026, AT ITS BEST

The feeling to hit: **an instrument panel cut in stone.** Precision, telemetry, hairlines, numbers
that line up, a single red index mark — the way a scientific instrument or a spacecraft panel is
laid out, executed with the restraint of a carved inscription. Cold, exact, quiet, expensive.

- **Data reads like readout.** Monospace for identifiers, counts, dates and commands, always
  `font-variant-numeric: tabular-nums`; uppercase letter-spaced micro-labels (11–12px, 0.14em).
- **Hairlines, not cards.** 1px rules in a stone grey do the separating. Spend a border, a fill or
  a shadow only where one object must be lifted; do not stamp a radius and a shadow on every block.
- **One accent, used as an index mark.** The red marks what is chosen, current, or counted —
  nothing else. No second accent.
- **Motion is mechanical, short and optional.** 160–450ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`. The
  ogham stem may etch itself once on first paint (SVG `stroke-dashoffset`, 700ms). Cross-page
  moves use the View Transitions API. Everything respects `prefers-reduced-motion: reduce`.
- **Current platform, used where it earns its place**: OKLCH colours with `light-dark()`,
  `@property`-typed custom properties, container queries for the cards and the list, scroll-driven
  animation for the reading progress of a long list, `@starting-style` for the index sheet,
  `text-wrap: balance` on headings and `pretty` on body, `popover` + anchor positioning for the
  sort menu, `content-visibility: auto` on long lists, `field-sizing: content` on any input.
  Never let a page depend on one of these to be legible.
- **Two themes, both designed.** Light is the default: a white ground, cut-stone ink. Dark is
  obsidian: the same layout in a near-black ground with chalk ink and the same red, which reads as
  an instrument at night. Define the whole palette as tokens on `:root`, redefine only the tokens
  under `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])` and
  again under `:root[data-theme="dark"]`, and give `body` an explicit token background.

**Do not** produce: neon cyan/magenta cyberpunk, purple-to-blue gradient heroes, glassmorphism,
blurred blobs, glowing borders, scanlines, matrix rain, HUD brackets around everything, emoji as
section markers, a full-viewport hero that pushes the content out of the first screen, centred
everything, `rounded-lg` on every element, Inter or Space Grotesk as the safe face, lorem ipsum.

## TOKENS

```css
:root {
  /* light — white ground, cut-stone ink, one ochre red */
  --ground: #ffffff;
  --ink: #131311;
  --ink-2: #57544c;
  --ink-3: #9a958a;
  --rule: #e2dfd7;
  --accent: #c0102a;
  /* dark — obsidian ground, chalk ink, the same red raised to hold on black */
  --ground-dark: #0d0d0c;
  --ink-dark: #edeae3;
  --ink-2-dark: #a9a49a;
  --ink-3-dark: #6d6960;
  --rule-dark: #2a2926;
  --accent-dark: #e4243c;
}
```

Convert these to OKLCH in the output and keep the hex as a comment. The neutrals are warm-biased
on purpose (stone, not screen grey); do not "correct" them to pure grey.

Faces — all SIL OFL, loaded from Google Fonts in one request, each with a real fallback stack:

```
https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600&family=Cinzel:wght@400;600&family=M+PLUS+2:wght@400;500;700&family=Noto+Sans+Ogham&family=Noto+Sans+SC:wght@400;500&family=Share+Tech+Mono&display=swap
```

| role | family | used for |
|---|---|---|
| name | **Cinzel** | the maker's name only — Roman inscriptional capitals, letters made to be carved |
| ogham | **Noto Sans Ogham** | the stem in the rail, and letters quoted inside a line |
| latin | **Chakra Petch** | micro-labels, column headings, figures |
| text | **M PLUS 2** + **Noto Sans SC** | all words, in all three languages |
| mono | **Share Tech Mono** | repository names, commands, terminal output, counts |

## GRID — MEASURED, NOT GUESSED

These come from the Layout AST of a real portfolio at a 1440px reference width. Keep the ratios
when the viewport differs; do not invent new proportions.

```
reference width 1440   rail 92   header 88   gutter 46   content-left 138
content 1280   profile column 561   main column 607   column gap 16
gap between sections 143   gap between items 48   caption plate height 156
essay: label column 180, text column 540 starting at x 382
```

Layout: the rail is fixed at the left; a fixed header bar (88px) carries the six owners as tabs
plus the language switcher, on one line, never wrapping (let it scroll sideways instead). The
landing is two columns: a sticky profile on the left, the reading column on the right. Phone
(≤767px): the rail folds into a 56px top bar, one column, 20px gutters.

## PAGES AND BEHAVIOUR

1. **Landing** (`/<lang>/`): sticky profile — avatar, name (Cinzel, 40px), role, one lead line,
   in-page section links, outbound links, language switcher — beside five sections, each opened by
   its notch count: **about** (2–3 paragraphs), **work** (3 featured projects as a 168px plate +
   name + one line + language tags), **orgs** (six rows: name, count, one line), **stack** (two
   rows: most-written languages with counts, then the rest), **timeline** (newest year first, each
   with what was started that year).
2. **Owner page** (`/<lang>/<owner>/`): **opens on the list, not on an image.** A full-width sheet
   over the stage: the owner's name, its count, its one-line intro, a close button, then a
   sortable list — one row per repository:
   `No. | name (mono) | what it does | language | last updated`.
   The column headings order the list: **name**, **language**, **date**, and **No.** restores the
   given order; pressing the same heading again reverses it, and the active heading shows an
   accent ↑/↓ while the others show a faint ↕. **The numbers belong to the repositories, not to
   the rows** — sorting never renumbers. Rows are reordered in the DOM so tab order follows what
   is seen. Headings stick to the top of the sheet while you read down. Picking a row closes the
   sheet onto that repository on the stage. Below 1240px the "what it does" column drops to its
   own line under the name and the columns stay aligned.
3. **The stage** (behind the sheet): one repository's plate, large, between the sheet and a caption
   plate exactly 156px tall carrying owner, name, one line, date and language, a counter
   (`01 / 29`), a progress stem, and previous / index / next. Arrow keys, a click on either half
   of the image (with a label following the cursor), or the buttons move through the set; Escape
   closes the sheet. On a phone the works stack and a tap opens a full-screen viewer.
4. **Repository page** (`/<lang>/<owner>/<nn>/`): the plate, then its caption with the tags, the
   figures (commits, first commit, release, stars) and the links (repository, site). Previous and
   next a key away.
5. **About** (`/<lang>/about/`): a label column and a 540px text column — four sections: the name
   (Ogma and ogham, quoting `ᚑᚌᚋᚐ` in the ogham face), what is covered, where the plates come
   from, how the page is built — and a footnote.
6. **Root** (`/`): sends a visitor to their language by `navigator.language`, links the other two,
   and works without JavaScript.

## DATA CONTRACT

One JSON file per language drives everything. Render from it; never hard-code copy. Shape (abridged
— a real `data/content.ja.json` accompanies this brief):

```json
{
  "lang": "ja",
  "title": "O6lvl4",
  "description": "…",
  "root": "..",
  "share": { "image": "og.ja.jpg", "alt": "…" },
  "artist": {
    "name": "O6lvl4", "nameEn": "PUBLIC WORK", "life": "265 repos",
    "role": "言語と、その周りの道具をつくる",
    "avatar": "assets/avatar.png",
    "ogham": { "letters": "᚛ᚑᚌᚋᚐ᚜", "reads": "ogma" }
  },
  "home": { "kicker": "公開リポジトリ 265 件", "lead": "…", "note": "…", "description": "…" },
  "index": { "style": "list", "first": true },
  "labels": {
    "prev": "前のプロジェクト", "next": "次のプロジェクト", "index": "一覧", "close": "閉じる",
    "unit": "件", "sortBy": "並べ替え",
    "colNo": "No.", "colTitle": "名前", "colLead": "できること", "colFormat": "言語", "colDate": "更新",
    "about": "これまで", "work": "仕事", "orgs": "置き場所", "stack": "道具", "history": "年表"
  },
  "langs": [ { "label": "日本語", "href": "" }, { "label": "English", "href": "../en/" }, { "label": "中文", "href": "../zh/" } ],
  "links": [ { "label": "GitHub", "href": "https://github.com/O6lvl4" } ],
  "landing": {
    "about": ["…", "…", "…"],
    "stack": [ { "heading": "よく書く言語", "items": ["Almide（136）", "JavaScript（74）"] } ],
    "timeline": [ { "period": "2026年", "title": "211件を始めた", "lead": "almide、porta、als ほか207件", "tags": ["Rust", "Almide"] } ],
    "featured": ["almide/almide", "O6lvl4/gramide", "almide/porta"]
  },
  "series": [
    { "id": "almide", "title": "almide", "short": "almide", "intro": "Almide — 静的型付けの言語本体（Rust）と、仕様・文法・エディタ支援・実行環境。",
      "works": [
        { "image": "plates/shared/almide/almide.jpg",
          "id": "almide/almide", "title": "almide",
          "titleEn": "LLMによる編集後も動くコードを目指す静的型付け言語",
          "date": "2026年9月", "format": "Rust", "credit": "github.com/almide/almide",
          "url": "https://github.com/almide/almide",
          "tags": ["Rust", "Almide", "Shell", "code-generation"],
          "stats": [ { "label": "コミット", "value": "8502" }, { "label": "初回", "value": "2026年9月" },
                     { "label": "版", "value": "v0.63.0-rc1" }, { "label": "星", "value": "34" } ],
          "links": [ { "label": "リポジトリ", "href": "…" }, { "label": "サイト", "href": "…" } ],
          "order": { "date": "2026-09-13" } }
      ] }
  ],
  "about": { "id": "about", "nav": "この頁について", "description": "…",
             "sections": [ { "heading": "名前", "blocks": [ { "kind": "p", "html": "…<span class=\"cut\">ᚑᚌᚋᚐ</span>…" } ] } ],
             "footnote": "…" }
}
```

Rules the data implies: `order.date` sorts, the printed `date` does not. `index.style` picks a list
or a thumbnail grid; `index.first` opens the page on it. An empty `href` in `langs` is the current
language. `html` in an about block may carry `<a>`, `<strong>` and `<span class="cut">`.

## IMAGES

Every repository has one plate (1200×750, 8:5): the project's own site as it renders, its command's
real output on a near-black terminal, or a card summarising what its README says it does. Serve
WebP at 480 / 640 / 2000 with `srcset`, `width`/`height` always set, `loading="lazy"` and
`decoding="async"` off the first screen, `fetchpriority="high"` on the first plate. Alt text names
the repository and what the plate shows.

## ACCESSIBILITY AND BUDGET

Semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`); one `h1` per page; every control a
real `button` or `a` with a visible focus ring that is not only colour; the sort headings report
state with `aria-pressed`; the index sheet is a labelled region that Escape closes and that returns
focus to the button that opened it; contrast ≥ 4.5:1 for body text and ≥ 3:1 for the micro-labels,
in **both** themes. No layout shift (CLS 0), no horizontal page scroll at any width from 320px up,
first screen under 150KB of CSS+JS, no framework needed for a page to render its content.

## DELIVERABLE

A self-contained, static front end: semantic HTML, one stylesheet of hand-written CSS (custom
properties, no utility framework), and a small amount of vanilla ES modules for the list sorting,
the sheet, the stage and the language root. It must render meaningfully with JavaScript disabled.
Ship the landing page, one owner page with its list, one repository page and the about page, all
bound to the JSON above.

## ACCEPTANCE CHECKS

1. The ogham stem is real ogham text in the rail, vertical, foot-up where the browser allows it.
2. Section notches count 1…5 down the landing page and match each section's position.
3. The list sorts by name, language and date, reverses on a second press, keeps the repositories'
   own numbers, and moves focus order with the rows.
4. Both themes are complete and legible, and `body` paints its own background.
5. Nothing on the page is purple, glassy, glowing, or emoji-labelled.
6. At 390px wide: no horizontal scroll, the header on one scrollable line, the summary under the
   name, every control reachable.

---

## 補足（貼らなくてよい部分）

- 生成器に渡す材料は `data/content.ja.json`（+ `en` / `zh`）と `plates/` の図版。図版は実物なので、
  生成器に作らせないこと。
- 寸法は `../uimodulay/fit/templates/swe.json` を実測した値。比率を変えたいときはその数字を書き換える。
- いまの実装（比較用）: `site/ja/` 以下、トークンは `../uimodulay/fit/tokens/ogma.json`。
