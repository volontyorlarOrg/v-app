"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

export function useValidationMessage() {
  const t = useTranslations("validation");

  return useCallback(
    (key: string | undefined, max?: number, min?: number): string | undefined => {
      if (!key) return undefined;

      try {
        return t(key, { max: max ?? 0, min: min ?? 0 });
      } catch {
        return t("unknown");
      }
    },
    [t],
  );
}
