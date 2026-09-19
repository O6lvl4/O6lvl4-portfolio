// Every pattern a template can name.

import type { Pattern } from "../page.ts";
import { brandBar, sectionNav, siteFooter, workView, worksGrid } from "./catalogue.ts";
import { essay } from "./essay.ts";
import { rail, seriesNav } from "./frame.ts";
import { leadChapters } from "./landing.ts";
import { oghmaFamily } from "./oghma-family.ts";
import { oghmaList } from "./oghma-list.ts";
import { oghmaPage } from "./oghma.ts";
import { stage } from "./stage.ts";
import { profileHero } from "./swe.ts";

const ALL: Pattern[] = [rail, seriesNav, leadChapters, stage, essay, brandBar, sectionNav, worksGrid, workView, siteFooter, profileHero, oghmaPage, oghmaFamily, oghmaList];

export const PATTERNS = new Map(ALL.map((p) => [p.name, p]));

export function pattern(name: string): Pattern {
  const p = PATTERNS.get(name);
  if (!p) throw new Error(`unknown pattern "${name}" (have: ${[...PATTERNS.keys()].join(", ")})`);
  return p;
}
