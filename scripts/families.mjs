// What kind of thing each repository is — the families the work actually falls into, and the
// order they are shown in. A repository belongs to the first family that claims it, so the rules
// read top to bottom; anything left over lands in `lab`, which is where the trying-things-out
// repositories belong anyway.
//
// The names and the introductions are in three languages; the counts and the figures are
// measured, never typed in.

const has = (p, ...words) => words.some((w) => `${p.name} ${p.lead}`.toLowerCase().includes(w));
const named = (p, ...names) => names.includes(p.name);
const starts = (p, ...prefixes) => prefixes.some((x) => p.name.startsWith(x));

/** In order. `test` is given a project and decides whether this family claims it. */
export const FAMILIES = [
  {
    id: "almide",
    short: { ja: "言語", en: "Language", zh: "语言" },
    name: { ja: "言語をつくる", en: "Making a language", zh: "做一门语言" },
    intro: {
      ja: "静的型付けの言語 Almide 本体と、その周り。規範的な意味論と適合性コーパス（als）、文法の一元管理（almide-grammar）とそこから作るパーサ（parsegen・tree-sitter-almide）、エディタ支援（vscode-almide）、他言語と WASM への書き出し（almide-bindgen・almide-wasm-bindgen・almide-lander）、ドキュメントと playground、そして生成コードが直されても壊れない率を毎日測る場（almide-dojo）。",
      en: "Almide itself — a statically-typed language — and everything around it: the normative semantics with its conformance corpus (als), one source of truth for the grammar (almide-grammar) and the parsers built from it (parsegen, tree-sitter-almide), editor support (vscode-almide), exports to other languages and to WASM (almide-bindgen, almide-wasm-bindgen, almide-lander), the documentation and the playground, and a ground that measures every day how much generated code survives being modified (almide-dojo).",
      zh: "静态类型语言 Almide 本体及其周边：规范语义与一致性语料（als）、统一管理的文法（almide-grammar）与由它生成的解析器（parsegen、tree-sitter-almide）、编辑器支持（vscode-almide）、导出到其他语言与 WASM（almide-bindgen、almide-wasm-bindgen、almide-lander）、文档与 playground，以及每天测量生成代码被改动后存活率的场地（almide-dojo）",
    },
    test: (p) =>
      (p.owner === "almide" && !STDLIB.includes(p.name)) ||
      named(p, "tree-sitter-almide", "almide-examples", "almide-audio-poc", "almide-headset-eq", "almide-otel-demo", "go1.27-vs-almide", "almide-dojo", "bonsai-almide"),
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
      named(p, "hew", "ctxgate", "porta", "golemide", "assay", "emet", "ccgrid", "cdev", "ccp", "treesrc", "onomly", "lean4-practice", "imoduru", "cairn"),
  },
  {
    id: "llm",
    short: { ja: "LLM の土台", en: "LLM groundwork", zh: "LLM 基础" },
    name: { ja: "エージェントと LLM の土台", en: "Agents, and groundwork for LLMs", zh: "智能体与 LLM 的基础" },
    intro: {
      ja: "モデルを実際に使うために要るもの。統一の窓口（unillm・almai・unisttp）、流量を抑える仕組み（llm-throttle・llm-queue-dispatcher）、長文と反復を扱う層（fractop・iteratop・synapser・templex）、記憶（memory-rag・whenm・embersm）、Almide で書いたエージェントの実行環境（homullus）、そして端末から複数のモデルを同じ口で叩く CLI（llmine）と、Mac を操作する手。",
      en: "What it takes to actually use a model: one door to many providers (unillm, almai, unisttp), ways to hold the flow back (llm-throttle, llm-queue-dispatcher), layers for long text and loops (fractop, iteratop, synapser, templex), memory (memory-rag, whenm, embersm), an agent runtime written in Almide (homullus), a CLI that reaches many models through one mouth (llmine), and a hand that works a Mac.",
      zh: "真正把模型用起来所需要的：统一入口（unillm、almai、unisttp）、限流机制（llm-throttle、llm-queue-dispatcher）、处理长文与迭代的层（fractop、iteratop、synapser、templex）、记忆（memory-rag、whenm、embersm）、用 Almide 写的智能体运行时（homullus），以及在终端用同一个口子调多个模型的 CLI（llmine）和操作 Mac 的手",
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
    id: "tools",
    short: { ja: "道具とサイト", en: "Tools and sites", zh: "工具与站点" },
    name: { ja: "手元の道具と公開サイト", en: "Tools at hand, and sites in public", zh: "手边的工具与公开站点" },
    intro: {
      ja: "毎日の作業のために書いた小さな実行ファイルと、公開しているページ。環境を整えるもの（gv・qusp・dotfiles・netcheck）、書類を片づけるもの（keiri・pdf-burger・resepy・capto・gformiac）、知識を溜めるもの（O6lvl4-knowledge・awen・memre・graph-garden）、見せるためのサイト（hokusai-portfolio・chip-war-chronicle・agent-bench-matrix・uimodulay）、そして手の届くところに置いた単発のもの（口笛の音程を採る pitchy、ヘッドセットの EQ、供給網への攻撃を早く知る tocsin）。",
      en: "The small binaries written for the day's work, and the pages that are public: setting up an environment (gv, qusp, dotfiles, netcheck), getting paperwork out of the way (keiri, pdf-burger, resepy, capto, gformiac), keeping what is learnt (O6lvl4-knowledge, awen, memre, graph-garden), sites made to be looked at (hokusai-portfolio, chip-war-chronicle, agent-bench-matrix, uimodulay), and the one-offs left within reach (pitchy reads the pitch of a whistle, an EQ for a headset, tocsin watches the supply chain).",
      zh: "为每天的活儿写的小可执行文件，以及公开的页面：搭环境（gv、qusp、dotfiles、netcheck）、处理文书（keiri、pdf-burger、resepy、capto、gformiac）、积累知识（O6lvl4-knowledge、awen、memre、graph-garden）、给人看的站点（hokusai-portfolio、chip-war-chronicle、agent-bench-matrix、uimodulay），以及随手放在近处的一次性小东西（听口哨音高的 pitchy、耳机 EQ、盯供应链攻击的 tocsin）",
    },
    test: (p) =>
      starts(p, "O6lvl4-", "homebrew-") ||
      named(p,
        "gv", "qusp", "anyv-core", "azprofile", "chropen", "syncenv", "igloc", "dotfiles", "netcheck",
        "grclone", "php-build-standalone", "macleap", "ClipStash", "keiri", "pdf-burger", "resepy", "capto",
        "ytscribe", "awen", "memre", "graph-garden", "premaid", "image-catalog-composer", "pagina",
        "hokusai-portfolio", "chip-war-chronicle", "agent-bench-matrix", "uimodulay", "gformiac",
        "environment-health-viewer", "gulp-coach", "tabi-navi", "dns-checker", "kotorody-portfolio",
        "aid-on-contract-generator", "aid-on-invoice-generator", "aid-on-tax-calculator", "connpass-discord-bot"),
  },
  {
    id: "lab",
    short: { ja: "試したもの", en: "Tried out", zh: "试过的" },
    name: { ja: "試したもの", en: "Things tried out", zh: "试过的东西" },
    intro: {
      ja: "他の言語や仕組みを触り、比べ、置いてあるもの。Lean 4 の定理を TypeScript のプロパティテストに落とす lean2ts、Zig のゼロコスト関数型（zfp）、LLVM IR の一層上の意味論言語 wyve、Ruby の並行境界を OpenTelemetry で覗く sashiko、Go の版ごとの書き方くらべ、自作言語で鳴らした音や書いたトレーシング、そして雛形と習作。捨てずに残してあるのは、次に同じ壁に当たったときの記録として役に立つからです。",
      en: "Other languages and other machinery, touched, compared and left standing: lean2ts turns Lean 4 theorems into TypeScript property tests, zfp is a zero-cost functional toolkit for Zig, wyve is a semantics language one layer above LLVM IR, sashiko watches Ruby's concurrency boundaries through OpenTelemetry, there is the way Go reads from version to version, sound and tracing written in my own language, and the templates and exercises. They are kept because the next time the same wall comes up, the record helps.",
      zh: "碰过、比过、留着的其他语言与机制：把 Lean 4 定理变成 TypeScript 属性测试的 lean2ts、Zig 上零成本的函数式工具箱（zfp）、位于 LLVM IR 之上一层的语义语言 wyve、用 OpenTelemetry 看 Ruby 并发边界的 sashiko、Go 各版本写法的对照、用自制语言发出的声音与写的追踪，以及模板与练习。留着是因为下次撞到同一面墙时，这些记录有用",
    },
    test: () => true,
  },
];

/** The repositories of `almide` that are its standard library rather than the language itself. */
const STDLIB = ["aes", "base64", "bigint", "csv", "dfa", "rsa", "sha1", "svg", "toml", "yaml", "almide-sqlite"];

/**
 * The repositories a rule would put in the wrong family, or would not claim at all, named. A tool
 * for agents that happens to live under the language's own org belongs with the other tools, not
 * with the language; a whistle-tuner and a supply-chain alarm are tools at hand, whatever they are
 * written with.
 */
const ASSIGNED = {
  "almide/porta": "agent-tools",
  "O6lvl4/onetool": "agent-tools",
  "O6lvl4/tocsin": "tools",
  "O6lvl4/tocsin-almd": "tools",
  "O6lvl4/pitchy": "tools",
  "O6lvl4/almide-headset-eq": "tools",
  "O6lvl4/lean2ts": "lab",
  "O6lvl4/almide-audio-poc": "lab",
  "O6lvl4/almide-otel-demo": "lab",
  "O6lvl4/go1.27-vs-almide": "lab",
  "almide/bonsai-almide": "lab",
};

export function familyOf(p) {
  const named = ASSIGNED[p.full];
  if (named) return FAMILIES.find((f) => f.id === named);
  return FAMILIES.find((f) => f.test(p)) ?? FAMILIES[FAMILIES.length - 1];
}
