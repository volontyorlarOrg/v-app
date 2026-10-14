import { notFound, redirect } from "next/navigation";
import { describe, expect, it } from "vitest";

import { failedResult, resultFromError } from "@/lib/api/action-result";
import { ApiError } from "@/lib/api/errors";

function thrownBy(run: () => never): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
}

describe("resultFromError", () => {
  it("lets a redirect through, so an ended session reaches sign-in from a write", () => {
    const ended = thrownBy(() => redirect("/api/auth/session/expired"));
    expect(() => resultFromError(ended)).toThrow(ended as Error);
  });

  it("lets a not-found through as well", () => {
    const missing = thrownBy(() => notFound());
    expect(() => resultFromError(missing)).toThrow(missing as Error);
  });

  it("answers with the backend's code and its field errors", () => {
    const refused = new ApiError("validation", {
      status: 422,
      details: { code: "usernameTaken", errors: { username: ["usernameTaken"] } },
    });
    expect(resultFromError(refused)).toEqual(
      failedResult("usernameTaken", { username: ["usernameTaken"] }),
    );
  });

  it("falls back to the transport code, and to server for anything else", () => {
    expect(resultFromError(new ApiError("timeout"))).toEqual(failedResult("timeout"));
    expect(resultFromError(new Error("boom"))).toEqual(failedResult("server"));
  });
});
