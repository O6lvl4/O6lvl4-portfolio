// Browser side of the oghma page: the colour scheme, which section you are in, and the list —
// filtered by org and by language, ordered by any of its columns. The page is complete without
// this file; everything here only narrows or reorders what is already rendered.

const root = document.documentElement;

function on<K extends keyof HTMLElementEventMap>(el: Element | Window | null, type: K, fn: (e: HTMLElementEventMap[K]) => void): void {
  el?.addEventListener(type, fn as EventListener);
}

/** The reader's choice of scheme, kept per browser; `auto` follows the system and stores nothing. */
function theme(): void {
  const btns = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-theme-set]"));
  if (btns.length === 0) return;

  const show = (mode: string): void => {
    if (mode === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    btns.forEach((b) => {
      const on = b.dataset.themeSet === mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  };

  let saved = "auto";
  try {
    saved = localStorage.getItem("fit-theme") ?? "auto";
  } catch {
    saved = "auto";
  }
  show(saved);

  btns.forEach((b) =>
    on(b, "click", () => {
      const want = b.dataset.themeSet ?? "auto";
      const next = root.getAttribute("data-theme") === want ? "auto" : want;
      show(next);
      try {
        if (next === "auto") localStorage.removeItem("fit-theme");
        else localStorage.setItem("fit-theme", next);
      } catch {
        /* a browser that refuses storage still gets the change it asked for */
      }
    }),
  );
}

/** Which section the reader is in, marked in the header. */
function spy(): void {
  // Only the anchors: one of the bar's links goes to a page of its own and has no section here.
  const pairs = Array.from(document.querySelectorAll<HTMLAnchorElement>(".hdr-nav a"))
    .filter((a) => a.hash.length > 1)
    .map((a) => ({ a, s: document.querySelector<HTMLElement>(a.hash) }))
    .filter((p): p is { a: HTMLAnchorElement; s: HTMLElement } => Boolean(p.s));
  const links = pairs.map((p) => p.a);
  const sections = pairs.map((p) => p.s);
  if (sections.length === 0) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = sections.indexOf(e.target as HTMLElement);
        links.forEach((a, j) => (j === i ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
      }),
    { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
  );
  sections.forEach((s) => io.observe(s));
}

interface Row {
  el: HTMLElement;
  org: string;
  lang: string;
  name: string;
  date: string;
  commits: number;
  rank: number;
}

interface List {
  box: HTMLElement;
  rows: Row[];
  org: string;
  lang: string;
  sort: string;
}

function readRows(box: HTMLElement): Row[] {
  return Array.from(box.children).map((el) => {
    const e = el as HTMLElement;
    return {
      el: e,
      org: e.dataset.org ?? "",
      lang: e.dataset.lang ?? "",
      name: e.dataset.name ?? "",
      date: e.dataset.date ?? "",
      commits: Number(e.dataset.commits ?? 0),
      rank: Number(e.dataset.rank ?? 0),
    };
  });
}

function compare(a: Row, b: Row, sort: string): number {
  if (sort === "commits") return b.commits - a.commits;
  if (sort === "name") return a.name.localeCompare(b.name, undefined, { numeric: true });
  if (sort === "format") return a.lang.localeCompare(b.lang) || b.commits - a.commits;
  return b.date.localeCompare(a.date) || a.rank - b.rank;
}

function press(group: string, key: string, value: string): void {
  document.querySelectorAll<HTMLButtonElement>(`[data-${group}]`).forEach((b) => {
    const on = (b.dataset[key] ?? "") === value;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
}

function apply(list: List): void {
  const keep = list.rows.filter((r) => (!list.org || r.org === list.org) && (!list.lang || r.lang === list.lang));
  keep.sort((a, b) => compare(a, b, list.sort));
  keep.forEach((r) => list.box.append(r.el));
  list.rows.forEach((r) => (r.el.hidden = true));
  keep.forEach((r) => (r.el.hidden = false));

  const count = document.querySelector("#works .section-count");
  if (count) count.textContent = `${keep.length} / ${list.rows.length}`;
}

function listing(): void {
  const box = document.querySelector<HTMLElement>(".repo-list");
  // The front page shows one line per family and no controls; there is nothing to narrow there.
  if (!box || !document.querySelector(".works-toolbar")) return;
  const list: List = { box, rows: readRows(box), org: "", lang: "", sort: "date" };
  apply(list);

  document.querySelectorAll<HTMLButtonElement>("[data-org]").forEach((b) =>
    on(b, "click", () => {
      list.org = list.org === b.dataset.org ? "" : (b.dataset.org ?? "");
      press("org", "org", list.org);
      apply(list);
    }),
  );
  document.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((b) =>
    on(b, "click", () => {
      list.lang = list.lang === b.dataset.lang ? "" : (b.dataset.lang ?? "");
      press("lang", "lang", list.lang);
      apply(list);
    }),
  );
  document.querySelectorAll<HTMLButtonElement>("[data-sort]").forEach((b) =>
    on(b, "click", () => {
      list.sort = b.dataset.sort ?? "date";
      press("sort", "sort", list.sort);
      apply(list);
    }),
  );
}

theme();
spy();
listing();

export {};
