export const PALETTE = {
  canvas: "#FFFFFF",
  surface: "#F4F7FA",
  surfaceStrong: "#EDF2F7",

  line: "#DDE5EC",
  lineControl: "#748799",

  ink: "#222B33",
  inkMuted: "#556270",
  knockout: "#FFFFFF",

  blue: "#007FC2",
  blueDeep: "#005E92",
  blueTint: "#EAF3F9",

  orange: "#E85D30",
  orangeDeep: "#B34917",
  orangeTint: "#FDF0EA",

  danger: "#B3261E",
  dangerTint: "#FCEDEB",
} as const;

export type PaletteToken = keyof typeof PALETTE;

export const BRAND_BLUE = PALETTE.blue;
export const BRAND_ORANGE = PALETTE.orange;

export const WCAG = {
  bodyText: 4.5,
  largeText: 3,
  graphics: 3,
  uiComponent: 3,
} as const;

export const TEXT_ONLY_TOKENS = [
  "blueDeep",
  "orangeDeep",
  "danger",
  "ink",
  "inkMuted",
] as const;
export const GRAPHICS_ONLY_TOKENS = ["blue", "orange"] as const;

function channel(value: number): number {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Expected a six-digit hex colour, received "${hex}".`);
  }

  const [r, g, b] = [0, 2, 4].map((offset) =>
    channel(parseInt(normalized.slice(offset, offset + 2), 16) / 255),
  ) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrast(
  foreground: string,
  background: string,
  minimum: number,
): boolean {
  return contrastRatio(foreground, background) + 1e-9 >= minimum;
}

export function ratio(foreground: PaletteToken, background: PaletteToken): number {
  return contrastRatio(PALETTE[foreground], PALETTE[background]);
}
