import { describe, expect, it } from "vitest";

import { relativeRedirect, withQuery } from "@/lib/auth/redirect";

describe("relativeRedirect", () => {
  it("answers with a relative Location so the browser stays on its own origin", async () => {
    const response = relativeRedirect("/login");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(await response.text()).toBe("");
  });

  it("can carry cookies like any other response", () => {
    const response = relativeRedirect("/dashboard", 307);
    response.cookies.set("probe", "1", { path: "/" });
    expect(response.headers.get("set-cookie")).toContain("probe=1");
  });
});

describe("withQuery", () => {
  it("appends an encoded query and leaves a path without one untouched", () => {
    expect(withQuery("/login", { telegram: "expired" })).toBe("/login?telegram=expired");
    expect(withQuery("/login", {})).toBe("/login");
  });
});
