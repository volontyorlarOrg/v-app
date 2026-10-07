import { describe, expect, it } from "vitest";
import { apiFailureLog } from "@/lib/security/api-failure-log";

describe("API failure logs", () => {
  it("keeps untrusted lines escaped and omits query values, invalid IDs and error details", () => {
    const output = apiFailureLog("GET", "/opportunities/one\r\nforged?token=secret", {
      code: "server\nforged",
      requestId: "forged\nline",
      status: 503,
      details: { password: "secret" },
    } as never);
    expect(output).not.toMatch(/[\r\n]/);
    expect(output).not.toContain("secret");
    expect(output).not.toContain("password");
    expect(JSON.parse(output)).toEqual({
      event: "api.failure",
      method: "GET",
      path: "/opportunities/one\r\nforged",
      code: "server\nforged",
      status: 503,
    });
  });

  it("bounds input and retains the generated request ID", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    const output = JSON.parse(
      apiFailureLog("G".repeat(100), "/".repeat(1000), {
        code: "a".repeat(1000),
        requestId: id,
      }),
    );
    expect(output.path).toHaveLength(200);
    expect(output.code).toHaveLength(100);
    expect(output.method).toHaveLength(10);
    expect(output.requestId).toBe(id);
  });
});
