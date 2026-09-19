// Image derivatives for the fitted site: every work at the sizes the patterns ask for, as WebP.
// sharp is an optional dependency, loaded only here.

import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, parse, resolve } from "node:path";
import type { Content } from "./model.ts";

export interface Derived {
  /** path from the site root */
  src: string;
  w: number;
  h: number;
}

export type Size = "th" | "lo" | "cover" | "hi";
/** only the sizes the template's patterns ask for are derived */
export type WorkImages = Partial<Record<Size, Derived>>;

/** width and WebP quality per size: thumbnails, the phone list, chapter covers, the stage */
export const SIZES: Record<Size, { width: number; quality: number }> = {
  th: { width: 480, quality: 74 },
  lo: { width: 640, quality: 72 },
  cover: { width: 900, quality: 80 },
  hi: { width: 2000, quality: 82 },
};

type Sharp = typeof import("sharp");

async function loadSharp(): Promise<Sharp> {
  try {
    return (await import("sharp")).default;
  } catch {
    throw new Error("fit needs sharp for images: npm install sharp");
  }
}

/** A derivative is kept only while it is newer than the work it was made from. */
function stale(source: string, outFile: string): boolean {
  if (!existsSync(outFile)) return true;
  return statSync(source).mtimeMs > statSync(outFile).mtimeMs;
}

async function derive(sharp: Sharp, source: string, outFile: string, size: Size): Promise<Derived & { file: string }> {
  const { width, quality } = SIZES[size];
  if (stale(source, outFile)) {
    mkdirSync(dirname(outFile), { recursive: true });
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(outFile);
  }
  const meta = await sharp(outFile).metadata();
  return { file: outFile, src: "", w: meta.width ?? width, h: meta.height ?? width };
}

interface Job {
  sharp: Sharp;
  sourceRoot: string;
  outDir: string;
  sizes: Size[];
}

async function deriveWork(job: Job, image: string): Promise<WorkImages> {
  const p = parse(image);
  const out: WorkImages = {};
  for (const size of job.sizes) {
    const rel = join("img", p.dir, `${p.name}-${size}.webp`);
    const d = await derive(job.sharp, resolve(job.sourceRoot, image), join(job.outDir, rel), size);
    out[size] = { src: rel.split("\\").join("/"), w: d.w, h: d.h };
  }
  return out;
}

/**
 * Derive every work's images into outDir/img, a few at a time, at the sizes asked for. Existing
 * files are kept, so a rebuild only makes what is missing.
 */
export async function deriveImages(content: Content, sourceRoot: string, outDir: string, sizes: Size[]): Promise<Map<string, WorkImages>> {
  // a work without a picture is allowed: software work is often shown by its words alone
  const images = [...new Set(content.series.flatMap((s) => s.works.map((w) => w.image)))].filter(Boolean);
  if (images.length === 0) return new Map();
  const job: Job = { sharp: await loadSharp(), sourceRoot, outDir, sizes };
  const out = new Map<string, WorkImages>();
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < images.length) {
      const image = images[next++];
      out.set(image, await deriveWork(job, image));
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return out;
}
