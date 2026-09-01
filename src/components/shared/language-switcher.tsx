"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

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
      const query = searchParams.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { locale: next });
    });
  }

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <Languages
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-ink-muted"
      />
      <select
        aria-label={t("change")}
        value={current}
        disabled={isPending}
        onChange={(event) => change(event.target.value)}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-lg border border-line",
          "bg-transparent pr-3 pl-8 text-sm font-semibold text-ink",
          "transition-colors hover:border-blue-deep disabled:opacity-60",
        )}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} className="bg-surface text-ink">
            {localeLabels[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
