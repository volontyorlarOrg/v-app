"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

/**
 * Turns a validation *key* into a translated sentence.
 *
 * This is the piece that makes the "stable error codes, not backend English"
 * rule work in practice. Zod schemas in this codebase carry keys as their
 * messages (`"required"`, `"tooLong"`, `"invalidPhone"`) because a schema is a
 * module, not a component, and cannot call `useTranslations`. This hook is
 * where the key becomes text in the reader's language.
 *
 * An unrecognised key falls back to a generic message rather than rendering
 * the key itself — a volunteer should never see `tooShort` on screen.
 */
export function useValidationMessage() {
  const t = useTranslations("validation");

  return useCallback(
    (key: string | undefined, max?: number, min?: number): string | undefined => {
      if (!key) return undefined;

      try {
        // `tooLong`/`tooShort` need the bound to make sense; the rest do not
        // and ignore the extra values harmlessly.
        return t(key, { max: max ?? 0, min: min ?? 0 });
      } catch {
        return t("unknown");
      }
    },
    [t],
  );
}
