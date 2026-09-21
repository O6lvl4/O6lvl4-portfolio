// The words the site is written in, one set per language: what each label says, how a date is
// written, what each org is, and the paragraphs of the entry and the notes. Everything else in
// the content is measured from the repositories themselves.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const TEXT = {
  ja: {
    role: "開発の道具を、言語からつくる。",
    lead: "Almideと、コードを書く人やエージェントのための道具を開発しています。",
    nameEn: "PUBLIC WORK",
    kicker: (n) => `公開リポジトリ ${n} 件`,
    description: () => `必要な道具を、言語からつくるプログラマーです。静的型付け言語 Almide を設計し、その上でコードを読む道具からエージェントの実行環境までつくっています。`,
    note: (n) => `公開リポジトリ ${n} 件を並べた頁です。各プロジェクトの図版は、作者が設定したプレビュー画像・そのサイトの画面・コマンドの出力・README の要約から作りました。`,
    labels: {
      prev: "前のプロジェクト", next: "次のプロジェクト", index: "一覧", close: "閉じる", unit: "件",
      sortBy: "並べ替え", colNo: "No.", colTitle: "名前", colLead: "できること", colFormat: "言語", colDate: "更新",
      sort_date: "更新順", sort_commits: "コミット順", sort_format: "言語順", sort_name: "名前順",
      all: "すべて", object: "代表作", showcase: "代表作", overview: "全体", points: "できること", source: "ソースコード", docs: "ドキュメント",
      topics: "話題", links: "行き先", output: "出力", unitShort: "リポジトリ", langsShort: "言語",
      language: "言語", sections: "この頁の節", theme: "配色", light: "明るく", dark: "暗く",
      skip: "本文へ", panel: "索引", status: "更新中",
      families: "系統", open: "開く", allFamilies: "系統の一覧へ",
      catalogue: "すべて", groups: "org", more: "順に見る", showMore: "残りを見る",
      about: "これまで", work: "つくったもの", orgs: "org", stack: "言語ごとのリポジトリ", history: "年表",
      byYear: "年ごとのコミット", byOrg: "org ごとのコミット", breakdown: "何を書いてきたか",
      allWorks: "全部を一覧で見る", home: "プロフィールへ",
      briefLead: "系統ごとに、いちばん手を入れているものを一つずつ。残りは一覧で見られます。",
      listLead: "言語をつくり、その上に道具を重ねる。開発ツールからAIの基盤、小さな実験まで、これまでにつくってきたものをまとめました。気になる分野からご覧ください。",
    },
    stats: { commits: "コミット", first: "初回", tag: "版", stars: "星" },
    links: { repo: "リポジトリ", site: "サイト" },
    figures: { repos: "公開リポジトリ", commits: "コミット", langs: "言語", years: "年", span: "期間" },
    panel: {
      handle: "名前", orgs: "org", first: "最初のコミット", last: "直近の更新",
      repos: "公開リポジトリ", commits: "コミット合計", house: "Almide で書いた割合",
      thisYear: (y) => `${y}年のコミット`,
    },
    stack: ["よく書く言語", "そのほか"],
    started: (n) => `${n}件を始めた`,
    andMore: (n) => ` ほか${n}件`,
    date: (iso) => `${iso.slice(0, 4)}年${Number(iso.slice(5, 7))}月`,
    orgs: {
      "O6lvl4": "手元の道具。コードを読む・測る・直すための小さな実行ファイルと、言語まわりの部品。",
      "almide": "Almide — 静的型付けの言語本体（Rust）と、仕様・文法・エディタ支援・実行環境。",
      "almide-graphics": "Almide で絵を描くための層。数学、描画時、UI、VRM/glTF、微分可能プログラミング。",
      "almide-ai": "Almide で書いたエージェント。CLI 実行環境、LLM クライアント、Mac を操作する手。",
      "almd-mc": "Almide で Minecraft のプロトコルを実装した一式。認証、チャンク、NBT、ボット。",
      "Aid-On": "Aid-On での仕事。LLM を使うための土台（流量制御、統一インターフェース、記憶、ストリーム）と AITuber の部品。",
    },
    about: () => [
      "静的型付け言語 Almide を設計・開発しています。Rustによる言語本体の実装から、標準ライブラリ、エディタ支援、実行環境まで。言語を使える形にするところまで取り組んでいます。",
      "つくった言語を、自分の開発にも使います。構文木を扱うgramide、コードを構造で読むhew、エージェントを隔離して動かすporta。実際に使う道具をつくりながら、言語とツールの両方を磨いています。",
    ],
    profile: {
      "role": "言語と開発ツールの設計・実装",
      "highlights": [
        {
          "value": "Rust",
          "label": "コンパイラ実装"
        },
        {
          "value": "Almide",
          "label": "言語・ツール開発"
        },
        {
          "value": "AI",
          "label": "エージェント基盤"
        }
      ],
      "rows": [
        {
          "key": "中心となる開発",
          "value": "Almide — 静的型付け言語"
        },
        {
          "key": "取り組む範囲",
          "value": "言語設計から、日々使う道具まで"
        },
        {
          "key": "コードを扱う",
          "value": "gramide / hew / codopsy"
        },
        {
          "key": "実行を支える",
          "value": "porta / LLMの基盤"
        },
        {
          "key": "設計と実装",
          "value": "仕様・文法・標準ライブラリ・実行環境"
        }
      ]
    },
    aboutPage: {
      nav: "開発で取り組んでいること",
      description: "言語・開発ツール・AIの実行基盤。",
      sections: () => [
        { heading: "言語から道具まで", text: "言語の実装から、その言語で使う道具までをつくっています。Almideを中心に、構文解析・コードの読み書き・エージェントの実行環境を開発しています。" },
        { heading: "コードを読む道具", text: "Almideで、構文木をつくるgramideと、関数や型を指定してコードを読めるhewを開発しています。コーディングエージェントが必要なコードを取り出すための道具です。" },
        { heading: "AIを動かす土台", text: "エージェントが道具を使うための接続や実行制御、LLMを使うための流量制御・記憶・ストリーム処理など、アプリケーションを支える部分もつくっています。" },
      ],
      footnote: "数値（コミット数・初回・言語）は手元の clone から測ったものです。コミットは著者日で数え、リポジトリ間で共有している履歴は一度だけ数えています（マージも1件として含みます）。",
    },
  },
  en: {
    role: "Building developer tools, from the language up.",
    lead: "I build Almide and tools for the people and agents writing code.",
    nameEn: "PUBLIC WORK",
    kicker: (n) => `${n} public repositories`,
    description: () => `I build the tools I work with, starting with the language itself — Almide, and the code readers, agent runtimes and LLM groundwork that run on it.`,
    note: (n) => `${n} public repositories, side by side. Each plate is drawn from the project itself: the preview its author set for it, its site as it renders, its command as it answers, or what its README says it does.`,
    labels: {
      prev: "Previous", next: "Next", index: "Index", close: "Close", unit: " repos",
      sortBy: "Sort", colNo: "No.", colTitle: "Name", colLead: "What it does", colFormat: "Language", colDate: "Updated",
      sort_date: "Recent", sort_commits: "Commits", sort_format: "Language", sort_name: "Name",
      all: "All", object: "One in full", showcase: "Selected work", overview: "Overview", points: "What it does", source: "Source code", docs: "Documentation",
      topics: "Topics", links: "Links", output: "Output", unitShort: "repos", langsShort: "langs",
      language: "Language", sections: "Page sections", theme: "Colour scheme", light: "Light", dark: "Dark",
      skip: "Skip to content", panel: "Profile · Index", status: "Active",
      families: "Families", open: "Open", allFamilies: "All families",
      catalogue: "All", groups: "Orgs", more: "See them one at a time", showMore: "Show the rest",
      about: "About", work: "Work", orgs: "Org", stack: "Repositories by language", history: "Timeline",
      byYear: "Commits by year", byOrg: "Commits by org", breakdown: "What I have written",
      allWorks: "See the whole list", home: "Profile",
      briefLead: "One from each family, the one most worked on. The rest are in the list.",
      listLead: "A language, the tools built on it, and the experiments along the way. Explore my work in developer tools, AI infrastructure and more, starting with a field that interests you.",
    },
    stats: { commits: "Commits", first: "Started", tag: "Release", stars: "Stars" },
    links: { repo: "Repository", site: "Site" },
    figures: { repos: "Repositories", commits: "Commits", langs: "Languages", years: "Years", span: "Span" },
    panel: {
      handle: "Handle", orgs: "Orgs", first: "First commit", last: "Last touched",
      repos: "Public repos", commits: "Commits total", house: "Written in Almide",
      thisYear: (y) => `Commits in ${y}`,
    },
    stack: ["Most written", "Also"],
    started: (n) => `${n} started`,
    andMore: (n) => ` and ${n} more`,
    date: (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`,
    orgs: {
      "O6lvl4": "The tools at hand: small binaries for reading, measuring and fixing code, and the parts of a language toolchain.",
      "almide": "Almide — the statically-typed language itself (in Rust), with its specification, grammar, editor support and runtimes.",
      "almide-graphics": "The layer for drawing in Almide: maths, a graphics runtime, UI, VRM/glTF, and differentiable programming.",
      "almide-ai": "Agents written in Almide: a CLI runtime, an LLM client, and a hand that works a Mac.",
      "almd-mc": "Minecraft's protocol implemented in Almide: authentication, chunks, NBT, and a bot.",
      "Aid-On": "Work at Aid-On: groundwork for using LLMs (rate limiting, one interface, memory, streams) and the parts of an AITuber.",
    },
    about: () => [
      "I design and develop Almide, a statically typed language. My work spans the implementation in Rust, the standard library, editor support and runtimes: the pieces that make a language usable.",
      "I use that language in my own development: gramide for syntax trees, hew for reading code by structure, and porta for running agents in isolation. Building tools I use helps me refine both the language and its tools.",
    ],
    profile: {
      "role": "Language & developer tooling",
      "highlights": [
        {
          "value": "Rust",
          "label": "Compiler implementation"
        },
        {
          "value": "Almide",
          "label": "Language & tools"
        },
        {
          "value": "AI",
          "label": "Agent infrastructure"
        }
      ],
      "rows": [
        {
          "key": "Core project",
          "value": "Almide — a statically typed language"
        },
        {
          "key": "Scope",
          "value": "From language design to everyday tools"
        },
        {
          "key": "Code tooling",
          "value": "gramide / hew / codopsy"
        },
        {
          "key": "Execution",
          "value": "porta / LLM infrastructure"
        },
        {
          "key": "Design & build",
          "value": "Specification, grammar, library, runtimes"
        }
      ]
    },
    aboutPage: {
      nav: "What I work on",
      description: "Languages, developer tools and infrastructure for AI.",
      sections: () => [
        { heading: "From language to tools", text: "I build both a language and the tools used with it. Around Almide, I develop syntax analysis, tools for reading and editing code, and agent runtimes." },
        { heading: "Tools for reading code", text: "In Almide, I build gramide for constructing syntax trees and hew for reading code by named functions and types. These tools help coding agents retrieve the code they need." },
        { heading: "Infrastructure for AI", text: "I also build the foundations applications rely on: tool connections and execution controls for agents, and rate limiting, memory and stream processing for LLMs." },
      ],
      footnote: "The figures — commits, first commit, languages — are measured from the clones. Commits are counted by author date, history shared between repositories is counted once, and a merge counts as one commit.",
    },
  },
  zh: {
    role: "从语言开始，构建开发工具。",
    lead: "我开发Almide，以及供开发者和编程智能体使用的工具。",
    nameEn: "PUBLIC WORK",
    kicker: (n) => `公开仓库 ${n} 个`,
    description: () => `需要的工具，我从语言开始造。设计静态类型语言 Almide，并在它之上构建读代码的工具、智能体的运行环境和 LLM 的底层设施。`,
    note: (n) => `这一页并列了 ${n} 个公开仓库。每个图版都取自项目本身：作者设置的预览图、站点的画面、命令的输出，或 README 的摘要。`,
    labels: {
      prev: "上一个", next: "下一个", index: "总览", close: "关闭", unit: " 个",
      sortBy: "排序", colNo: "No.", colTitle: "名称", colLead: "功能", colFormat: "语言", colDate: "更新",
      sort_date: "按更新", sort_commits: "按提交", sort_format: "按语言", sort_name: "按名称",
      all: "全部", object: "详看一件", showcase: "代表作品", overview: "总体", points: "功能", source: "源代码", docs: "文档",
      topics: "话题", links: "去处", output: "输出", unitShort: "仓库", langsShort: "语言",
      language: "语言", sections: "本页各节", theme: "配色", light: "浅色", dark: "深色",
      skip: "跳到正文", panel: "索引", status: "更新中",
      families: "系列", open: "打开", allFamilies: "全部系列",
      catalogue: "全部", groups: "组织", more: "逐一浏览", showMore: "显示其余",
      about: "关于", work: "作品", orgs: "org", stack: "各语言的仓库数", history: "年表",
      byYear: "各年提交", byOrg: "各 org 的提交", breakdown: "写过些什么",
      allWorks: "查看完整列表", home: "个人介绍",
      briefLead: "每个系列各取一个：最常动手的那个。其余都在列表里。",
      listLead: "创造语言，再用它构建工具。从开发工具、AI基础设施到小型实验，这里汇集了我一路做过的项目。从感兴趣的领域开始浏览吧。",
    },
    stats: { commits: "提交", first: "首次", tag: "版本", stars: "星标" },
    links: { repo: "仓库", site: "站点" },
    figures: { repos: "公开仓库", commits: "提交", langs: "语言", years: "年数", span: "年份" },
    panel: {
      handle: "名号", orgs: "组织", first: "首次提交", last: "最近更新",
      repos: "公开仓库", commits: "提交总数", house: "用 Almide 写的比例",
      thisYear: (y) => `${y} 年的提交`,
    },
    stack: ["常写的语言", "其他"],
    started: (n) => `开始了 ${n} 个`,
    andMore: (n) => ` 等 ${n} 个`,
    date: (iso) => `${iso.slice(0, 4)}年${Number(iso.slice(5, 7))}月`,
    orgs: {
      "O6lvl4": "手边的工具：读代码、量代码、改代码的小程序，以及语言工具链的零件。",
      "almide": "Almide — 静态类型语言本体（Rust），及其规范、语法、编辑器支持与运行时。",
      "almide-graphics": "用 Almide 作画的一层：数学、绘图运行时、UI、VRM/glTF、可微编程。",
      "almide-ai": "用 Almide 写的智能体：CLI 运行时、LLM 客户端，以及操作 Mac 的手。",
      "almd-mc": "用 Almide 实现的 Minecraft 协议：认证、区块、NBT 与机器人。",
      "Aid-On": "在 Aid-On 的工作：使用 LLM 的基础设施（限流、统一接口、记忆、流）与 AITuber 的零件。",
    },
    about: () => [
      "我设计并开发静态类型语言Almide。从用Rust实现语言本体，到标准库、编辑器支持与运行时，构建让语言真正可用的各个部分。",
      "也把这门语言用于自己的开发：处理语法树的gramide、按结构读取代码的hew，以及隔离运行智能体的porta。在构建实际使用的工具时，持续打磨语言与工具。",
    ],
    profile: {
      "role": "语言与开发工具的设计及实现",
      "highlights": [
        {
          "value": "Rust",
          "label": "编译器实现"
        },
        {
          "value": "Almide",
          "label": "语言与工具"
        },
        {
          "value": "AI",
          "label": "智能体基础设施"
        }
      ],
      "rows": [
        {
          "key": "核心项目",
          "value": "Almide — 静态类型语言"
        },
        {
          "key": "开发范围",
          "value": "从语言设计到日常工具"
        },
        {
          "key": "代码工具",
          "value": "gramide / hew / codopsy"
        },
        {
          "key": "执行支持",
          "value": "porta / LLM基础设施"
        },
        {
          "key": "设计与实现",
          "value": "规范、语法、标准库、运行时"
        }
      ]
    },
    aboutPage: {
      nav: "开发方向",
      description: "语言、开发工具与AI基础设施。",
      sections: () => [
        { heading: "从语言到工具", text: "既开发语言，也开发使用这门语言的工具。围绕Almide，构建语法分析、代码读写工具与智能体运行环境。" },
        { heading: "阅读代码的工具", text: "用Almide开发构建语法树的gramide，以及按函数和类型名称读取代码的hew。这些工具帮助编程智能体提取所需的代码。" },
        { heading: "AI基础设施", text: "也开发支撑应用的基础部分：智能体的工具连接与执行控制，以及LLM的限流、记忆和流式处理。" },
      ],
      footnote: "提交数、首次提交、语言等数字，均由本地克隆测得。提交按作者日期计数，仓库之间共享的历史只计一次，合并提交计为一次。",
    },
  },
};
