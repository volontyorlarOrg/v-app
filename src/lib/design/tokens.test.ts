import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PALETTE, type PaletteToken } from "./palette";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

const TOKEN_TO_CSS_VARIABLE: Record<PaletteToken, string> = {
  canvas: "--color-canvas",
  surface: "--color-surface",
  surfaceStrong: "--color-surface-strong",
  line: "--color-line",
  lineControl: "--color-line-control",
  ink: "--color-ink",
  inkMuted: "--color-ink-muted",
  knockout: "--color-knockout",
  blue: "--color-blue",
  blueDeep: "--color-blue-deep",
  blueTint: "--color-blue-tint",
  orange: "--color-orange",
  orangeDeep: "--color-orange-deep",
  orangeTint: "--color-orange-tint",
  danger: "--color-danger",
  dangerTint: "--color-danger-tint",
};

function cssValue(variable: string): string | null {
  const match = new RegExp(`${variable}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
  return match ? match[1]!.toUpperCase() : null;
}

describe("stylesheet and palette module agree", () => {
  it.each(Object.entries(TOKEN_TO_CSS_VARIABLE))(
    "%s is defined in globals.css with the same value",
    (token, variable) => {
      expect(cssValue(variable)).toBe(PALETTE[token as PaletteToken].toUpperCase());
    },
  );

  it("defines no colour variable the palette module does not know about", () => {
    const declared = [...css.matchAll(/(--color-[a-z-]+):/g)].map((match) => match[1]!);
    const known = Object.values(TOKEN_TO_CSS_VARIABLE);

    expect(declared.filter((variable) => !known.includes(variable))).toEqual([]);
  });

  it("contains no hard-coded hex outside the token block", () => {
    const themeBlock = /@theme\s*\{[\s\S]*?\n\}/.exec(css)?.[0] ?? "";
    const outside = css.replace(themeBlock, "");

    expect([...outside.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0])).toEqual([]);
  });
});
