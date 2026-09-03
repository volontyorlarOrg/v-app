import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const DARK_START = CSS.indexOf(':root[data-theme="dark"]');
const DARK_CSS = CSS.slice(DARK_START, CSS.indexOf("}", DARK_START));

function tokenIn(source: string, name: string): string | null {
  const match = source.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`));
  return match?.[1] ?? null;
}

function token(name: string): string {
  const value = tokenIn(CSS, name);
  if (!value) throw new Error(`Missing design token --color-${name}`);
  return value;
}

function darkToken(name: string): string {
  return tokenIn(DARK_CSS, name) ?? token(name);
}

function relativeLuminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high = 0, low = 0] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (high + 0.05) / (low + 0.05);
}

const AA_TEXT = 4.5;
const AA_LARGE = 3;

const SURFACES = ["paper", "surface", "surface-sunk", "surface-soft"];
const TEXT_TOKENS = ["ink", "ink-muted", "primary-ink", "accent-ink"];
const GRAPHICS_TOKENS = ["primary", "accent"];
const SOLID_FILLS = [
  "action",
  "action-hover",
  "band",
  "primary-deep",
  "accent-ink",
  "ink",
];
const HUE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["primary", "accent"],
  ["primary", "accent-ink"],
  ["primary-ink", "accent"],
  ["primary-ink", "accent-ink"],
  ["action", "accent"],
];
const LIGHT_HUE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ...HUE_PAIRS,
  ["primary-deep", "accent"],
];

describe("brand values match the marketing site's design system", () => {
  it.each([
    ["primary", "#007fc2"],
    ["primary-ink", "#005e92"],
    ["accent", "#e85d30"],
    ["accent-ink", "#b34917"],
    ["ink", "#222b33"],
    ["knockout", "#ffffff"],
  ])("%s is %s", (name, value) => {
    expect(token(name)).toBe(value);
  });

  it("fills actions and the band with the text-safe blue in the light theme", () => {
    expect(token("action")).toBe(token("primary-ink"));
    expect(token("band")).toBe(token("primary-ink"));
  });
});

describe("text tokens meet AA on every light surface", () => {
  it.each(TEXT_TOKENS)("%s", (foreground) => {
    for (const surface of SURFACES) {
      expect(
        contrast(token(foreground), token(surface)),
        `${foreground} on ${surface}`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

describe("graphics tokens clear 3:1 but are not usable for body text", () => {
  it.each(GRAPHICS_TOKENS)("%s", (foreground) => {
    for (const surface of SURFACES) {
      expect(
        contrast(token(foreground), token(surface)),
        `${foreground} on ${surface}`,
      ).toBeGreaterThanOrEqual(AA_LARGE);
    }
    expect(contrast(token(foreground), token("paper"))).toBeLessThan(AA_TEXT);
  });
});

describe("knockout labels on solid fills", () => {
  it.each(SOLID_FILLS)("white on %s", (background) => {
    expect(contrast(token("knockout"), token(background))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it("keeps secondary copy on the band legible", () => {
    expect(contrast(token("band-copy"), token("band"))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("keeps the inverse button legible at rest and on hover", () => {
    expect(contrast(token("action"), token("knockout"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
    expect(
      contrast(token("primary-deep"), token("primary-muted")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe("the two hues must never be combined", () => {
  it.each(LIGHT_HUE_PAIRS)(
    "%s and %s are too close to sit on each other",
    (blue, orange) => {
      expect(contrast(token(blue), token(orange))).toBeLessThan(AA_LARGE);
    },
  );
});

describe("structural tokens", () => {
  it("gives interactive borders a visible 3:1 boundary", () => {
    expect(contrast(token("border-control"), token("paper"))).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
  });

  it("defines no red, which would be indistinguishable from accent-ink", () => {
    expect(CSS).not.toMatch(/--color-destructive|--color-danger/);
  });
});

describe("the dark theme", () => {
  it("is switched by a data attribute, so the same tokens carry both themes", () => {
    expect(DARK_START).toBeGreaterThan(0);
    expect(DARK_CSS).toMatch(/color-scheme:\s*dark/);
  });

  it("turns the page ground near-black rather than blue", () => {
    expect(relativeLuminance(darkToken("paper"))).toBeLessThan(0.01);
    expect(relativeLuminance(darkToken("band"))).toBeLessThan(0.03);
  });

  it.each(TEXT_TOKENS)("%s meets AA on every dark surface", (foreground) => {
    for (const surface of SURFACES) {
      expect(
        contrast(darkToken(foreground), darkToken(surface)),
        `${foreground} on ${surface}`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it.each(GRAPHICS_TOKENS)("%s clears 3:1 on every dark surface", (foreground) => {
    for (const surface of SURFACES) {
      expect(
        contrast(darkToken(foreground), darkToken(surface)),
        `${foreground} on ${surface}`,
      ).toBeGreaterThanOrEqual(AA_LARGE);
    }
  });

  it.each(["action", "action-hover", "band"])(
    "keeps white labels legible on %s",
    (fill) => {
      expect(contrast(darkToken("knockout"), darkToken(fill))).toBeGreaterThanOrEqual(
        AA_TEXT,
      );
    },
  );

  it("keeps band copy, the inverse button and control borders legible", () => {
    expect(contrast(darkToken("band-copy"), darkToken("band"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
    expect(contrast(darkToken("action"), darkToken("knockout"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
    expect(
      contrast(darkToken("primary-deep"), darkToken("primary-muted")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
    expect(
      contrast(darkToken("border-control"), darkToken("paper")),
    ).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it.each(HUE_PAIRS)("keeps %s and %s too close to combine", (blue, orange) => {
    expect(contrast(darkToken(blue), darkToken(orange))).toBeLessThan(AA_LARGE);
  });
});
