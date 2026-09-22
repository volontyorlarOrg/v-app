export const PROFILE_SOCIAL_PLATFORMS = ["telegram", "instagram", "linkedin"] as const;

export type ProfileSocialPlatform = (typeof PROFILE_SOCIAL_PLATFORMS)[number];

export type ProfileSocialLink = {
  platform: ProfileSocialPlatform;
  handle: string;
  href: string;
};

const HANDLE = /^[A-Za-z0-9_-]+$/;

export function linkedinProfileUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = trimmed.includes("/")
    ? /^(?:https?:\/\/)/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    : HANDLE.test(trimmed.replace(/^@+/, ""))
      ? `https://www.linkedin.com/in/${trimmed.replace(/^@+/, "")}`
      : "";
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    if (
      url.protocol !== "https:" ||
      host !== "linkedin.com" ||
      parts.length !== 2 ||
      parts[0] !== "in" ||
      !HANDLE.test(parts[1] ?? "")
    ) {
      return null;
    }
    return `https://www.linkedin.com/in/${parts[1]}`;
  } catch {
    return null;
  }
}

export function profileSocialLinks(profile: {
  telegram: string;
  instagram: string;
  linkedin: string;
}): ProfileSocialLink[] {
  const telegram = profile.telegram.trim().replace(/^@+/, "");
  const instagram = profile.instagram.trim().replace(/^@+/, "");
  const linkedin = linkedinProfileUrl(profile.linkedin);
  const linkedinHandle = linkedin?.split("/").filter(Boolean).at(-1) ?? "";

  return [
    telegram
      ? {
          platform: "telegram" as const,
          handle: telegram,
          href: `https://t.me/${encodeURIComponent(telegram)}`,
        }
      : null,
    instagram
      ? {
          platform: "instagram" as const,
          handle: instagram,
          href: `https://www.instagram.com/${encodeURIComponent(instagram)}/`,
        }
      : null,
    linkedin && linkedinHandle
      ? {
          platform: "linkedin" as const,
          handle: linkedinHandle,
          href: linkedin,
        }
      : null,
  ].filter((link): link is ProfileSocialLink => link !== null);
}
