import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import {
  GOOGLE_AUTHORIZATION_ENDPOINT,
  googleAuthorizationUrl,
  googleChallengeSchema,
  googleRedirectUri,
  googleStatusForError,
  googleStatusForProviderError,
  isAcceptableGooglePostOrigin,
  isGoogleStatus,
} from "@/lib/auth/google";

const challenge = {
  state: "5s5nJ0oGjWQrn9bkQ5o1CqTQ0Xj3nGgLZ3nQ1p2r3s4",
  nonce: "Cw8kZq0LmJ4vR7tY2aB1Xf",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("googleChallengeSchema", () => {
  it("accepts a challenge with an optional expiry", () => {
    expect(
      googleChallengeSchema.safeParse({
        ...challenge,
        expiresAt: "2026-09-07T12:10:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("rejects a state or nonce too short to have been minted by the backend", () => {
    expect(
      googleChallengeSchema.safeParse({ ...challenge, state: "short" }).success,
    ).toBe(false);
    expect(
      googleChallengeSchema.safeParse({ ...challenge, nonce: "short" }).success,
    ).toBe(false);
  });
});

describe("googleAuthorizationUrl", () => {
  it("asks Google for an ID token posted back to the app, carrying the backend's nonce", () => {
    const url = new URL(
      googleAuthorizationUrl({
        clientId: "123-abc.apps.googleusercontent.com",
        redirectUri: "https://app.example.org/api/auth/google/callback",
        state: challenge.state,
        nonce: challenge.nonce,
        locale: "uz",
      }),
    );

    expect(`${url.origin}${url.pathname}`).toBe(GOOGLE_AUTHORIZATION_ENDPOINT);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "123-abc.apps.googleusercontent.com",
      redirect_uri: "https://app.example.org/api/auth/google/callback",
      response_type: "id_token",
      response_mode: "form_post",
      scope: "openid email profile",
      state: challenge.state,
      nonce: challenge.nonce,
      prompt: "select_account",
      hl: "uz",
    });
  });
});

describe("googleRedirectUri", () => {
  it("prefers the verified site origin over the origin of the request", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.org");
    expect(googleRedirectUri("http://localhost:3001")).toBe(
      "https://app.example.org/api/auth/google/callback",
    );
  });

  it("falls back to the request origin while no site origin is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(googleRedirectUri("http://localhost:3001")).toBe(
      "http://localhost:3001/api/auth/google/callback",
    );
  });
});

describe("googleStatusForProviderError", () => {
  it("treats a declined consent as cancelled and anything else as unavailable", () => {
    expect(googleStatusForProviderError("access_denied")).toBe("cancelled");
    expect(googleStatusForProviderError("server_error")).toBe("unavailable");
  });
});

describe("googleStatusForError", () => {
  it("names a closed account and a rate limit before restarting the sign-in", () => {
    expect(
      googleStatusForError(
        new ApiError("forbidden", {
          status: 403,
          details: { code: "accountDisabled" },
        }),
      ),
    ).toBe("disabled");
    expect(googleStatusForError(new ApiError("rateLimited", { status: 429 }))).toBe(
      "tooMany",
    );
  });

  it("restarts an unknown, reused or refused sign-in", () => {
    expect(
      googleStatusForError(
        new ApiError("unauthenticated", {
          status: 401,
          details: { code: "invalidGoogleCredential" },
        }),
      ),
    ).toBe("expired");
    expect(googleStatusForError(new ApiError("validation", { status: 422 }))).toBe(
      "expired",
    );
  });

  it("names a Google identity that cannot be joined to an existing account", () => {
    for (const code of [
      "emailUnavailable",
      "googleIdentityConflict",
      "googleEmailLinkRequiresVerification",
    ]) {
      expect(
        googleStatusForError(
          new ApiError("conflict", { status: 409, details: { code } }),
        ),
      ).toBe("conflict");
    }
  });

  it("restarts a refused Google state or credential by its backend code", () => {
    for (const code of ["invalidGoogleState", "invalidGoogleCredential"]) {
      expect(
        googleStatusForError(
          new ApiError("unauthenticated", { status: 401, details: { code } }),
        ),
      ).toBe("expired");
    }
  });

  it("reports a disabled provider and an unavailable key service as unavailable", () => {
    for (const code of [
      "googleAuthUnavailable",
      "googleUnavailable",
      "authRateLimitUnavailable",
    ]) {
      expect(
        googleStatusForError(
          new ApiError("server", { status: 503, details: { code } }),
        ),
      ).toBe("unavailable");
    }
  });

  it("reports everything else as unavailable", () => {
    expect(googleStatusForError(new ApiError("server", { status: 503 }))).toBe(
      "unavailable",
    );
    expect(googleStatusForError(new Error("boom"))).toBe("unavailable");
  });
});

describe("isGoogleStatus", () => {
  it("recognises only the statuses the route handlers set", () => {
    for (const status of [
      "unavailable",
      "expired",
      "cancelled",
      "disabled",
      "tooMany",
    ]) {
      expect(isGoogleStatus(status)).toBe(true);
    }
    expect(isGoogleStatus("signed-in")).toBe(false);
    expect(isGoogleStatus(undefined)).toBe(false);
  });
});

describe("isAcceptableGooglePostOrigin", () => {
  const deployed = {
    host: "app.volontyorlar.uz",
    hostname: "app.volontyorlar.uz",
    protocol: "https:",
  };
  const local = { host: "localhost:3001", hostname: "localhost", protocol: "http:" };

  it("accepts the post Google makes from its own origin", () => {
    expect(
      isAcceptableGooglePostOrigin({
        origin: "https://accounts.google.com",
        ...deployed,
      }),
    ).toBe(true);
  });

  it("accepts a request that carries no origin at all", () => {
    expect(isAcceptableGooglePostOrigin({ origin: null, ...deployed })).toBe(true);
  });

  it("accepts a same-origin post", () => {
    expect(
      isAcceptableGooglePostOrigin({
        origin: "https://app.volontyorlar.uz",
        ...deployed,
      }),
    ).toBe(true);
  });

  it("accepts the opaque origin Chrome sends to a loopback HTTP callback", () => {
    expect(isAcceptableGooglePostOrigin({ origin: "null", ...local })).toBe(true);
    expect(
      isAcceptableGooglePostOrigin({
        origin: "null",
        host: "127.0.0.1:3001",
        hostname: "127.0.0.1",
        protocol: "http:",
      }),
    ).toBe(true);
  });

  it("refuses an opaque origin outside non-production loopback HTTP", () => {
    expect(isAcceptableGooglePostOrigin({ origin: "null", ...deployed })).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    expect(isAcceptableGooglePostOrigin({ origin: "null", ...local })).toBe(false);
  });

  it("refuses unrelated origins", () => {
    expect(
      isAcceptableGooglePostOrigin({
        origin: "https://evil.example",
        ...deployed,
      }),
    ).toBe(false);
    expect(
      isAcceptableGooglePostOrigin({
        origin: "https://evil.example",
        ...local,
      }),
    ).toBe(false);
  });
});
