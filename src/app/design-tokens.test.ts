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

function channels(hex: string): [number, number, number] {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high = 0, low = 0] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (high + 0.05) / (low + 0.05);
}

const AA_TEXT = 4.5;
const AA_GRAPHIC = 3;

const SURFACES = ["paper", "surface", "surface-sunk", "surface-soft", "surface-raised"];
const TEXT_TOKENS = ["ink", "ink-muted", "primary", "accent-ink"];
const THEMES = [
  ["light", token],
  ["dark", darkToken],
] as const;

describe("one blue", () => {
  it("is one calm blue in the light theme, the same value for text and for fills", () => {
    expect(token("action")).toBe("#0f66ac");
    expect(token("primary")).toBe(token("action"));
  });

  it("splits in the dark theme: a fill for white labels and a lifted, calmer text blue", () => {
    expect(darkToken("primary")).not.toBe(darkToken("action"));
    expect(relativeLuminance(darkToken("primary"))).toBeGreaterThan(
      relativeLuminance(darkToken("action")),
    );
  });

  it("leaves the logo kit's own colours alone", () => {
    expect(token("logo-blue")).toBe("#007fc2");
    expect(token("logo-orange")).toBe("#e85d30");
    expect(token("logo-word")).toBe("#007fc2");
    expect(darkToken("logo-blue")).toBe("#007fc2");
    expect(darkToken("logo-word")).toBe("#ffffff");
  });

  it.each(["shell", "band", "primary-ink", "primary-deep", "primary-muted"])(
    "keeps the retired token %s out of the palette",
    (name) => {
      expect(CSS).not.toMatch(new RegExp(`--color-${name}\\b`));
    },
  );
});

