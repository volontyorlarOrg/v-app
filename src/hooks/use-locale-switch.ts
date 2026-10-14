"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { Locale } from "@/i18n/routing";
import { writeLocaleChoice } from "@/lib/preferences";

export function useLocaleSwitch() {
  const active = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === active) return;
    writeLocaleChoice(locale);
    startTransition(() => router.refresh());
  }

  return { active, pending, choose };
}
