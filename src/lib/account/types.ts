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

export const CONNECTION_PROVIDERS = ["telegram", "google", "password"] as const;

export type ConnectionProvider = (typeof CONNECTION_PROVIDERS)[number];

export const CONNECTION_OUTCOMES = [
  "linked",
  "alreadyLinked",
  "approvalRequired",
] as const;

export type ConnectionOutcome = (typeof CONNECTION_OUTCOMES)[number];

export const MERGE_REQUEST_STATUSES = [
  "pending",
  "processing",
  "completed",
  "rejected",
  "cancelled",
  "expired",
] as const;

export type MergeRequestStatus = (typeof MERGE_REQUEST_STATUSES)[number];

export const MERGE_REQUEST_DIRECTIONS = ["incoming", "outgoing"] as const;

export type MergeRequestDirection = (typeof MERGE_REQUEST_DIRECTIONS)[number];

export const CONNECT_STATE_COOKIE_NAME = "volontyorlar_connect_state";
export const CONNECT_GOOGLE_STATE_COOKIE_NAME = "volontyorlar_connect_google_state";
export const CONNECT_LOCALE_COOKIE_NAME = "volontyorlar_connect_locale";

export const CONNECT_STATUSES = [
  "linked",
  "alreadyLinked",
  "approvalRequired",
  "alreadyPending",
  "conflict",
  "expired",
  "cancelled",
  "phoneRequired",
  "disabled",
  "tooMany",
  "unavailable",
] as const;

export type ConnectStatus = (typeof CONNECT_STATUSES)[number];

export const ACCOUNT_ERROR_CODES = [
  "accountLinkingUnavailable",
  "accountConnectionConflict",
  "accountMergeAlreadyPending",
  "accountMergeRequestNotFound",
  "accountMergeRequestExpired",
  "accountMergeRequestNotPending",
  "recentAuthenticationRequired",
  "invalidLoginState",
  "invalidGoogleState",
  "invalidGoogleCredential",
  "invalidCredentials",
  "validationFailed",
  "phoneRequired",
  "accountDisabled",
  "rateLimitExceeded",
  "authRateLimitUnavailable",
  "telegramAuthUnavailable",
  "googleAuthUnavailable",
  "passwordAuthUnavailable",
  "telegramUnavailable",
  "googleUnavailable",
] as const;

export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[number];

export const ACCOUNT_ERROR_KEYS = [
  ...ACCOUNT_ERROR_CODES,
  "network",
  "unknown",
] as const;

export type AccountErrorKey = (typeof ACCOUNT_ERROR_KEYS)[number];

export const STALE_MERGE_ERROR_CODES = [
  "accountMergeRequestExpired",
  "accountMergeRequestNotPending",
  "accountMergeRequestNotFound",
] as const;

export type StaleMergeErrorCode = (typeof STALE_MERGE_ERROR_CODES)[number];