describe.each(THEMES)("contrast in the %s theme", (_theme, read) => {
  it.each(TEXT_TOKENS)("%s meets AA on every surface", (foreground) => {
    for (const surface of SURFACES) {
      expect(
        contrast(read(foreground), read(surface)),
        `${foreground} on ${surface}`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it.each(["action", "action-hover"])("keeps a white label legible on %s", (fill) => {
    expect(contrast(read("knockout"), read(fill))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("gives a filled control a 3:1 boundary against the page", () => {
    expect(contrast(read("action"), read("surface"))).toBeGreaterThanOrEqual(
      AA_GRAPHIC,
    );
  });

  it("gives a field's edge a 3:1 boundary", () => {
    expect(contrast(read("border-control"), read("surface"))).toBeGreaterThanOrEqual(
      AA_GRAPHIC,
    );
    expect(contrast(read("border-control"), read("field"))).toBeGreaterThanOrEqual(
      AA_GRAPHIC,
    );
  });

  it("keeps the hairline quieter than a field's edge", () => {
    expect(contrast(read("border"), read("surface"))).toBeLessThan(
      contrast(read("border-control"), read("surface")),
    );
    expect(contrast(read("border"), read("surface"))).toBeGreaterThan(1.2);
  });

  it("keeps the orange mark visible as a graphic", () => {
    expect(contrast(read("accent"), read("surface"))).toBeGreaterThanOrEqual(
      AA_GRAPHIC,
    );
  });
});

describe("the sidebar", () => {
  it("is a pale blue field in the light theme, not white and not navy", () => {
    const [r, g, b] = channels(token("sidebar"));
    expect(b).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(r);
    expect(relativeLuminance(token("sidebar"))).toBeGreaterThan(0.8);
    expect(token("sidebar")).not.toBe(token("surface"));
  });

  it.each(THEMES)("keeps its text legible in the %s theme", (_theme, read) => {
    for (const surface of ["sidebar", "sidebar-hover"]) {
      for (const text of ["ink", "ink-muted"]) {
        expect(
          contrast(read(text), read(surface)),
          `${text} on ${surface}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
    expect(contrast(read("primary"), read("sidebar-active"))).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });
});

describe("neutrals, not a blue room", () => {
  const MOST_CHROMA = 16;
  const spread = (hex: string) => {
    const values = channels(hex);
    return Math.max(...values) - Math.min(...values);
  };

  it.each(["paper", "surface", "surface-sunk", "surface-raised", "border"])(
    "%s stays a quiet neutral in both themes",
    (name) => {
      expect(spread(token(name))).toBeLessThanOrEqual(MOST_CHROMA);
      expect(spread(darkToken(name))).toBeLessThanOrEqual(MOST_CHROMA);
    },
  );

  it("sets white panels on a soft ground in the light theme", () => {
    expect(token("surface")).toBe("#ffffff");
    expect(token("paper")).not.toBe(token("surface"));
    expect(contrast(token("paper"), token("surface"))).toBeLessThan(1.1);
  });

  it("raises panels off the dark floor, and popovers off the panels", () => {
    const floor = relativeLuminance(darkToken("paper"));
    const panel = relativeLuminance(darkToken("surface"));
    expect(floor).toBeLessThan(0.01);
    expect(panel).toBeGreaterThan(floor);
    expect(relativeLuminance(darkToken("surface-raised"))).toBeGreaterThan(panel);
  });

  it("is switched by a data attribute, so the same tokens carry both themes", () => {
    expect(DARK_START).toBeGreaterThan(0);
    expect(DARK_CSS).toMatch(/color-scheme:\s*dark/);
  });
});

describe("the surface furniture stays gone", () => {
  it.each([
    "workspace-backdrop",
    "shell-glow",
    "board-dot",
    "board-wash",
    "wash-primary",
  ])("has no %s", (name) => {
    expect(CSS).not.toContain(name);
  });

  it("draws no radial wash", () => {
    expect(CSS).not.toMatch(/radial-gradient/);
  });

  it("keeps its one gradient on the volunteer's pass", () => {
    expect(CSS.match(/linear-gradient/g)).toHaveLength(1);
    const pass = CSS.slice(CSS.indexOf(".volunteer-pass-card {"));
    expect(pass.slice(0, pass.indexOf("}"))).toContain("linear-gradient");
  });
});

describe("corners", () => {
  it.each([
    ["sm", "0.375rem"],
    ["md", "0.625rem"],
    ["lg", "0.875rem"],
    ["xl", "1.125rem"],
  ])("radius-%s is %s", (name, value) => {
    expect(CSS).toMatch(new RegExp(`--radius-${name}:\\s*${value};`));
  });

  it("stops at eighteen pixels", () => {
    expect(CSS).not.toMatch(/--radius-[23]xl/);
  });
});

describe("the danger red", () => {
  it.each([
    ["danger", "#b3261e"],
    ["danger-ink", "#8f1e18"],
    ["danger-muted", "#f7e3e2"],
  ])("%s is the portals' %s", (name, value) => {
    expect(token(name)).toBe(value);
  });

  it("is one red, defined under no second name", () => {
    expect(CSS).not.toMatch(/--color-destructive|--color-error/);
  });

  it("keeps its label legible at rest and on its own hover fill in both themes", () => {
    for (const [, read] of THEMES) {
      for (const surface of [...SURFACES, "danger-muted"]) {
        expect(
          contrast(read("danger-ink"), read(surface)),
          `danger-ink on ${surface}`,
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
  });
});

describe("the podium metals", () => {
  const METALS = ["gold", "silver", "bronze"] as const;

  it.each(METALS)(
    "%s ink meets AA on the page and on a step in both themes",
    (metal) => {
      for (const [, read] of THEMES) {
        expect(contrast(read(`${metal}-ink`), read("surface"))).toBeGreaterThanOrEqual(
          AA_TEXT,
        );
        expect(
          contrast(read(`${metal}-ink`), read("surface-sunk")),
        ).toBeGreaterThanOrEqual(AA_TEXT);
      }
    },
  );

  it("gives the three places three different hues in both themes", () => {
    for (const [, read] of THEMES) {
      expect(new Set(METALS.map((metal) => read(metal))).size).toBe(3);
    }
  });
});
