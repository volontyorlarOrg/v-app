import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import {
  isTelegramStatus,
  isTrustedAuthorizationUrl,
  telegramAuthorizationSchema,
  telegramStatusForError,
  telegramStatusForProviderError,
} from "@/lib/auth/telegram";

describe("telegramAuthorizationSchema", () => {
  it("accepts what the backend returns", () => {
    expect(
      telegramAuthorizationSchema.safeParse({
        authorizationUrl:
          "https://oauth.telegram.org/auth?client_id=8765988774&state=abc",
        state: "5s5nJ0oGjWQrn9bkQ5o1CqTQ0Xj3nGgLZ3nQ1p2r3s4",
        expiresAt: "2026-09-05T12:10:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("rejects a state too short to have been minted by the backend", () => {
    expect(
      telegramAuthorizationSchema.safeParse({
        authorizationUrl: "https://oauth.telegram.org/auth",
        state: "short",
      }).success,
    ).toBe(false);
  });
});

describe("isTrustedAuthorizationUrl", () => {
  it("trusts Telegram's authorization origin", () => {
    expect(
      isTrustedAuthorizationUrl("https://oauth.telegram.org/auth?state=x", null),
    ).toBe(true);
  });

  it("trusts the configured backend origin so a stub can stand in for Telegram", () => {
    expect(
      isTrustedAuthorizationUrl(
        "http://127.0.0.1:3212/oauth/auth?state=x",
        "http://127.0.0.1:3212",
      ),
    ).toBe(true);
  });

  it("refuses every other origin and anything that is not a URL", () => {
    expect(
      isTrustedAuthorizationUrl("https://oauth.telegram.org.evil.example/auth", null),
    ).toBe(false);
    expect(isTrustedAuthorizationUrl("https://evil.example/auth", "http://127.0.0.1:3212")).toBe(
      false,
    );
    expect(isTrustedAuthorizationUrl("not a url", null)).toBe(false);
  });
});

describe("telegramStatusForProviderError", () => {
  it("treats a declined consent as cancelled and anything else as unavailable", () => {
    expect(telegramStatusForProviderError("access_denied")).toBe("cancelled");
    expect(telegramStatusForProviderError("server_error")).toBe("unavailable");
  });
});

describe("telegramStatusForError", () => {
  it("asks for the phone number when the backend refused for that reason", () => {
    expect(
      telegramStatusForError(
        new ApiError("forbidden", { status: 403, details: { code: "phoneRequired" } }),
      ),
    ).toBe("phoneRequired");
  });

  it("restarts an unknown, reused or malformed sign-in", () => {
    expect(
      telegramStatusForError(
        new ApiError("unauthenticated", { status: 401, details: { code: "invalidLoginState" } }),
      ),
    ).toBe("expired");
    expect(telegramStatusForError(new ApiError("validation", { status: 422 }))).toBe(
      "expired",
    );
  });

  it("reports everything else as unavailable", () => {
    expect(telegramStatusForError(new ApiError("server", { status: 503 }))).toBe(
      "unavailable",
    );
    expect(telegramStatusForError(new Error("boom"))).toBe("unavailable");
  });
});

describe("isTelegramStatus", () => {
  it("recognises only the statuses the route handlers set", () => {
    for (const status of ["expired", "unavailable", "cancelled", "phoneRequired"]) {
      expect(isTelegramStatus(status)).toBe(true);
    }
    expect(isTelegramStatus("signed-in")).toBe(false);
    expect(isTelegramStatus(undefined)).toBe(false);
  });
});
