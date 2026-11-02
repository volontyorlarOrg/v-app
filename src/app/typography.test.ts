import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CSS = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

describe("typography", () => {
  it("declares a display serif alongside the interface sans", () => {
    expect(CSS).toMatch(/--font-sans:\s*var\(--font-onest\)/);
    expect(CSS).toMatch(/--font-serif:\s*var\(--font-source-serif\)/);
  });

  it("gives headings the serif at regular weight without a class", () => {
    const base = CSS.slice(CSS.indexOf("h1,"), CSS.indexOf("::selection"));
    expect(base).toContain(".display-face");
    expect(base).toContain("--font-serif");
    expect(base).toMatch(/font-weight:\s*400/);
  });

  it("never sets the display faces bold, which would undo the register", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(join(ROOT, "src"))) {
      const source = readFileSync(file, "utf8");
      for (const [line] of source.matchAll(
        /^.*(text-display|text-headline|text-figure|display-face|greeting-display).*$/gm,
      )) {
        if (/font-bold|font-extrabold|font-black/.test(line)) {
          offenders.push(`${file.replace(`${ROOT}/`, "")}: ${line.trim()}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps the display scale ahead of the body scale", () => {
    const size = (token: string) => {
      const match = CSS.match(new RegExp(`--text-${token}:\\s*clamp\\(([^,]+),`));
      if (!match?.[1]) throw new Error(`no --text-${token} in globals.css`);
      return Number.parseFloat(match[1]);
    };
    expect(size("display")).toBeGreaterThan(size("headline"));
    expect(size("headline")).toBeGreaterThan(size("lead"));
    expect(size("figure")).toBeGreaterThan(size("lead"));
  });

  it("uses no literal hex colour outside the token block", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(join(ROOT, "src"))) {
      const source = readFileSync(file, "utf8");
      if (/#[0-9a-fA-F]{6}\b/.test(source))
        offenders.push(file.replace(`${ROOT}/`, ""));
    }
    expect(offenders).toEqual([]);
  });
});
