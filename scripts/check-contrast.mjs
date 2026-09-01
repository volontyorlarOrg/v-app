import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function tokens() {
  const found = new Map();

  for (const [, name, value] of css.matchAll(
    /--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    found.set(name, value.toUpperCase());
  }

  return found;
}

const PALETTE = tokens();

function channel(value) {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((offset) =>
    channel(parseInt(hex.slice(offset, offset + 2), 16) / 255),
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const x = luminance(PALETTE.get(a));
  const y = luminance(PALETTE.get(b));

  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const SURFACES = ["canvas", "surface", "surface-strong"];

const CHECKS = [
  ...SURFACES.flatMap((surface) =>
    ["ink", "ink-muted", "blue-deep", "orange-deep", "danger"].map((text) => ({
      label: `${text} text on ${surface}`,
      pair: [text, surface],
      minimum: 4.5,
    })),
  ),
  { label: "blue-deep on blue-tint", pair: ["blue-deep", "blue-tint"], minimum: 4.5 },
  {
    label: "orange-deep on orange-tint",
    pair: ["orange-deep", "orange-tint"],
    minimum: 4.5,
  },
  { label: "danger on danger-tint", pair: ["danger", "danger-tint"], minimum: 4.5 },
  { label: "ink on blue-tint", pair: ["ink", "blue-tint"], minimum: 4.5 },
  { label: "ink on orange-tint", pair: ["ink", "orange-tint"], minimum: 4.5 },
  { label: "ink on danger-tint", pair: ["ink", "danger-tint"], minimum: 4.5 },
  {
    label: "knockout on blue-deep button",
    pair: ["knockout", "blue-deep"],
    minimum: 4.5,
  },
  {
    label: "knockout on orange-deep button",
    pair: ["knockout", "orange-deep"],
    minimum: 4.5,
  },
  { label: "knockout on danger button", pair: ["knockout", "danger"], minimum: 4.5 },
  { label: "blue graphic on canvas", pair: ["blue", "canvas"], minimum: 3 },
  { label: "orange graphic on canvas", pair: ["orange", "canvas"], minimum: 3 },
  {
    label: "form control border on canvas",
    pair: ["line-control", "canvas"],
    minimum: 3,
  },
  {
    label: "form control border on surface",
    pair: ["line-control", "surface"],
    minimum: 3,
  },
  { label: "focus ring on canvas", pair: ["blue-deep", "canvas"], minimum: 3 },
  { label: "focus ring on surface", pair: ["blue-deep", "surface"], minimum: 3 },
];

const FORBIDDEN = [
  {
    label: "the mark is never two-colour: blue and orange are indistinguishable",
    pair: ["blue", "orange"],
    below: 3,
  },
  { label: "orange text on blue is unusable", pair: ["orange", "blue"], below: 4.5 },
  { label: "blue text on orange is unusable", pair: ["blue", "orange"], below: 4.5 },
  {
    label: "plain blue is a graphics colour, not a button fill for white text",
    pair: ["knockout", "blue"],
    below: 4.5,
  },
  {
    label: "plain orange is a graphics colour, not a button fill for white text",
    pair: ["knockout", "orange"],
    below: 4.5,
  },
];

let failed = 0;

console.log("contrast — required minimums\n");

for (const { label, pair, minimum } of CHECKS) {
  const value = ratio(...pair);
  const ok = value + 1e-9 >= minimum;

  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "pass" : "FAIL"}  ${value.toFixed(2).padStart(5)}:1  (min ${minimum})  ${label}`,
  );
}

console.log("\ncontrast — relationships the design system depends on staying true\n");

for (const { label, pair, below } of FORBIDDEN) {
  const value = ratio(...pair);
  const ok = value < below;

  if (!ok) failed += 1;
  console.log(
    `  ${ok ? "pass" : "FAIL"}  ${value.toFixed(2).padStart(5)}:1  (< ${below})   ${label}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}

console.log(`\nall ${CHECKS.length + FORBIDDEN.length} contrast checks passed.`);
