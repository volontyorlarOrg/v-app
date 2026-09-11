export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/[\s_.\-]+/)
    .filter((part) => /^\p{L}/u.test(part));
  const letters =
    parts.length >= 2
      ? parts.slice(0, 2).map((part) => [...part][0] ?? "")
      : [...(parts[0] ?? "")].slice(0, 2);
  return letters.join("").toLocaleUpperCase();
}
