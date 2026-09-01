import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sources = globSync("src/**/*.{ts,tsx}").filter(
  (file) =>
    !file.includes("/design/") &&
    !file.endsWith(".test.ts") &&
    !file.endsWith(".test.tsx"),
);

function read(file: string) {
  return readFileSync(file, "utf8");
}

function usesClass(file: string, pattern: RegExp) {
  return pattern.test(read(file));
}

const ORANGE_ALLOWLIST = [
  "src/components/ui/badge.tsx",
  "src/components/ui/surface.tsx",
];

const BRAND_ICON_ALLOWLIST = [
  "src/components/ui/states.tsx",
  "src/components/opportunities/opportunity-card.tsx",
];

const PLAIN_BLUE = /\b(?:text|bg|border)-blue(?![-\w])/;
const PLAIN_ORANGE = /\b(?:text|bg|border)-orange(?![-\w])/;
const ANY_ORANGE = /\b(?:text|bg|border)-orange(?:-(?:deep|tint))?(?![-\w])/;

describe("orange is rationed to a volunteer's own achievement", () => {
  it("exists only in the primitive layer, requested elsewhere by tone name", () => {
    const users = sources.filter((file) => usesClass(file, ANY_ORANGE));

    expect(users.sort()).toEqual([...ORANGE_ALLOWLIST].sort());
  });
});

describe("plain blue and orange are graphics colours", () => {
  it("are used only to colour an icon, in the files that do so", () => {
    const users = sources.filter(
      (file) => usesClass(file, PLAIN_BLUE) || usesClass(file, PLAIN_ORANGE),
    );

    expect(users.sort()).toEqual([...BRAND_ICON_ALLOWLIST].sort());
  });

  it.each(BRAND_ICON_ALLOWLIST)(
    "%s applies it to an svg, never to a text node",
    (file) => {
      const text = read(file);

      for (const [, className] of text.matchAll(
        /className="([^"]*text-blue(?![-\w])[^"]*)"/g,
      )) {
        expect(className).toMatch(/size-|\[&_svg\]/);
      }
    },
  );

  it.each(sources)("%s never fills a control with a graphics colour", (file) => {
    expect(read(file)).not.toMatch(/\bbg-(?:blue|orange)(?![-\w])/);
  });
});

describe("form controls use the accessible border token", () => {
  it("Field's control classes use line-control, not the decorative line", () => {
    const field = read("src/components/ui/field.tsx");

    expect(field).toMatch(/border-line-control/);
    expect(field).not.toMatch(/border-line(?![-\w])/);
  });
});

describe("no hard-coded colour outside the token layer", () => {
  it.each(sources)("%s contains no hex colour literal", (file) => {
    expect([...read(file).matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0])).toEqual([]);
  });
});

describe("brand assets are referenced from one place", () => {
  it("no source still points at the retired logo directory", () => {
    expect(sources.filter((file) => /["'`]\/logo\//.test(read(file)))).toEqual([]);
  });

  it("every brand image reference resolves under public/brand", () => {
    const referenced = sources.flatMap((file) =>
      [...read(file).matchAll(/src="(\/[^"]+\.(?:svg|png))"/g)].map((m) => m[1]!),
    );

    expect(referenced.length).toBeGreaterThan(0);
    for (const path of referenced) expect(path).toMatch(/^\/brand\//);
  });
});
