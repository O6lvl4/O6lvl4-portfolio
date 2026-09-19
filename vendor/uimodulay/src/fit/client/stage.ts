// Browser side of the stage pattern (inlined as a module script; types are stripped at build).

interface Item {
  hi: string;
  w: number;
  h: number;
  alt: string;
  caption: string;
}

const wrap = document.querySelector<HTMLElement>(".stageWrap");
const dataEl = document.getElementById("fit-works");

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function on<K extends keyof HTMLElementEventMap>(el: Element | Window | null, type: K, fn: (e: HTMLElementEventMap[K]) => void): void {
  el?.addEventListener(type, fn as EventListener);
}

function run(root: HTMLElement, items: Item[]): void {
  const stageEl = root.querySelector<HTMLElement>(".stage");
  const sheet = root.querySelector<HTMLElement>(".catalogue");
  const toIndex = root.querySelector<HTMLButtonElement>(".toIndex");
  const works = Array.from(root.querySelectorAll<HTMLButtonElement>(".work"));
  const imgs = new Map<number, HTMLImageElement>();
  let index = 0;
  let sheetOpen = false;

  const first = stageEl?.querySelector<HTMLImageElement>(".stageImg");
  if (first) imgs.set(0, first);

  function ensure(i: number): HTMLImageElement {
    const have = imgs.get(i);
    if (have) return have;
    const it = items[i];
    const img = new Image(it.w, it.h);
    img.className = "stageImg";
    img.alt = it.alt;
    img.decoding = "async";
    img.src = it.hi;
    stageEl?.append(img);
    imgs.set(i, img);
    return img;
  }

  function reveal(img: HTMLImageElement): void {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("on");
      return;
    }
    img.addEventListener("load", () => img.classList.add("fade", "on"), { once: true });
    img.addEventListener("error", () => img.classList.add("on"), { once: true });
  }

  function label(i: number): void {
    const plate = root.querySelector(".plate");
    const old = plate?.querySelector(".caption");
    if (old) {
      const t = document.createElement("template");
      t.innerHTML = items[i].caption.trim();
      old.replaceWith(t.content);
    }
    const now = root.querySelector(".counter .now");
    if (now) now.textContent = pad(i + 1);
    const fill = root.querySelector<HTMLElement>(".counter .fill");
    if (fill) fill.style.width = `${((i + 1) / items.length) * 100}%`;
    works.forEach((b, j) => (j === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  }

  function show(i: number): void {
    if (i === index) return;
    imgs.get(index)?.classList.remove("on", "fade", "enter");
    index = i;
    reveal(ensure(i));
    ensure((i + 1) % items.length);
    ensure((i - 1 + items.length) % items.length);
    label(i);
  }

  function step(stride: number): void {
    if (sheetOpen) return;
    show((index + stride + items.length) % items.length);
  }

  function setSheet(open: boolean, moveFocus = true): void {
    if (!sheet) return;
    sheetOpen = open;
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    toIndex?.setAttribute("aria-expanded", String(open));
    if (!moveFocus) return;
    if (open) works[index]?.focus({ preventScroll: true });
    else toIndex?.focus({ preventScroll: true });
  }

  // controls
  root.querySelectorAll<HTMLElement>("[data-step]").forEach((el) => on(el, "click", () => step(Number(el.dataset.step))));
  on(toIndex, "click", () => setSheet(true));
  on(root.querySelector(".catClose"), "click", () => setSheet(false));
  works.forEach((b) =>
    on(b, "click", () => {
      show(Number(b.dataset.index));
      setSheet(false);
    }),
  );
  on(window, "keydown", (e) => {
    if (e.key === "Escape" && sheetOpen) setSheet(false);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });
  if (sheet) sheet.hidden = false;
  // a body of many works opens on its index: the list first, then one work at a time
  if (root.dataset.indexFirst === "true") requestAnimationFrame(() => setSheet(true, false));

  sortList(root);
  cursor(root);
  enter(root, first);
  ensure(1 % items.length);
  ensure(items.length - 1);
  phone(root);
}

/**
 * The list can be read in any order: a heading orders by its own column, and pressing it again
 * turns the order around. The rows keep their numbers, so a work stays the same work.
 */
function sortList(root: HTMLElement): void {
  const found = root.querySelector<HTMLElement>(".catList");
  const heads = Array.from(root.querySelectorAll<HTMLButtonElement>(".catSortBtn"));
  if (!found || heads.length === 0) return;
  const list = found;
  const rows = Array.from(list.children) as HTMLElement[];
  const no = (li: HTMLElement): number => Number(li.dataset.no);
  let active = "no";
  let dir = 1;

  function key(li: HTMLElement, name: string): string {
    return li.dataset[name] ?? "";
  }

  function order(name: string): void {
    dir = name === active ? -dir : 1;
    active = name;
    const cmp = (a: HTMLElement, b: HTMLElement): number =>
      dir * (name === "no" ? no(a) - no(b) : key(a, name).localeCompare(key(b, name), undefined, { numeric: true }) || no(a) - no(b));
    rows.slice().sort(cmp).forEach((li) => list.append(li));
    heads.forEach((h) => {
      const on = h.dataset.sort === name;
      h.setAttribute("aria-pressed", String(on));
      if (on) h.dataset.dir = dir > 0 ? "up" : "down";
      else delete h.dataset.dir;
    });
    list.scrollIntoView({ block: "nearest" });
  }

  heads.forEach((h) => on(h, "click", () => order(h.dataset.sort ?? "no")));
}

/** The label that follows the pointer over either half of the work. */
function cursor(root: HTMLElement): void {
  const tag = root.querySelector<HTMLElement>(".cursorLabel");
  if (!tag) return;
  root.querySelectorAll<HTMLElement>(".half").forEach((half) => {
    on(half, "mousemove", (e) => {
      tag.textContent = half.dataset.label ?? "";
      tag.style.left = `${e.clientX}px`;
      tag.style.top = `${e.clientY}px`;
      tag.classList.add("show");
    });
    on(half, "mouseleave", () => tag.classList.remove("show"));
  });
}

/** The first work grows into place once it has loaded. */
function enter(root: HTMLElement, first: HTMLImageElement | null | undefined): void {
  const go = (): void => {
    first?.classList.add("enter");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("ready")));
  };
  if (!first || (first.complete && first.naturalWidth > 0)) go();
  else {
    first.addEventListener("load", go, { once: true });
    first.addEventListener("error", go, { once: true });
  }
}

/** Phones: a tap on a work in the stack opens the viewer at that work. */
function phone(root: HTMLElement): void {
  const viewer = root.querySelector<HTMLElement>(".viewer");
  const track = root.querySelector<HTMLElement>(".viewerTrack");
  const now = root.querySelector(".galleryCount .now");
  if (!viewer || !track) return;
  const close = (): void => {
    viewer.hidden = true;
    document.body.classList.remove("locked");
  };
  root.querySelectorAll<HTMLButtonElement>(".cItem").forEach((b) =>
    on(b, "click", () => {
      viewer.hidden = false;
      document.body.classList.add("locked");
      track.scrollTo({ left: Number(b.dataset.index) * track.clientWidth, behavior: "instant" });
      if (now) now.textContent = pad(Number(b.dataset.index) + 1);
    }),
  );
  on(track, "scroll", () => {
    if (now) now.textContent = pad(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) + 1);
  });
  on(root.querySelector(".viewerClose"), "click", close);
  on(window, "keydown", (e) => {
    if (e.key === "Escape" && !viewer.hidden) close();
  });
}

if (wrap && dataEl?.textContent) run(wrap, JSON.parse(dataEl.textContent) as Item[]);

export {};
