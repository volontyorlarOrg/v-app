"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Language switcher.
 *
 * Route-preserving: it replaces the locale segment and keeps the rest of the
 * path *and the query string*. Sending the user to the home page on a language
 * change would throw away a filtered opportunity list — the thing they were
 * most likely reading when they realised they wanted another language.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common.language");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = (params.locale as Locale | undefined) ?? locales[0];

  function change(next: string) {
    if (next === current) return;

    startTransition(() => {
      // `pathname` is already locale-stripped by next-intl's hook. The query
      // string is carried across deliberately: switching language on a
      // filtered opportunity list must not silently discard the filters.
      const query = searchParams.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { locale: next });
    });
  }

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <Languages
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-muted"
      />
      <select
        aria-label={t("change")}
        value={current}
        disabled={isPending}
        onChange={(event) => change(event.target.value)}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-lg border border-signal-line",
          "bg-transparent pl-8 pr-3 text-sm font-bold text-ink",
          "transition-colors hover:border-teal disabled:opacity-60",
        )}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} className="bg-panel text-ink">
            {localeLabels[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
