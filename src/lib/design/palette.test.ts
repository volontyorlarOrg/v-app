import { describe, expect, it } from "vitest";
import {
  BRAND_BLUE,
  BRAND_ORANGE,
  GRAPHICS_ONLY_TOKENS,
  PALETTE,
  TEXT_ONLY_TOKENS,
  WCAG,
  contrastRatio,
  ratio,
  relativeLuminance,
} from "./palette";

const round = (value: number) => Math.round(value * 100) / 100;

describe("contrast maths", () => {
  it("matches every ratio published in the logo specification", () => {
    expect(round(ratio("blue", "canvas"))).toBe(4.36);
    expect(round(ratio("blueDeep", "canvas"))).toBe(6.96);
    expect(round(ratio("orange", "canvas"))).toBe(3.48);
    expect(round(ratio("orangeDeep", "canvas"))).toBe(5.41);
    expect(round(ratio("ink", "canvas"))).toBe(14.37);
  });

  it("is symmetric", () => {
    expect(contrastRatio(PALETTE.ink, PALETTE.canvas)).toBeCloseTo(
      contrastRatio(PALETTE.canvas, PALETTE.ink),
    );
  });

  it("rejects malformed input instead of returning a plausible number", () => {
    expect(() => relativeLuminance("#GGGGGG")).toThrow();
    expect(() => relativeLuminance("#FFF")).toThrow();
  });
});

describe("brand rule 1 — the mark is never two-colour", () => {
  it("confirms blue and orange are indistinguishable by luminance", () => {
    expect(round(contrastRatio(BRAND_BLUE, BRAND_ORANGE))).toBe(1.25);
    expect(contrastRatio(BRAND_BLUE, BRAND_ORANGE)).toBeLessThan(WCAG.graphics);
  });
});

describe("brand rule 2 — brand colours are never set on each other", () => {
  it.each([
    ["orange", "blue"],
    ["orangeDeep", "blue"],
    ["blue", "orange"],
    ["blueDeep", "orange"],
  ] as const)("%s on %s is unusable and must never ship", (foreground, background) => {
    expect(ratio(foreground, background)).toBeLessThan(WCAG.bodyText);
  });
});

describe("brand rule 3 — graphics colours are not text colours", () => {
  it.each(GRAPHICS_ONLY_TOKENS)(
    "%s clears the graphics threshold on canvas",
    (token) => {
      expect(ratio(token, "canvas")).toBeGreaterThanOrEqual(WCAG.graphics);
    },
  );

  it.each(GRAPHICS_ONLY_TOKENS)("%s misses the body-text floor on canvas", (token) => {
    expect(ratio(token, "canvas")).toBeLessThan(WCAG.bodyText);
  });

  it.each(TEXT_ONLY_TOKENS)("%s clears the body-text floor on canvas", (token) => {
    expect(ratio(token, "canvas")).toBeGreaterThanOrEqual(WCAG.bodyText);
  });
});

describe("text on every surface the product paints", () => {
  const surfaces = ["canvas", "surface", "surfaceStrong"] as const;

  it.each(surfaces)("ink and muted ink both pass AA on %s", (surface) => {
    expect(ratio("ink", surface)).toBeGreaterThanOrEqual(WCAG.bodyText);
    expect(ratio("inkMuted", surface)).toBeGreaterThanOrEqual(WCAG.bodyText);
  });

  it.each(surfaces)("blueDeep, orangeDeep and danger pass AA on %s", (surface) => {
    expect(ratio("blueDeep", surface)).toBeGreaterThanOrEqual(WCAG.bodyText);
    expect(ratio("orangeDeep", surface)).toBeGreaterThanOrEqual(WCAG.bodyText);
    expect(ratio("danger", surface)).toBeGreaterThanOrEqual(WCAG.bodyText);
  });

  it.each([
    ["blueDeep", "blueTint"],
    ["orangeDeep", "orangeTint"],
    ["danger", "dangerTint"],
    ["ink", "blueTint"],
    ["ink", "orangeTint"],
    ["ink", "dangerTint"],
  ] as const)("%s passes AA on %s", (foreground, background) => {
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(WCAG.bodyText);
  });
});

describe("knockout text on filled controls", () => {
  it.each(["blueDeep", "orangeDeep", "danger"] as const)(
    "white passes AA on a filled %s control",
    (token) => {
      expect(ratio("knockout", token)).toBeGreaterThanOrEqual(WCAG.bodyText);
    },
  );

  it("white on plain blue does not pass, which is why buttons use blueDeep", () => {
    expect(ratio("knockout", "blue")).toBeLessThan(WCAG.bodyText);
  });

  it("white on plain orange does not pass, which is why buttons use orangeDeep", () => {
    expect(ratio("knockout", "orange")).toBeLessThan(WCAG.bodyText);
  });
});

describe("form control borders", () => {
  it("clears the 3:1 required for a meaningful UI boundary", () => {
    expect(ratio("lineControl", "canvas")).toBeGreaterThanOrEqual(WCAG.uiComponent);
    expect(ratio("lineControl", "surface")).toBeGreaterThanOrEqual(WCAG.uiComponent);
  });

  it("keeps the decorative divider quieter than the control border", () => {
    expect(ratio("line", "canvas")).toBeLessThan(ratio("lineControl", "canvas"));
  });
});

describe("focus ring", () => {
  it("is visible against every surface it can land on", () => {
    for (const surface of ["canvas", "surface", "surfaceStrong", "blueTint"] as const) {
      expect(ratio("blueDeep", surface)).toBeGreaterThanOrEqual(WCAG.uiComponent);
    }
  });
});
