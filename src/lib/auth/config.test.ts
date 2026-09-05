import { describe, expect, it, vi } from "vitest";

import {
  AUTH_REQUEST_TIMEOUT_MS,
  AUTH_ROUTE_MAX_DURATION_SECONDS,
  apiBaseUrl,
  isAuthConfigured,
  sessionSecret,
} from "@/lib/auth/config";

const SECRET = "test-session-secret-of-at-least-32-characters";

describe("apiBaseUrl", () => {
  it("normalises a trailing slash away so paths do not double up", () => {
    vi.stubEnv("VOLONTYORLAR_API_URL", "https://api.example.org/");
    expect(apiBaseUrl()).toBe("https://api.example.org");
  });

  it("keeps a path prefix when the backend is mounted under one", () => {
    vi.stubEnv("VOLONTYORLAR_API_URL", "https://example.org/api/");
    expect(apiBaseUrl()).toBe("https://example.org/api");
  });

  it("refuses a value that is not an http origin rather than guessing", () => {
    for (const value of ["", "   ", "api.example.org", "ftp://example.org"]) {
      vi.stubEnv("VOLONTYORLAR_API_URL", value);
      expect(apiBaseUrl(), value).toBeNull();
    }
  });
});

describe("sessionSecret", () => {
  it("rejects a secret shorter than 32 characters", () => {
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", "too-short");
    expect(sessionSecret()).toBeNull();
  });

  it("accepts a secret long enough for the derived key", () => {
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", SECRET);
    expect(sessionSecret()).toBe(SECRET);
  });
});

describe("isAuthConfigured", () => {
  it("stays false until both the API origin and the secret are set", () => {
    vi.stubEnv("VOLONTYORLAR_API_URL", "");
    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", "");
    expect(isAuthConfigured()).toBe(false);

    vi.stubEnv("VOLONTYORLAR_API_URL", "http://localhost:4000");
    expect(isAuthConfigured()).toBe(false);

    vi.stubEnv("VOLONTYORLAR_SESSION_SECRET", SECRET);
    expect(isAuthConfigured()).toBe(true);
  });
});

describe("auth request budget", () => {
  it("outlasts a cold backend without exceeding the route's own limit", () => {
    expect(AUTH_REQUEST_TIMEOUT_MS).toBeGreaterThan(50_000);
    expect(AUTH_REQUEST_TIMEOUT_MS).toBeLessThan(AUTH_ROUTE_MAX_DURATION_SECONDS * 1000);
  });
});
