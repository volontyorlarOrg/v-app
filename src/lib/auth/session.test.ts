import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  decryptSession,
  encryptSession,
  isAccessTokenExpired,
  isAccessTokenExpiring,
  isSessionStatus,
  safeReturnPath,
  sessionCookieOptions,
  toSessionPayload,
  type SessionPayload,
} from "@/lib/auth/session";

const SECRET = "test-session-secret-of-at-least-32-characters";

function payload(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "00000000-0000-4000-8000-000000000001",
    roles: ["volunteer"],
    displayName: "Aziza Karimova",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    accessTokenExpiresAt: 4_102_444_800,
    ...overrides,
  };
}

describe("session cookie", () => {
  beforeEach(() => {
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", SECRET);
  });

  it("round-trips a payload through encryption", async () => {
    const value = await encryptSession(payload());
    expect(value).toBeTruthy();
    await expect(decryptSession(value!)).resolves.toEqual(payload());
  });

  it("keeps the tokens out of the cookie value in plain text", async () => {
    const value = await encryptSession(payload());
    expect(value).not.toContain("access-token");
    expect(value).not.toContain("refresh-token");
    expect(value).not.toContain("Aziza");
  });

  it("returns null for a tampered cookie rather than trusting it", async () => {
    const value = (await encryptSession(payload()))!;
    const tampered = `${value.slice(0, -3)}abc`;
    await expect(decryptSession(tampered)).resolves.toBeNull();
  });

  it("returns null for a cookie encrypted under a different secret", async () => {
    const value = (await encryptSession(payload()))!;
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", `${SECRET}-rotated`);
    await expect(decryptSession(value)).resolves.toBeNull();
  });

  it("refuses to encrypt while no secret is configured", async () => {
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", "");
    await expect(encryptSession(payload())).resolves.toBeNull();
  });

  it("is httpOnly, lax and path-wide so no script can read it", () => {
    const options = sessionCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });
});

describe("safeReturnPath", () => {
  it("keeps an in-app path", () => {
    expect(safeReturnPath("/en/applications?status=open")).toBe(
      "/en/applications?status=open",
    );
  });

  it("rejects anything that could leave this origin", () => {
    for (const value of [
      "//evil.example",
      "https://evil.example",
      "/\\evil.example",
      "evil",
      "",
      null,
      undefined,
    ]) {
      expect(safeReturnPath(value), String(value)).toBeNull();
    }
  });
});

describe("isAccessTokenExpiring", () => {
  const now = Date.UTC(2026, 8, 5, 12, 0, 0);
  const nowSeconds = Math.floor(now / 1000);

  it("is false while the token has more than the skew left", () => {
    expect(isAccessTokenExpiring({ accessTokenExpiresAt: nowSeconds + 300 }, now)).toBe(
      false,
    );
  });

  it("is true inside the skew window, before the token actually expires", () => {
    expect(isAccessTokenExpiring({ accessTokenExpiresAt: nowSeconds + 30 }, now)).toBe(
      true,
    );
  });

  it("is false when the backend sent no expiry", () => {
    expect(isAccessTokenExpiring({}, now)).toBe(false);
  });
});

describe("toSessionPayload", () => {
  it("defaults an identity with no roles to a volunteer", () => {
    expect(
      toSessionPayload({ userId: "user-id", accessToken: "access-token" }),
    ).toEqual({
      userId: "user-id",
      accessToken: "access-token",
      roles: ["volunteer"],
    });
  });

  it("carries the backend roles through unchanged", () => {
    expect(
      toSessionPayload({
        userId: "user-id",
        accessToken: "access-token",
        roles: ["admin"],
      }).roles,
    ).toEqual(["admin"]);
  });
});

describe("isAccessTokenExpired", () => {
  const session = { accessTokenExpiresAt: 1_000 };

  it("is false while the token still has time left, even inside the refresh skew", () => {
    expect(isAccessTokenExpired(session, 900_000)).toBe(false);
    expect(isAccessTokenExpired(session, 999_000)).toBe(false);
  });

  it("is true once the expiry has passed", () => {
    expect(isAccessTokenExpired(session, 1_000_000)).toBe(true);
    expect(isAccessTokenExpired(session, 1_500_000)).toBe(true);
  });

  it("never expires a session that carries no expiry", () => {
    expect(isAccessTokenExpired({}, Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});

describe("isSessionStatus", () => {
  it("accepts only the statuses sign-in can carry", () => {
    expect(isSessionStatus("expired")).toBe(true);
    expect(isSessionStatus("telegram")).toBe(false);
    expect(isSessionStatus(undefined)).toBe(false);
  });
});
