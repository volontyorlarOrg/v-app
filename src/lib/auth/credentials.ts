import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const FULL_NAME_MAX_LENGTH = 120;
export const EMAIL_MAX_LENGTH = 254;

const emailField = z
  .string()
  .trim()
  .min(1, "required")
  .max(EMAIL_MAX_LENGTH, "emailLong")
  .pipe(z.email("email"));

export const logInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "required").max(PASSWORD_MAX_LENGTH, "passwordLong"),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "required").max(FULL_NAME_MAX_LENGTH, "nameLong"),
  email: emailField,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "passwordShort")
    .max(PASSWORD_MAX_LENGTH, "passwordLong"),
});

export type LogInValues = z.input<typeof logInSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;

export const CREDENTIAL_FIELDS = ["fullName", "email", "password"] as const;
export type CredentialField = (typeof CREDENTIAL_FIELDS)[number];

export function credentialsFromFormData(formData: FormData) {
  const read = (name: CredentialField) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    fullName: read("fullName").trim(),
    email: read("email").trim(),
    password: read("password"),
  };
}

export function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  const output: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    output[field] = [...(output[field] ?? []), issue.message];
  }

  return output;
}
