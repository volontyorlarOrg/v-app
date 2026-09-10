import { z } from "zod";

export const USERNAME_SOURCES = ["generated", "custom", "telegram"] as const;

export type UsernameSource = (typeof USERNAME_SOURCES)[number];

export const USERNAME_MIN_LENGTH = 5;
export const USERNAME_MAX_LENGTH = 32;
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;

export type UsernameIdentity = {
  username: string;
  source: UsernameSource;
  editable: boolean;
};

export const usernameFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "required")
    .transform(normalizeUsername)
    .pipe(
      z
        .string()
        .min(USERNAME_MIN_LENGTH, "usernameShort")
        .max(USERNAME_MAX_LENGTH, "usernameLong")
        .regex(USERNAME_PATTERN, "usernameCharacters"),
    ),
});

export type UsernameFormValues = z.input<typeof usernameFormSchema>;

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function usernameFromFormData(formData: FormData): UsernameFormValues {
  const value = formData.get("username");
  return { username: typeof value === "string" ? value : "" };
}

export function usernameIdentity(account: {
  username: string;
  usernameSource: UsernameSource;
  usernameEditable: boolean;
}): UsernameIdentity {
  return {
    username: account.username,
    source: account.usernameSource,
    editable: account.usernameEditable,
  };
}
