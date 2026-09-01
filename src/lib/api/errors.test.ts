import { describe, expect, it } from "vitest";
import {
  ApiError,
  classifyApiError,
  codeForStatus,
  errorMessageKey,
  isApiError,
} from "./errors";

describe("codeForStatus", () => {
  it.each([
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [400, "validation"],
    [422, "validation"],
    [429, "rateLimited"],
    [500, "server"],
    [502, "server"],
  ])("maps %i to %s", (status, expected) => {
    expect(codeForStatus(status)).toBe(expected);
  });
});

describe("classifyApiError", () => {
  it("passes an ApiError through unchanged", () => {
    const original = new ApiError("conflict", { status: 409 });
    expect(classifyApiError(original)).toBe(original);
  });

  it("treats a fetch TypeError as a network failure", () => {
    expect(classifyApiError(new TypeError("Failed to fetch")).code).toBe("network");
  });

  it("distinguishes a timeout from a generic abort", () => {
    expect(classifyApiError(new DOMException("timed out", "TimeoutError")).code).toBe(
      "timeout",
    );
    expect(classifyApiError(new DOMException("aborted", "AbortError")).code).toBe(
      "network",
    );
  });

  it("falls back to server for anything unrecognised, including non-Errors", () => {
    expect(classifyApiError(new Error("boom")).code).toBe("server");
    expect(classifyApiError("a thrown string").code).toBe("server");
    expect(classifyApiError(null).code).toBe("server");
  });
});

describe("ApiError", () => {
  it("hides internal codes from the user-facing surface", () => {
    expect(new ApiError("server").isUserFacing).toBe(false);
    expect(new ApiError("invalidResponse").isUserFacing).toBe(false);
    expect(new ApiError("notConfigured").isUserFacing).toBe(false);
  });

  it("allows codes that describe the user's own situation", () => {
    expect(new ApiError("forbidden").isUserFacing).toBe(true);
    expect(new ApiError("conflict").isUserFacing).toBe(true);
  });

  it("marks only transient failures as retryable", () => {
    expect(new ApiError("network").isRetryable).toBe(true);
    expect(new ApiError("timeout").isRetryable).toBe(true);
    expect(new ApiError("rateLimited").isRetryable).toBe(true);

    expect(new ApiError("forbidden").isRetryable).toBe(false);
    expect(new ApiError("notFound").isRetryable).toBe(false);
    expect(new ApiError("conflict").isRetryable).toBe(false);
    expect(new ApiError("validation").isRetryable).toBe(false);
  });

  it("freezes field errors so a consumer cannot mutate them", () => {
    const error = new ApiError("validation", {
      fieldErrors: { fullName: "required" },
    });

    expect(error.fieldErrors).toEqual({ fullName: "required" });
    expect(Object.isFrozen(error.fieldErrors)).toBe(true);
  });

  it("defaults field errors to an empty object rather than undefined", () => {
    expect(new ApiError("server").fieldErrors).toEqual({});
  });
});

describe("errorMessageKey", () => {
  it("returns the code for an ApiError", () => {
    expect(errorMessageKey(new ApiError("notFound"))).toBe("notFound");
  });

  it("degrades to server for anything else", () => {
    expect(errorMessageKey(new Error("x"))).toBe("server");
  });
});

describe("isApiError", () => {
  it("narrows correctly", () => {
    expect(isApiError(new ApiError("server"))).toBe(true);
    expect(isApiError(new Error("server"))).toBe(false);
  });
});
