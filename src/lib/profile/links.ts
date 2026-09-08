export type ProfileLink = {
  href: string;
  label: string;
};

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const SUPPORTED_PROTOCOLS = ["http:", "https:"];

function parse(value: string): URL | null {
  const candidate = SCHEME.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    return SUPPORTED_PROTOCOLS.includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function profileLink(value: string): ProfileLink | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const url = parse(trimmed);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");

  return { href: url.toString(), label: `${host}${path}` };
}

export function profileLinks(values: readonly string[]): ProfileLink[] {
  return values.map(profileLink).filter((link): link is ProfileLink => link !== null);
}
