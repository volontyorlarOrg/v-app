import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const DARK_START = CSS.indexOf(':root[data-theme="dark"]');
const DARK_CSS = CSS.slice(DARK_START, CSS.indexOf("}", DARK_START));
const BODY_START = CSS.indexOf("\n  body {");
const BODY_CSS = CSS.slice(BODY_START, CSS.indexOf("}", BODY_START));

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

function channels(hex: string): [number, number, number] {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((offset) =>
    parseInt(hex.slice(offset, offset + 2), 16),
  );
  return [r, g, b];
}

function relativeLuminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = channels(hex).map((channel) => {
    const value = channel / 255;
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

function hue(hex: string): number {
  const [r = 0, g = 0, b = 0] = channels(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  const raw =
    max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return ((raw * 60) % 360 + 360) % 360;
}

function isWarm(hex: string): boolean {
  const [r, g, b] = channels(hex);
  return r >= g && g >= b;
}

const AA_TEXT = 4.5;
const AA_LARGE = 3;
const BLUE_HUE: readonly [number, number] = [195, 225];

const SURFACES = [
  "paper",
  "surface",
  "surface-raised",
  "surface-sunk",
  "surface-soft",
  "accent-soft",
];
const TEXT_TOKENS = ["ink", "ink-muted", "primary-ink", "accent-ink"];
const GRAPHICS_TOKENS = ["primary", "brand"];
const BLUE_TOKENS = [
  "brand",
  "primary",
  "primary-ink",
  "primary-deep",
  "primary-muted",
  "accent",
  "accent-ink",
  "accent-soft",
];
const LIGHT_NEUTRALS = [
  "paper",
  "surface-sunk",
  "ink",
  "ink-muted",
  "border",
  "border-control",
  "band-copy",
];
const DARK_NEUTRALS = [
  "paper",
  "surface",
  "surface-raised",
  "surface-sunk",
  "ink",
  "ink-muted",
  "border",
  "border-control",
];

describe("the register matches the marketing site: ivory paper, near-black ink, one blue", () => {
  it("keeps the mark on its documented brand blue in both themes", () => {
    expect(token("brand")).toBe("#007fc2");
    expect(darkToken("brand")).toBe("#007fc2");
  });

  it("grounds the light theme on warm ivory and sets type in near-black", () => {
    expect(token("paper")).toBe("#faf9f5");
    expect(token("ink")).toBe("#141413");
    expect(token("knockout")).toBe(token("paper"));
  });

  it("fills the primary button and the bands with ink in the light theme", () => {
    expect(token("action")).toBe(token("ink"));
    expect(token("band")).toBe(token("ink"));
    expect(token("ink-inverse")).toBe(token("paper"));
  });

  it("inverts the primary button with the theme", () => {
    expect(darkToken("action")).toBe(token("paper"));
    expect(darkToken("ink-inverse")).toBe(token("ink"));
  });

  it("uses one text-sized blue whichever name reaches for it", () => {
    expect(token("accent-ink")).toBe(token("primary-ink"));
    expect(darkToken("accent-ink")).toBe(darkToken("primary-ink"));
  });

  it.each(BLUE_TOKENS)("%s is blue in both themes", (name) => {
    for (const value of [token(name), darkToken(name)]) {
      const angle = hue(value);
      expect(angle, `${name} ${value}`).toBeGreaterThanOrEqual(BLUE_HUE[0]);
      expect(angle, `${name} ${value}`).toBeLessThanOrEqual(BLUE_HUE[1]);
    }
  });

  it.each(LIGHT_NEUTRALS)("%s is a warm neutral in the light theme", (name) => {
    expect(isWarm(token(name)), token(name)).toBe(true);
  });

  it.each(DARK_NEUTRALS)("%s is a warm neutral in the dark theme", (name) => {
    expect(isWarm(darkToken(name)), darkToken(name)).toBe(true);
  });

  it("defines no second hue and no red", () => {
    expect(CSS).not.toMatch(/--color-destructive|--color-danger|--color-orange/);
  });

  it("paints a flat ground with no grid or wash", () => {
    expect(CSS).not.toMatch(/--board-dot|--board-wash|workspace-backdrop/);
    expect(BODY_CSS).not.toMatch(/background-image|gradient/);
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

describe("labels on solid fills", () => {
  it.each(["action", "action-hover", "ink"])("ink-inverse on %s", (background) => {
    expect(contrast(token("ink-inverse"), token(background))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it.each(["band", "accent", "primary-deep"])("knockout on %s", (background) => {
    expect(contrast(token("knockout"), token(background))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it("keeps secondary copy on the band legible", () => {
    expect(contrast(token("band-copy"), token("band"))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("keeps the inverse button legible at rest and on hover", () => {
    expect(contrast(token("band"), token("knockout"))).toBeGreaterThanOrEqual(AA_TEXT);
    expect(
      contrast(token("primary-deep"), token("primary-muted")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("makes the accent fill visible against the page and the panels", () => {
    expect(contrast(token("accent"), token("paper"))).toBeGreaterThanOrEqual(AA_LARGE);
    expect(contrast(token("accent"), token("surface"))).toBeGreaterThanOrEqual(AA_LARGE);
  });
});

describe("structural tokens", () => {
  it("gives interactive borders a visible 3:1 boundary", () => {
    expect(contrast(token("border-control"), token("paper"))).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
  });

  it("keeps the hairline quieter than the control border", () => {
    expect(contrast(token("border"), token("paper"))).toBeLessThan(
      contrast(token("border-control"), token("paper")),
    );
  });

  it("keeps a product figure size above the lead", () => {
    expect(CSS).toMatch(/--text-figure:\s*clamp\(/);
  });
});

describe("the dark theme", () => {
  it("is switched by a data attribute, so the same tokens carry both themes", () => {
    expect(DARK_START).toBeGreaterThan(0);
    expect(DARK_CSS).toMatch(/color-scheme:\s*dark/);
  });

  it("turns the page ground near-black and lifts the band a step above it", () => {
    expect(relativeLuminance(darkToken("paper"))).toBeLessThan(0.01);
    expect(relativeLuminance(darkToken("band"))).toBeLessThan(0.03);
    expect(relativeLuminance(darkToken("band"))).toBeGreaterThanOrEqual(
      relativeLuminance(darkToken("paper")),
    );
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

  it.each(["action", "action-hover", "ink"])(
    "keeps ink-inverse legible on %s",
    (fill) => {
      expect(contrast(darkToken("ink-inverse"), darkToken(fill))).toBeGreaterThanOrEqual(
        AA_TEXT,
      );
    },
  );

  it.each(["band", "accent", "primary-deep"])("keeps knockout legible on %s", (fill) => {
    expect(contrast(darkToken("knockout"), darkToken(fill))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it("keeps band copy, the inverse button, the accent fill and control borders legible", () => {
    expect(contrast(darkToken("band-copy"), darkToken("band"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
    expect(contrast(darkToken("band"), darkToken("knockout"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
    expect(
      contrast(darkToken("primary-deep"), darkToken("primary-muted")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(darkToken("accent"), darkToken("surface"))).toBeGreaterThanOrEqual(
      AA_LARGE,
    );
    expect(
      contrast(darkToken("border-control"), darkToken("paper")),
    ).toBeGreaterThanOrEqual(AA_LARGE);
  });
});
