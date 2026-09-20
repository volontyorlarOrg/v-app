import { describe, expect, it } from "vitest";

import {
  CONNECT_START_PATHS,
  GOOGLE_CONNECT_CALLBACK_PATH,
  REAUTHENTICATE_PATH,
  accountErrorKey,
  connectLocale,
  connectStartHref,
  connectStatusForError,
  connectStatusForProviderError,
  connectionStates,
  isConnectStatus,
  isConnected,
  isStaleMergeCode,
  mergeRequestFormSchema,
} from "@/lib/account/connections";
import {
  ACCOUNT_ERROR_CODES,
  ACCOUNT_ERROR_KEYS,
  CONNECT_GOOGLE_STATE_COOKIE_NAME,
  CONNECT_LOCALE_COOKIE_NAME,
  CONNECT_STATE_COOKIE_NAME,
  CONNECT_STATUSES,
  STALE_MERGE_ERROR_CODES,
} from "@/lib/account/types";
import { ApiError, type ApiErrorCode } from "@/lib/api/errors";
import { meSchema } from "@/lib/api/schemas";
import { GOOGLE_STATE_COOKIE_NAME as GOOGLE_LOGIN_STATE } from "@/lib/auth/google";
import { AUTH_STATE_COOKIE_NAME } from "@/lib/auth/telegram";
import {
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const LOGIN_COOKIES = [
  SESSION_COOKIE_NAME,
  AUTH_STATE_COOKIE_NAME,
  GOOGLE_LOGIN_STATE,
  LOCALE_HINT_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
];

const CONNECT_COOKIES = [
  CONNECT_STATE_COOKIE_NAME,
  CONNECT_GOOGLE_STATE_COOKIE_NAME,
  CONNECT_LOCALE_COOKIE_NAME,
];

function apiError(code: ApiErrorCode, backendCode?: string) {
  return new ApiError(code, {
    details: backendCode ? { code: backendCode } : null,
  });
}

describe("connection handoff state", () => {
  it("never reuses a sign-in cookie name", () => {
    for (const name of CONNECT_COOKIES) {
      expect(LOGIN_COOKIES, name).not.toContain(name);
    }
    expect(new Set(CONNECT_COOKIES).size).toBe(CONNECT_COOKIES.length);
  });

  it("starts each provider on its own connection route, never the sign-in route", () => {
    expect(connectStartHref("telegram", "uz")).toBe(
      "/api/auth/connect/telegram/start?locale=uz",
    );
    expect(connectStartHref("google", "en")).toBe(
      "/api/auth/connect/google/start?locale=en",
    );
    for (const path of Object.values(CONNECT_START_PATHS)) {
      expect(path.startsWith("/api/auth/connect/")).toBe(true);
    }
    expect(GOOGLE_CONNECT_CALLBACK_PATH).toBe("/api/auth/connect/google/callback");
  });

  it("returns to sign-in through a route of its own, not the sign-out action", () => {
    expect(REAUTHENTICATE_PATH).toBe("/api/auth/connect/reauthenticate");
    expect(REAUTHENTICATE_PATH).not.toMatch(/token|email|@|requestId|locale/i);
  });

  it("returns in the language the handoff started in, or the one the reader chose", () => {
    expect(connectLocale("ru", "en")).toBe("ru");
    expect(connectLocale(undefined, "en")).toBe("en");
    expect(connectLocale("fr", "en")).toBe("en");
    expect(connectLocale(undefined, undefined)).toBe("uz");
    expect(connectLocale("../en", "fr")).toBe("uz");
  });

  it("accepts only the bounded status enum in a URL", () => {
    for (const status of CONNECT_STATUSES) expect(isConnectStatus(status)).toBe(true);
    for (const value of [
      "linked ",
      "merged",
      "",
      null,
      undefined,
      1,
      "u1@example.org",
    ]) {
      expect(isConnectStatus(value), String(value)).toBe(false);
    }
  });
});

describe("provider failures become a bounded status", () => {
  it("names the outcomes a volunteer can act on", () => {
    expect(
      connectStatusForError(apiError("conflict", "accountConnectionConflict")),
    ).toBe("conflict");
    expect(
      connectStatusForError(apiError("conflict", "accountMergeAlreadyPending")),
    ).toBe("alreadyPending");
    expect(connectStatusForError(apiError("forbidden", "phoneRequired"))).toBe(
      "phoneRequired",
    );
    expect(connectStatusForError(apiError("forbidden", "accountDisabled"))).toBe(
      "disabled",
    );
    expect(connectStatusForError(apiError("rateLimited", "rateLimitExceeded"))).toBe(
      "tooMany",
    );
    expect(
      connectStatusForError(apiError("unauthenticated", "invalidGoogleState")),
    ).toBe("expired");
    expect(connectStatusForError(apiError("server", "accountLinkingUnavailable"))).toBe(
      "unavailable",
    );
  });

  it("falls back to unavailable for anything it does not recognise", () => {
    expect(connectStatusForError(new Error("boom"))).toBe("unavailable");
    expect(connectStatusForError(apiError("server"))).toBe("unavailable");
    expect(connectStatusForProviderError("access_denied")).toBe("cancelled");
    expect(connectStatusForProviderError("server_error")).toBe("unavailable");
  });
});

describe("backend error codes become catalog keys", () => {
  it("maps every documented code to a key of its own", () => {
    for (const code of ACCOUNT_ERROR_CODES) {
      expect(accountErrorKey(code), code).toBe(code);
      expect(ACCOUNT_ERROR_KEYS).toContain(code);
    }
  });

  it("maps transport failures and refuses to pass an unknown code through", () => {
    expect(accountErrorKey("rateLimited")).toBe("rateLimitExceeded");
    expect(accountErrorKey("network")).toBe("network");
    expect(accountErrorKey("timeout")).toBe("network");
    expect(accountErrorKey("Something exploded on the server")).toBe("unknown");
    expect(accountErrorKey(null)).toBe("unknown");
    expect(accountErrorKey(undefined)).toBe("unknown");
  });

  it("knows which failures mean the request list is stale", () => {
    for (const code of STALE_MERGE_ERROR_CODES)
      expect(isStaleMergeCode(code)).toBe(true);
    expect(isStaleMergeCode("accountConnectionConflict")).toBe(false);
    expect(isStaleMergeCode(undefined)).toBe(false);
  });
});

describe("connection state", () => {
  const me = meSchema.parse({
    id: "u1",
    createdAt: "2026-01-01T00:00:00.000Z",
    username: "dilnoza_k",
    usernameSource: "telegram",
    usernameEditable: true,
    email: "dilnoza@example.org",
    emailVerified: true,
    telegramIdentity: { username: "dilnoza_k" },
    authMethods: { telegram: true, google: false, password: true },
  });

  it("reports one row per account type in a fixed order", () => {
    expect(connectionStates(me).map((state) => state.provider)).toEqual([
      "telegram",
      "google",
      "password",
    ]);
  });

  it("shows the volunteer's own handle and address, and nothing else", () => {
    const [telegram, google, password] = connectionStates(me);
    expect(telegram?.detail).toBe("@dilnoza_k");
    expect(google?.connected).toBe(false);
    expect(google?.detail).toBeNull();
    expect(password?.detail).toBe("dilnoza@example.org");
    expect(password?.verified).toBe(true);
  });

  it("marks an email unverified until the backend says otherwise", () => {
    const unverified = meSchema.parse({
      id: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      username: "user_12345",
      usernameSource: "generated",
      usernameEditable: true,
      email: "dilnoza@example.org",
      authMethods: { telegram: false, google: false, password: true },
    });
    expect(connectionStates(unverified)[2]?.verified).toBe(false);
    expect(isConnected(connectionStates(unverified), "telegram")).toBe(false);
    expect(isConnected(connectionStates(unverified), "password")).toBe(true);
  });

  it("shows an email connection even when the account has no password yet", () => {
    const passwordless = meSchema.parse({
      id: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      username: "user_12345",
      usernameSource: "generated",
      usernameEditable: true,
      email: "dilnoza@example.org",
      emailVerified: true,
      authMethods: { telegram: false, google: true, password: false },
    });
    const states = connectionStates(passwordless);
    expect(states[1]?.detail).toBe("dilnoza@example.org");
    expect(states[2]).toMatchObject({
      connected: true,
      detail: "dilnoza@example.org",
      verified: true,
    });
  });
});

describe("the merge request form", () => {
  it("needs a request and a locale", () => {
    expect(
      mergeRequestFormSchema.safeParse({ requestId: "m1", locale: "uz" }).success,
    ).toBe(true);
    expect(
      mergeRequestFormSchema.safeParse({ requestId: "", locale: "uz" }).success,
    ).toBe(false);
    expect(mergeRequestFormSchema.safeParse({ requestId: "m1" }).success).toBe(false);
  });
});
