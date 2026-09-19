// Geometry from Layout ASTs: each template names the numbers it takes from its reference
// pages, and this reads them off. The template stays the same; a different reference gives
// a different geometry.

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { AstNode, LayoutAst } from "../ast.ts";
import type { Geometry, Measure, Take, Template } from "./model.ts";

interface Step {
  type: string;
  nth: number;
  /** "/Header": a child of the node before, not any descendant */
  direct: boolean;
}

function parseStep(s: string): Step {
  const direct = s.startsWith("/");
  const [type, n] = (direct ? s.slice(1) : s).split("#");
  return { type, nth: n ? Number(n) : 1, direct };
}

function* preorder(n: AstNode): Generator<AstNode> {
  for (const c of n.children ?? []) {
    yield c;
    yield* preorder(c);
  }
}

function descendant(from: AstNode, step: Step): AstNode | undefined {
  let seen = 0;
  const pool = step.direct ? from.children ?? [] : preorder(from);
  for (const n of pool) {
    if (n.type === step.type && ++seen === step.nth) return n;
  }
  return undefined;
}

/**
 * The node at a path like "/Main>List>Item>Image" or "/Nav#2", or undefined; "" is the root.
 * Each step is a descendant of the one before; a leading "/" makes it a direct child.
 */
export function findNode(root: AstNode, path: string): AstNode | undefined {
  if (path === "") return root;
  let at: AstNode | undefined = root;
  for (const step of path.split(">").map(parseStep)) {
    if (!at) return undefined;
    at = descendant(at, step);
  }
  return at;
}

const READ: Record<Take, (n: AstNode, vw: number) => number | undefined> = {
  x: (n) => n.bounds.x,
  y: (n) => n.bounds.y,
  width: (n) => n.bounds.width,
  height: (n) => n.bounds.height,
  right: (n) => n.bounds.x + n.bounds.width,
  rightGap: (n, vw) => vw - (n.bounds.x + n.bounds.width),
  columns: (n) => n.layout?.columns,
  rows: (n) => n.layout?.rows,
  gap: (n) => n.layout?.gap,
  rowGap: (n) => n.layout?.rowGap ?? n.layout?.gap,
  padTop: (n) => n.layout?.padding?.top,
  padRight: (n) => n.layout?.padding?.right,
  padBottom: (n) => n.layout?.padding?.bottom,
  padLeft: (n) => n.layout?.padding?.left,
};

export interface Reading {
  value: number;
  /** "ast" when read off the reference, "fallback" when the node was missing */
  from: "ast" | "fallback";
}

export function readMeasure(ast: LayoutAst | undefined, m: Measure): Reading {
  const node = ast ? findNode(ast.root, m.find) : undefined;
  const v = node && ast ? READ[m.take](node, ast.source.viewport.width) : undefined;
  if (v === undefined || !Number.isFinite(v)) return { value: m.fallback, from: "fallback" };
  return { value: Math.round(v), from: "ast" };
}

/**
 * Load the reference ASTs a template names, keyed by page name. A reference that is not on
 * this machine (a private corpus, say) is left out, and its measures fall back to the values
 * recorded in the template.
 */
export function loadReferences(template: Template, templateFile: string): Map<string, LayoutAst> {
  const out = new Map<string, LayoutAst>();
  for (const r of template.references) {
    const file = resolve(dirname(templateFile), r.ast);
    if (existsSync(file)) out.set(r.page, JSON.parse(readFileSync(file, "utf8")) as LayoutAst);
  }
  return out;
}

export interface Measured {
  geometry: Geometry;
  readings: Record<string, Reading & Measure>;
}

export function measure(template: Template, refs: Map<string, LayoutAst>): Measured {
  const geometry: Geometry = {};
  const readings: Measured["readings"] = {};
  for (const [name, m] of Object.entries(template.measures)) {
    const r = readMeasure(refs.get(m.page), m);
    geometry[name] = r.value;
    readings[name] = { ...m, ...r };
  }
  return { geometry, readings };
}
