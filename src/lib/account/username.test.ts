import { describe, expect, it } from "vitest";

import {
  normalizeUsername,
  usernameFormSchema,
  usernameFromFormData,
  usernameIdentity,
} from "@/lib/account/username";

function issues(value: string): string[] {
  const parsed = usernameFormSchema.safeParse({ username: value });
  return parsed.success ? [] : parsed.error.issues.map((issue) => issue.message);
}

describe("username input", () => {
  it("takes what a volunteer types and lowercases it without the leading at sign", () => {
    expect(normalizeUsername("  @Dilnoza_K ")).toBe("dilnoza_k");
  });

  it("accepts a normalised handle and hands the backend the normalised form", () => {
    const parsed = usernameFormSchema.parse({ username: "@Dilnoza_K" });
    expect(parsed.username).toBe("dilnoza_k");
  });

  it("names the rule a handle broke rather than refusing without saying why", () => {
    expect(issues("")).toEqual(["required"]);
    expect(issues("abc")).toEqual(["usernameShort"]);
    expect(issues("a".repeat(33))).toEqual(["usernameLong"]);
    expect(issues("dilnoza k")).toEqual(["usernameCharacters"]);
    expect(issues("dilnoza-k")).toEqual(["usernameCharacters"]);
  });

  it("reads a missing field as empty rather than throwing", () => {
    expect(usernameFromFormData(new FormData())).toEqual({ username: "" });
  });
});

describe("username identity", () => {
  it("uses the backend decision when an imported Telegram handle is editable", () => {
    expect(
      usernameIdentity({
        username: "dilnoza_k",
        usernameSource: "telegram",
        usernameEditable: true,
      }),
    ).toEqual({ username: "dilnoza_k", source: "telegram", editable: true });
  });

  it("uses the backend's editability decision", () => {
    expect(
      usernameIdentity({
        username: "user_9f2",
        usernameSource: "generated",
        usernameEditable: true,
      }),
    ).toEqual({ username: "user_9f2", source: "generated", editable: true });
  });
});
