// fit — fitting an artist's material into a layout taken from real sites.
//
// Four layers, kept apart on purpose:
//   content   what the site says (works, series, text), independent of any layout
//   template  which regions a page has and in what proportions, measured from Layout ASTs
//   patterns  how each region looks and moves (hand-made parts, reused across templates)
//   tokens    the identity: colour, type, and the few marks that belong to the artist
// The AST decides where things go; it never draws a box itself.

export interface Link {
  label: string;
  href: string;
}

export interface Stat {
  label: string;
  value: string;
}

/** One work: an image and its label. */
export interface Work {
  /** image file, relative to the content root */
  image: string;
  title: string;
  titleEn?: string;
  romaji?: string;
  date?: string;
  format?: string;
  credit?: string;
  /** the holding institution's record */
  url?: string;
  /** an id the landing can name a work by, e.g. "O6lvl4/hew" */
  id?: string;
  /** what it is made of, or what it is about */
  tags?: string[];
  /** figures that belong to the work itself: its size, its history */
  stats?: Stat[];
  /** where the work lives */
  links?: Link[];
  /** keys a list may be sorted by, where the printed form does not sort (e.g. date: "2026-09-19") */
  order?: Record<string, string>;
  /** the work in its own words, for a template that opens one work in full */
  readme?: { lead: string; points?: string[]; code?: { cmd?: string; out: string } };
}

/** A share card: an image relative to the content root, and its alt text. */
export interface Share {
  image: string;
  alt: string;
}

export interface Series {
  /** path segment, e.g. "fuji" */
  id: string;
  title: string;
  /** a shorter name for narrow screens */
  short?: string;
  titleEn?: string;
  period?: string;
  intro?: string;
  share?: Share;
  /** this body of work's own figures, for a template that gives it a page */
  figures?: Figure[];
  /** its own years, measured the same way as the whole */
  years?: Bar[];
  works: Work[];
}

/** A block of the text page. Inline HTML (strong, a) is allowed in `html`. */
export type Block =
  | { kind: "p"; html: string }
  | { kind: "list"; items: { term: string; html: string }[] }
  | { kind: "contact" };

export interface Section {
  heading: string;
  blocks: Block[];
}

/** One period of the maker's own history. */
export interface Period {
  period: string;
  title: string;
  lead?: string;
  tags?: string[];
}

/** A figure of the whole body of work: a number and what it counts. */
export interface Figure {
  value: string;
  label: string;
  /** 0–1, where a template draws the figure as a meter as well as a number */
  fill?: number;
}

/** A bar in a distribution: a name, how many, and optionally its own colour. */
export interface Bar {
  name: string;
  count: number;
  color?: string;
}

/** What the landing page says beside the work itself. */
export interface Landing {
  /** paragraphs, in the maker's own voice */
  about?: string[];
  /** headings and items: what the work is made with */
  stack?: { heading: string; items: string[] }[];
  /** the maker's own history, newest first */
  timeline?: Period[];
  /** work ids to put forward, e.g. ["O6lvl4/hew", "almide/almide"] */
  featured?: string[];
  /** the index a reader can check the whole body against: key, value, and a meter where it helps */
  panel?: { key: string; value: string; fill?: number }[];
  /** the figures of the whole, large */
  figures?: Figure[];
  /** what the work is written in, as a distribution */
  langs?: Bar[];
  /** the commits of each org that holds part of the work, with how many repositories that is */
  orgCommits?: { name: string; count: number; of?: number }[];
  /** where the work lives, as counts — the places, not the kinds */
  orgs?: Bar[];
  /** the years, and how much was done in each */
  years?: Bar[];
}

export interface Content {
  lang: string;
  /** where the site will live, for canonical and share-card URLs; optional */
  baseUrl?: string;
  /** directory the image paths are relative to, itself relative to the content file */
  root: string;
  title: string;
  description: string;
  share: Share;
  /**
   * `avatar` is a picture of the maker, relative to the content root; it replaces the seal.
   * `ogham` is cut along a stem down the rail — the letters, feather marks and all ("᚛ᚑᚌᚋᚐ᚜").
   */
  artist: {
    name: string;
    nameEn?: string;
    life?: string;
    seal?: [string, string];
    role?: string;
    avatar?: string;
    ogham?: { letters: string; reads: string };
  };
  contact?: { instagram?: string; instagramHandle?: string; email?: string };
  /** where else the maker is, shown as named links */
  links?: Link[];
  /** the same site in other languages; the one with an empty href is this one */
  langs?: Link[];
  home: { kicker?: string; lead: string; text?: string; note?: string; description?: string };
  /** the words this body of work is spoken about with; the patterns fall back to art ones */
  labels?: Record<string, string>;
  /**
   * How a series' index is shown, and whether the series page opens on it. A grid of thumbnails
   * suits work you recognise by sight; a list with each work's line suits work you read.
   */
  index?: { style?: "grid" | "list"; first?: boolean };
  /** the landing page's own material, for templates that say more than a cover does */
  landing?: Landing;
  series: Series[];
  about?: { id: string; nav: string; description?: string; sections: Section[]; footnote?: string };
}

// ── templates ─────────────────────────────────────────────────────────────

/** Which number to read off a node of a reference AST. */
export type Take =
  | "x" | "y" | "width" | "height" | "right" | "rightGap"
  | "columns" | "rows" | "gap" | "rowGap" | "padTop" | "padRight" | "padBottom" | "padLeft";

/**
 * A measurement: find a node in one of the reference ASTs and read a number off it.
 * `find` is a path of node types, each a descendant of the one before ("Main>List>Item>Image");
 * `Nav#2` is the second Nav at that step.
 */
export interface Measure {
  page: string;
  find: string;
  take: Take;
  /** used when the reference has no such node */
  fallback: number;
}

export interface Reference {
  /** name used by measures */
  page: string;
  url: string;
  /** Layout AST file, relative to the template file */
  ast: string;
}

/** One kind of page in a template. `each: "series"` makes one per series, `"work"` one per work. */
export interface PageSpec {
  id: string;
  /** output path, with {series} and {work} placeholders ("" is the site root) */
  path: string;
  each?: "series" | "work";
  /** the regions, top to bottom, each drawn by a pattern */
  regions: { type: string; pattern: string }[];
}

export interface Template {
  name: string;
  title: string;
  summary: string;
  references: Reference[];
  measures: Record<string, Measure>;
  /** the content this template can carry */
  needs: { series: [number, number]; worksPerSeries: [number, number] };
  /** what the template is good at, as ranges of content features (each one met scores a point) */
  prefers: { captionFields?: [number, number]; totalWorks?: [number, number]; worksPerSeries?: [number, number] };
  pages: PageSpec[];
}

export type Geometry = Record<string, number>;

// ── tokens ────────────────────────────────────────────────────────────────

export interface FontFace {
  family: string;
  license: string;
  source: string;
}

export interface Tokens {
  name: string;
  title: string;
  /** CSS custom properties without the leading dashes: ground, ink, ink-2, ink-3, rule, accent, seal, seal-ink */
  color: Record<string, string>;
  /** CSS custom properties for font stacks: text, latin */
  font: Record<string, string>;
  /** the stylesheet that serves the faces (Google Fonts), and what each face is licensed under */
  fonts: { href: string; faces: FontFace[] };
}
