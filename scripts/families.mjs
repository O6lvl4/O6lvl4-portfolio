// What kind of thing each repository is — the families the work actually falls into, and the
// order they are shown in. A repository belongs to the first family that claims it, so the rules
// read top to bottom; anything left over lands in `lab`, which is where the trying-things-out
// repositories belong anyway.
//
// A family is a kind of thing, not a place: `wyve` is a language, so it sits with the language
// work however little Almide there is in it, and a sandbox stays a sandbox however many commits
// it has. The names and the introductions are in three languages; the counts and the figures are
// measured, never typed in.

const named = (p, ...names) => names.includes(p.name);
const starts = (p, ...prefixes) => prefixes.some((x) => p.name.startsWith(x));

/** In order. `test` is given a project and decides whether this family claims it. */
export const FAMILIES = [
  {
    id: "almide",
    short: { ja: "言語", en: "Languages", zh: "语言" },
    name: { ja: "言語をつくる", en: "Making languages", zh: "做语言" },
    intro: {
      ja: "静的型付けの言語 Almide 本体と、その周り。規範的な意味論と適合性コーパス（als）、文法の一元管理（almide-grammar）とそこから作るパーサ（parsegen・tree-sitter-almide）、エディタ支援（vscode-almide）、他言語と WASM への書き出し（almide-bindgen・almide-wasm-bindgen・almide-lander）、ドキュメントと playground、そして生成コードが直されても壊れない率を毎日測る場（almide-dojo）。もう一つの言語は wyve — LLVM IR の一層上に静的な意味論を置き、最適化器に契約を書かせるもので、Racket で書いてあります。",
      en: "Almide itself — a statically-typed language — and everything around it: the normative semantics with its conformance corpus (als), one source of truth for the grammar (almide-grammar) and the parsers built from it (parsegen, tree-sitter-almide), editor support (vscode-almide), exports to other languages and to WASM (almide-bindgen, almide-wasm-bindgen, almide-lander), the documentation and the playground, and a ground that measures every day how much generated code survives being modified (almide-dojo). The other language here is wyve: a static semantics one layer above LLVM IR, where the optimizer has to write down its contracts — written in Racket.",
      zh: "静态类型语言 Almide 本体及其周边：规范语义与一致性语料（als）、统一管理的文法（almide-grammar）与由它生成的解析器（parsegen、tree-sitter-almide）、编辑器支持（vscode-almide）、导出到其他语言与 WASM（almide-bindgen、almide-wasm-bindgen、almide-lander）、文档与 playground，以及每天测量生成代码被改动后存活率的场地（almide-dojo）。另一门语言是 wyve：在 LLVM IR 之上一层放置静态语义，让优化器把契约写下来，用 Racket 写成",
    },
    test: (p) =>
      (p.owner === "almide" && !STDLIB.includes(p.name)) ||
      named(p, "tree-sitter-almide", "almide-examples", "almide-dojo", "wyve"),
  },
  {
    id: "stdlib",
    short: { ja: "標準ライブラリ", en: "Stdlib", zh: "标准库" },
    name: { ja: "Almide の標準ライブラリ", en: "Almide's standard library", zh: "Almide 标准库" },
    intro: {
      ja: "言語で書く前に、言語で書けるものを揃える。純 Almide の部品 — 符号化（Base64・CSV・TOML・YAML・SVG）、暗号（AES・RSA・SHA-1）、任意精度整数、正規表現を単一 DFA にまとめるもの、SQLite の窓口。",
      en: "Before writing in the language, the things you write with: pure-Almide parts — encodings (Base64, CSV, TOML, YAML, SVG), ciphers (AES, RSA, SHA-1), arbitrary-precision integers, a set of regular expressions folded into one DFA, and a door to SQLite.",
      zh: "在用这门语言写东西之前，先备好用它写的零件：纯 Almide 实现的编解码（Base64、CSV、TOML、YAML、SVG）、密码学（AES、RSA、SHA-1）、任意精度整数、把多条正则合成单一 DFA 的库，以及 SQLite 接口",
    },
    test: (p) => p.owner === "almide" && STDLIB.includes(p.name),
  },
  {
    id: "agent-tools",
    short: { ja: "エージェントの道具", en: "Agent tools", zh: "智能体工具" },
    name: { ja: "エージェントの道具", en: "Tools for coding agents", zh: "给编码智能体的工具" },
    intro: {
      ja: "モデルがコードを読み、直し、測るための道具。構造で読む hew、構文木をつくる gramide と各言語のパッケージ、質を採点する codopsy、文脈を守る ctxgate、エージェントを閉じ込める porta、証拠に基づいて編集する golemide、主張を出典と照合する emet、複数のエージェントを束ねる ccgrid。どれも自分の作業で毎日使うものから始まっています。",
      en: "What a model needs to read, fix and measure code: hew reads by structure, gramide builds syntax trees with a package per language, codopsy grades quality, ctxgate keeps the context, porta boxes an agent in, golemide edits on evidence, emet checks a claim against its source, ccgrid runs a team of them. Each started as something needed that day.",
      zh: "让模型读代码、改代码、量代码的工具：按结构阅读的 hew、构建语法树的 gramide 及各语言包、给质量评分的 codopsy、守住上下文的 ctxgate、把智能体关进沙箱的 porta、依据证据编辑的 golemide、把主张与出处核对的 emet、把多个智能体编成一队的 ccgrid。每一个都源自当天的实际需要",
    },
    test: (p) =>
      starts(p, "gramide", "codopsy") ||
      named(p, "hew", "ctxgate", "porta", "golemide", "assay", "emet", "ccgrid", "cdev", "ccp", "treesrc", "onomly", "imoduru", "cairn", "onetool"),
  },
  {
    id: "llm",
    short: { ja: "LLM の土台", en: "LLM groundwork", zh: "LLM 基础" },
    name: { ja: "エージェントと LLM の土台", en: "Agents, and groundwork for LLMs", zh: "智能体与 LLM 的基础" },
    intro: {
      ja: "モデルを実際に使うために要るもの。どのプロバイダにも同じ顔で当たる窓口（unillm・almai）と音声入力の窓口（unisttp）、流量を抑える仕組み（llm-throttle・llm-queue-dispatcher）、長文と反復を扱う層（fractop・iteratop・synapser・templex）、記憶（memory-rag・whenm・embersm）、Almide で書いたエージェントの実行環境（homullus）と Mac を操作する手（manus）、端末から複数のモデルを同じ口で叩く CLI（llmine）、そしてモデルそのものを純 Almide で書いて WASM で走らせたもの（bonsai-almide）。",
      en: "What it takes to actually use a model: one door to every provider (unillm, almai) and one for speech (unisttp), ways to hold the flow back (llm-throttle, llm-queue-dispatcher), layers for long text and loops (fractop, iteratop, synapser, templex), memory (memory-rag, whenm, embersm), an agent runtime written in Almide (homullus) with a hand that works a Mac (manus), a CLI that reaches many models through one mouth (llmine), and the model itself written in pure Almide and run as WASM (bonsai-almide).",
      zh: "真正把模型用起来所需要的：对任何供应商都同一张脸的入口（unillm、almai）与语音入口（unisttp）、限流机制（llm-throttle、llm-queue-dispatcher）、处理长文与迭代的层（fractop、iteratop、synapser、templex）、记忆（memory-rag、whenm、embersm）、用 Almide 写的智能体运行时（homullus）与操作 Mac 的手（manus）、在终端用同一个口子调多个模型的 CLI（llmine），以及用纯 Almide 写、跑在 WASM 上的模型本身（bonsai-almide）",
    },
    test: (p) =>
      p.owner === "almide-ai" ||
      starts(p, "unillm", "llm-") ||
      named(p, "llmine", "unisttp", "fractop", "iteratop", "synapser", "templex", "memory-rag", "whenm", "embersm", "fuzztok", "vad"),
  },
  {
    id: "fizz",
    short: { ja: "AITuber", en: "AITuber", zh: "AITuber" },
    name: { ja: "AITuber の部品", en: "The parts of an AITuber", zh: "AITuber 的零件" },
    intro: {
      ja: "AITuber「Fizz」を、ひとつずつ検証できる部品に割ったもの。コメントを読む（取得・重複除去・分類・照合）、返事を組む（persona・記憶 L1〜L3・履歴・文の分割）、体を動かす（口パク・表情・視線・idle・ジェスチャ・VRM リグ）。部品の間をつなぐのは共通のプロトコル（fizz-protocol）で、返事の組み立て全体は fizz-brain-orchestrator が受け持ちます。どれも単一責任の純関数で、Almide で書いてあります。",
      en: "An AITuber, Fizz, cut into parts that can each be checked on their own: reading the comments (sources, dedupe, classify, match), composing a reply (persona, memory L1–L3, history, sentence splitting), and moving the body (lipsync, expression, gaze, idle, gestures, VRM rig). One shared protocol (fizz-protocol) is what the parts speak, and fizz-brain-orchestrator is what composes a reply out of them. Each is a single-purpose pure function, written in Almide.",
      zh: "把 AITuber「Fizz」拆成可以逐个验证的零件：读取评论（来源、去重、分类、匹配）、组织回应（persona、记忆 L1–L3、历史、断句），以及驱动身体（口型、表情、注视、待机、手势、VRM 骨骼）。零件之间说的是同一套协议（fizz-protocol），整条回应的组装交给 fizz-brain-orchestrator。每个都是单一职责的纯函数，用 Almide 写成",
    },
    test: (p) => starts(p, "fizz-") || named(p, "animula"),
  },
  {
    id: "mc",
    short: { ja: "Minecraft", en: "Minecraft", zh: "Minecraft" },
    name: { ja: "Minecraft を Almide で", en: "Minecraft, in Almide", zh: "用 Almide 写 Minecraft" },
    intro: {
      ja: "Minecraft のプロトコルを Almide で下から実装した一式（mc-protocol）。認証、チャンク、NBT、レジストリ、物理、経路探索、インベントリ、PvP、プロキシ、サーバー、そしてボット（mc-bot・craftsman）。node-minecraft-protocol や prismarine の各層を、型のある言語で置き換えていく試みです。",
      en: "Minecraft's protocol implemented in Almide from the bottom up (mc-protocol): authentication, chunks, NBT, the registry, physics, pathfinding, inventory, PvP, a proxy, a server, and bots (mc-bot, craftsman) — replacing the layers of node-minecraft-protocol and prismarine in a typed language.",
      zh: "用 Almide 自底向上实现 Minecraft 协议（mc-protocol）：认证、区块、NBT、注册表、物理、寻路、背包、PvP、代理、服务端，以及机器人（mc-bot、craftsman）——把 node-minecraft-protocol 与 prismarine 的各层用带类型的语言重写",
    },
    test: (p) => p.owner === "almd-mc" || named(p, "craftsman", "mine-rabbit-bots"),
  },
  {
    id: "graphics",
    short: { ja: "描画と数学", en: "Drawing", zh: "绘制" },
    name: { ja: "描画と数学", en: "Drawing, and the maths under it", zh: "绘制与其下的数学" },
    intro: {
      ja: "Almide で絵を描くための層。GPU ネイティブの UI（ceangal）とそのアニメーション（ceangal-anime）、Canvas と WebGL を WASM から叩くもの（obsid）、純粋な数学プリミティブ（lumen）、VRM/glTF のキャラクター層（cruth）とファイルそのものの道具箱（nendo）、ニューラルネットの基本部品（nn）、リバースモード autograd の微分可能プログラミング基盤（slabhra）。",
      en: "The layer for drawing in Almide: a GPU-native UI (ceangal) and its animation engine (ceangal-anime), Canvas and WebGL driven from WASM (obsid), pure maths primitives (lumen), a VRM/glTF character layer (cruth) with a toolkit for the files themselves (nendo), neural-network primitives (nn), and a differentiable-programming base with reverse-mode autograd (slabhra).",
      zh: "在 Almide 里作画的那一层：GPU 原生 UI（ceangal）与它的动画引擎（ceangal-anime）、从 WASM 驱动 Canvas 与 WebGL（obsid）、纯数学基元（lumen）、VRM/glTF 角色层（cruth）与文件本身的工具箱（nendo）、神经网络基本部件（nn），以及带反向模式 autograd 的可微编程基础（slabhra）",
    },
    test: (p) => p.owner === "almide-graphics",
  },
  {
    id: "web",
    short: { ja: "エッジと Web", en: "Edge and web", zh: "边缘与 Web" },
    name: { ja: "エッジと Web の部品", en: "Parts for the edge and the web", zh: "边缘与 Web 的零件" },
    intro: {
      ja: "Cloudflare Workers やブラウザで動く層。ReadableStream を包まずそのままリアクティブにする nagare と、その上の橋渡し（Cloudflare のジョブキューに繋ぐ didoq、Qwik に繋ぐ qwiks）、エッジネイティブな認証（auth・auth-providers-ts）、色トークンとテーマのデザインシステム（design-system・aid-on-ui-system）、知識ベース API のクライアント（outline-api-client-ts）。",
      en: "The layer that runs on Cloudflare Workers and in the browser: nagare, which makes a ReadableStream reactive rather than wrapping it, and the bridges built on it (didoq for Cloudflare's job queues, qwiks for Qwik); edge-native authentication (auth, auth-providers-ts); a design system of colour tokens and themes (design-system, aid-on-ui-system); and a client for a knowledge-base API (outline-api-client-ts).",
      zh: "跑在 Cloudflare Workers 与浏览器上的那一层：不做包装、直接让 ReadableStream 具备反应式能力的 nagare 及其之上的桥接（接 Cloudflare 任务队列的 didoq、接 Qwik 的 qwiks）、边缘原生认证（auth、auth-providers-ts）、色彩令牌与主题的设计系统（design-system、aid-on-ui-system）、知识库 API 客户端（outline-api-client-ts）",
    },
    test: (p) =>
      starts(p, "aid-on-ui", "aid-on-draft", "next-auth", "auth") ||
      named(p, "nagare", "qwiks", "didoq", "design-system", "outline-api-client-ts", "unillm-vercel-ai-sdk", "zod-to-markdown"),
  },
  {
    id: "toolchain",
    short: { ja: "ツールチェーン", en: "Toolchains", zh: "工具链" },
    name: { ja: "言語環境をそろえる", en: "Getting a toolchain in place", zh: "把语言环境准备好" },
    intro: {
      ja: "どの言語の処理系も、要るときに要る版だけ手元にある状態にするもの。cd で一つに収束する重ね合わせ（qusp）、uv 並の速さで Go の版を切り替えるもの（gv）とその土台（anyv-core）、apt も brew も Docker も要らない静的 PHP（php-build-standalone）、そして自分の formula 置き場（homebrew-tap）。",
      en: "Having the right version of every language's toolchain at hand, and only when it is needed: a superposition that collapses on cd (qusp), a Go version manager at uv speed (gv) on the substrate the *v managers share (anyv-core), static PHP binaries that need no apt, brew or Docker (php-build-standalone), and my own tap (homebrew-tap).",
      zh: "让每种语言的工具链在需要时才以需要的版本出现在手边：随 cd 坍缩成一个的叠加态（qusp）、达到 uv 速度的 Go 版本管理器（gv）及 *v 系共用的底座（anyv-core）、不需要 apt/brew/Docker 的静态 PHP（php-build-standalone），以及自己的 formula 仓库（homebrew-tap）",
    },
    test: (p) => starts(p, "homebrew-") || named(p, "qusp", "gv", "anyv-core", "php-build-standalone"),
  },
  {
    id: "knowledge",
    short: { ja: "知識をためる", en: "Knowledge", zh: "知识" },
    name: { ja: "知識をためて忘れない", en: "Keeping what is learnt", zh: "把学到的留住" },
    intro: {
      ja: "読んだことを覚えておくための層。Obsidian の保管庫を Git LFS ごとグラフで見るもの（O6lvl4-knowledge）、markdown の保管庫を SM-2 で復習する CLI（awen）、同じことを macOS のアプリでやるもの（memre）、保管庫を静的な知識ベースに変える Astro 統合（graph-garden）。",
      en: "The layer for remembering what has been read: an Obsidian vault, Git LFS and all, seen as a graph (O6lvl4-knowledge); a CLI that revises a markdown vault by SM-2 (awen); the same thing as a macOS app (memre); and an Astro integration that turns a vault into a static knowledge base (graph-garden).",
      zh: "为了记住读过的东西而做的一层：把 Obsidian 保管库连同 Git LFS 一起以图的方式查看（O6lvl4-knowledge）、用 SM-2 复习 markdown 保管库的 CLI（awen）、把同一件事做成 macOS 应用（memre）、把保管库变成静态知识库的 Astro 集成（graph-garden）",
    },
    test: (p) => named(p, "O6lvl4-knowledge", "awen", "memre", "graph-garden"),
  },
  {
    id: "sites",
    short: { ja: "公開ページ", en: "Pages", zh: "公开页面" },
    name: { ja: "見せるためのページ", en: "Pages made to be looked at", zh: "给人看的页面" },
    intro: {
      ja: "ブラウザで開いて、それで完結するもの。作家のポートフォリオ見本（hokusai-portfolio）と人のポートフォリオ（kotorody-portfolio）、半導体と世界情勢のタイムライン（chip-war-chronicle）、エージェントのベンチを一枚の表にしたもの（agent-bench-matrix）、登壇スライド、体の面倒を見る小さなアプリ（gulp-coach・environment-health-viewer・tabi-navi）、音で遊ぶもの（pitchy・almide-headset-eq）、そして事務のための素の HTML（aid-on-contract-generator・aid-on-invoice-generator・aid-on-tax-calculator）。",
      en: "Things that open in a browser and are finished there: a sample portfolio for an artist (hokusai-portfolio) and one for a person (kotorody-portfolio), a timeline of chips and world affairs (chip-war-chronicle), agent benchmarks gathered into one table (agent-bench-matrix), a talk's slides, small apps that look after a body (gulp-coach, environment-health-viewer, tabi-navi), two that play with sound (pitchy, almide-headset-eq), and plain HTML for paperwork (aid-on-contract-generator, aid-on-invoice-generator, aid-on-tax-calculator).",
      zh: "在浏览器里打开、到此为止的东西：画家作品集样例（hokusai-portfolio）与某人的作品集（kotorody-portfolio）、半导体与世界局势的时间线（chip-war-chronicle）、把智能体基准汇成一张表（agent-bench-matrix）、演讲幻灯片、照看身体的小应用（gulp-coach、environment-health-viewer、tabi-navi）、玩声音的两个（pitchy、almide-headset-eq），以及为文书写的纯 HTML（aid-on-contract-generator、aid-on-invoice-generator、aid-on-tax-calculator）",
    },
    test: (p) =>
      starts(p, "O6lvl4-webnight") ||
      named(p,
        "hokusai-portfolio", "kotorody-portfolio", "chip-war-chronicle", "agent-bench-matrix",
        "gulp-coach", "environment-health-viewer", "tabi-navi", "pitchy", "almide-headset-eq",
        "aid-on-contract-generator", "aid-on-invoice-generator", "aid-on-tax-calculator"),
  },
  {
    id: "tools",
    short: { ja: "手元の道具", en: "Tools at hand", zh: "手边的工具" },
    name: { ja: "手元の道具", en: "Tools at hand", zh: "手边的工具" },
    intro: {
      ja: "毎日の作業のために書いた小さな実行ファイル。書類を片づけるもの（keiri・pdf-burger・resepy・capto・gformiac）、環境と機械を見るもの（netcheck・igloc・syncenv・macleap・dns-checker）、アカウントを切り替えるもの（azprofile・chropen）、書いたものを渡せる形にするもの（pagina・premaid・image-catalog-composer）、供給網への攻撃を早く知るもの（tocsin・tocsin-almd）、UI の構造を Layout AST に起こすもの（uimodulay）、そして自分の作業規約とその適合チェッカー（O6lvl4-protocol・O6lvl4-vitals）。",
      en: "The small binaries written for the day's work: getting paperwork out of the way (keiri, pdf-burger, resepy, capto, gformiac), looking at an environment and a machine (netcheck, igloc, syncenv, macleap, dns-checker), switching accounts (azprofile, chropen), turning what is written into something you can hand over (pagina, premaid, image-catalog-composer), hearing about a supply-chain attack early (tocsin, tocsin-almd), lifting a UI's structure into a Layout AST (uimodulay), and my own working protocol with the checker that grades against it (O6lvl4-protocol, O6lvl4-vitals).",
      zh: "为每天的活儿写的小可执行文件：处理文书（keiri、pdf-burger、resepy、capto、gformiac）、查看环境与机器（netcheck、igloc、syncenv、macleap、dns-checker）、切换账号（azprofile、chropen）、把写好的东西变成能交出去的形态（pagina、premaid、image-catalog-composer）、尽早知道供应链攻击（tocsin、tocsin-almd）、把界面结构提成 Layout AST（uimodulay），以及自己的工作规约与对照它的合规检查器（O6lvl4-protocol、O6lvl4-vitals）",
    },
    test: (p) =>
      starts(p, "O6lvl4-") ||
      named(p,
        "gformiac", "tocsin", "tocsin-almd", "uimodulay", "premaid", "pagina", "image-catalog-composer",
        "resepy", "pdf-burger", "keiri", "ytscribe", "grclone", "igloc", "syncenv", "chropen", "azprofile",
        "capto", "netcheck", "ClipStash", "macleap", "dotfiles", "dns-checker", "connpass-discord-bot"),
  },
  {
    id: "other-langs",
    short: { ja: "他の言語で", en: "Other languages", zh: "别的语言" },
    name: { ja: "他の言語で書く", en: "Writing in other languages", zh: "用别的语言写" },
    intro: {
      ja: "自作言語の外で書いたもの。Lean 4 の定理を TypeScript のプロパティテストに落とすもの（lean2ts）、Lean を Rust に落とすバックエンド（lean4-rust-backend）、その手前の証明の練習（hello-lean4・lean-lang-sandbox・lean4-practice・fizzbuzz-lean4-lib・fizzbuzz-lean4-cli）、Zig の型で消えるゼロコスト関数型ツールキット（zfp）、Ruby の並行境界を OpenTelemetry で覗くもの（sashiko）。",
      en: "Written outside my own language: lean2ts turns Lean 4 theorems into TypeScript property tests, lean4-rust-backend lowers Lean to Rust, and before either of those comes the practice (hello-lean4, lean-lang-sandbox, lean4-practice, fizzbuzz-lean4-lib, fizzbuzz-lean4-cli); zfp is a zero-cost functional toolkit that disappears into Zig's types; sashiko watches Ruby's concurrency boundaries through OpenTelemetry.",
      zh: "在自制语言之外写的东西：把 Lean 4 定理变成 TypeScript 属性测试的 lean2ts、把 Lean 降到 Rust 的后端（lean4-rust-backend）、在这之前的证明练习（hello-lean4、lean-lang-sandbox、lean4-practice、fizzbuzz-lean4-lib、fizzbuzz-lean4-cli）、在 Zig 的类型里消失的零成本函数式工具箱（zfp），以及用 OpenTelemetry 看 Ruby 并发边界的 sashiko",
    },
    test: (p) => starts(p, "lean", "hello-lean", "fizzbuzz-lean") || named(p, "zfp", "sashiko"),
  },
  {
    id: "lab",
    short: { ja: "試したもの", en: "Tried out", zh: "试过的" },
    name: { ja: "試したもの", en: "Things tried out", zh: "试过的东西" },
    intro: {
      ja: "触って、比べて、置いてあるもの。自作言語で鳴らした音（almide-audio-poc）と書いたトレーシング（almide-otel-demo）、Go の版ごとの書き方くらべ（go1.26-vs-go1.27・go1.27-vs-almide）、JavaScript の問題集（aid-on-js-training）、そして言語・フレームワークごとの雛形と習作。捨てずに残してあるのは、次に同じ壁に当たったときの記録として役に立つからです。",
      en: "Touched, compared and left standing: sound made with my own language (almide-audio-poc) and tracing written in it (almide-otel-demo), the way Go reads from version to version (go1.26-vs-go1.27, go1.27-vs-almide), a set of JavaScript exercises (aid-on-js-training), and a template or a study per language and per framework. They are kept because the next time the same wall comes up, the record helps.",
      zh: "碰过、比过、留着的东西：用自制语言发出的声音（almide-audio-poc）与用它写的追踪（almide-otel-demo）、Go 各版本写法的对照（go1.26-vs-go1.27、go1.27-vs-almide）、JavaScript 习题集（aid-on-js-training），以及按语言、按框架留下的模板与练习。留着是因为下次撞到同一面墙时，这些记录有用",
    },
    test: () => true,
  },
];

/** The repositories of `almide` that are its standard library rather than the language itself. */
const STDLIB = ["aes", "base64", "bigint", "csv", "dfa", "rsa", "sha1", "svg", "toml", "yaml", "almide-sqlite"];

/**
 * The two repositories that live under the language's own org but are not the language: a sandbox
 * for agents belongs with the other tools for agents, and a model written in Almide belongs with
 * the rest of the LLM groundwork. Everything else is decided by the rules above, in order.
 */
const ASSIGNED = {
  "almide/porta": "agent-tools",
  "almide/bonsai-almide": "llm",
};

export function familyOf(p) {
  const named = ASSIGNED[p.full];
  if (named) return FAMILIES.find((f) => f.id === named);
  return FAMILIES.find((f) => f.test(p)) ?? FAMILIES[FAMILIES.length - 1];
}
