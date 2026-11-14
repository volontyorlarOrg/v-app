export const LEGAL_VERSION = "2026-11-14";
export const ADMISSION_COOKIE = "volontyorlar_legal_admission";
export const LEGAL_CONSENT_REQUIRED = "legalConsentRequired";
export const LEGAL_REQUEST_KINDS = [
  "access",
  "correction",
  "review",
  "erasure",
  "withdrawal",
] as const;
export const LEGAL_CHOICES = ["leaderboard", "publicProfile"] as const;
export type LegalChoice = (typeof LEGAL_CHOICES)[number];
