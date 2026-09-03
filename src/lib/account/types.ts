export type LinkedIdentities = {
  telegram: { username: string } | null;
  google: { email: string } | null;
  email: { address: string; verified: boolean } | null;
};

export const PREFERENCE_KEYS = [
  "notifyTelegram",
  "notifyEmail",
  "remindDeadlines",
  "notifyDecisions",
  "profileToOrganisers",
  "levelPublic",
] as const;

export type PreferenceKey = (typeof PREFERENCE_KEYS)[number];

export type Preferences = Record<PreferenceKey, boolean>;
