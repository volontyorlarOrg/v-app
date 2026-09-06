import { describe, expect, it } from "vitest";
import type { ZodError } from "zod";

import {
  PASSWORD_MIN_LENGTH,
  credentialsFromFormData,
  fieldErrorsOf,
  logInSchema,
  signUpSchema,
} from "@/lib/auth/credentials";

const strong = "seven purple lanterns";

type ParseResult = { success: true } | { success: false; error: ZodError };

function messages(result: ParseResult) {
  return result.success ? {} : fieldErrorsOf(result.error);
}

describe("logInSchema", () => {
  it("accepts an address and any non-empty password, so an old password still reaches the backend", () => {
    expect(
      logInSchema.safeParse({ email: "a@example.org", password: "x" }).success,
    ).toBe(true);
  });

  it("names the missing field and the malformed address", () => {
    const result = logInSchema.safeParse({ email: "not-an-email", password: "" });
    expect(messages(result)).toEqual({ email: ["email"], password: ["required"] });
  });
});

describe("signUpSchema", () => {
  it("accepts a full name, an address and a passphrase", () => {
    expect(
      signUpSchema.safeParse({
        fullName: "  Malika Karimova  ",
        email: " malika@example.org ",
        password: strong,
      }),
    ).toMatchObject({
      success: true,
      data: { fullName: "Malika Karimova", email: "malika@example.org" },
    });
  });

  it("refuses a password shorter than the backend accepts", () => {
    const result = signUpSchema.safeParse({
      fullName: "Malika",
      email: "malika@example.org",
      password: "a".repeat(PASSWORD_MIN_LENGTH - 1),
    });
    expect(messages(result)).toEqual({ password: ["passwordShort"] });
  });

  it("refuses a name of nothing but spaces", () => {
    const result = signUpSchema.safeParse({
      fullName: "   ",
      email: "malika@example.org",
      password: strong,
    });
    expect(messages(result)).toEqual({ fullName: ["required"] });
  });
});

describe("credentialsFromFormData", () => {
  it("trims what is typed around a name and an address but never the password", () => {
    const formData = new FormData();
    formData.set("fullName", " Malika ");
    formData.set("email", " malika@example.org ");
    formData.set("password", ` ${strong} `);

    expect(credentialsFromFormData(formData)).toEqual({
      fullName: "Malika",
      email: "malika@example.org",
      password: ` ${strong} `,
    });
  });

  it("reads a missing field as empty rather than throwing", () => {
    expect(credentialsFromFormData(new FormData())).toEqual({
      fullName: "",
      email: "",
      password: "",
    });
  });
});
