import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CSS = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const LAYOUT = readFileSync(join(ROOT, "src/app/[locale]/layout.tsx"), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

function offenders(pattern: RegExp): string[] {
  return sourceFiles(join(ROOT, "src")).flatMap((file) =>
    pattern.test(readFileSync(file, "utf8")) ? [file.replace(`${ROOT}/`, "")] : [],
  );
}

describe("typography", () => {
  it("sets the whole interface in one family", () => {
    expect(CSS).toMatch(/--font-sans:\s*var\(--font-inter\)/);
    expect(CSS).not.toMatch(/--font-serif|--font-onest/);
    expect(offenders(/Source_Serif_4|font-serif/)).toEqual([]);
  });

  it("loads Inter with its optical sizes and the scripts all three languages need", () => {
    expect(LAYOUT).toMatch(/axes:\s*\["opsz"\]/);
    expect(LAYOUT).toMatch(/subsets:\s*\["latin", "latin-ext", "cyrillic"\]/);
  });

  it("gives headings their weight from the base layer", () => {
    const base = CSS.slice(CSS.indexOf("  h1 {"), CSS.indexOf(".lucide"));
    expect(base).toMatch(/h1 \{\s*font-weight:\s*600/);
    expect(base).toMatch(/h2 \{\s*font-weight:\s*600/);
    expect(base).toMatch(/h3 \{\s*font-weight:\s*500/);
  });

  it("uses three weights and never bold", () => {
    expect(offenders(/\bfont-(bold|extrabold|black|light|thin)\b/)).toEqual([]);
    expect(CSS).not.toMatch(/font-weight:\s*(700|800|900)/);
  });

  it("writes no label in capitals, because Uzbek and Russian read badly that way", () => {
    expect(offenders(/\buppercase\b/)).toEqual([]);
    expect(CSS).not.toMatch(/text-transform:\s*uppercase/);
  });

  it("never spreads letters apart", () => {
    expect(offenders(/tracking-\[0\.\d+em\]/)).toEqual([]);
    expect(CSS).not.toMatch(/letter-spacing:\s*0\.\d+em/);
  });

  it("keeps a figure's digits aligned", () => {
    const figure = CSS.slice(CSS.indexOf(".figure {"));
    expect(figure.slice(0, figure.indexOf("}"))).toContain("tabular-nums");
  });

  it("uses no literal hex colour outside the token block", () => {
    expect(offenders(/#[0-9a-fA-F]{6}\b/)).toEqual([]);
  });
});

describe("corners in components", () => {
  it("uses no radius above the scale", () => {
    expect(offenders(/\brounded-(2xl|3xl|4xl)\b/)).toEqual([]);
  });

  it("does not build a button as a pill", () => {
    const button = readFileSync(join(ROOT, "src/components/ui/button.tsx"), "utf8");
    expect(button).not.toContain("rounded-full");
    expect(button).toContain("rounded-md");
  });
});

describe("colour in components", () => {
  it("does not spell a token that no longer exists", () => {
    expect(
      offenders(
        /\b(?:bg|text|border|fill|stroke|ring|outline)-(?:shell|band|primary-ink|primary-deep|primary-muted)\b/,
      ),
    ).toEqual([]);
  });
});
