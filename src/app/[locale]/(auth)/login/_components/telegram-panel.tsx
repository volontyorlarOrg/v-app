"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import type { Locale } from "@/i18n/routing";

export function TelegramPanel({
  locale,
  next,
  disabled,
}: {
  locale: Locale;
  next: string | undefined;
  disabled: boolean;
}) {
  const t = useTranslations("auth.telegram");
  const [opened, setOpened] = useState(false);

  const params = new URLSearchParams({ locale });
  if (next) params.set("next", next);
  const startHref = `/api/auth/telegram/start?${params.toString()}`;

  function markOpened() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      setOpened(true);
    }
  }

  return (
    <Surface padding="md" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">{t("panelTitle")}</h2>
        <p className="text-sm leading-6 text-ink-muted">{t("panelIntro")}</p>
      </div>

      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-6 text-ink-muted marker:font-semibold marker:text-blue-deep">
        <li>{t("step1")}</li>
        <li>{t("step2")}</li>
        <li>{t("step3")}</li>
      </ol>

      {opened ? (
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-blue-deep">{t("checkTelegram")}</p>
          <p className="text-sm leading-6 text-ink-muted">{t("checkTelegramHelp")}</p>
          <Button asChild variant="secondary" size="lg" block>
            <a
              href={startHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markOpened}
            >
              {t("reopen")}
            </a>
          </Button>
        </div>
      ) : disabled ? (
        <Button size="lg" block disabled>
          <Send aria-hidden="true" className="size-4" />
          {t("method")}
        </Button>
      ) : (
        <Button asChild size="lg" block>
          <a
            href={startHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={markOpened}
          >
            <Send aria-hidden="true" className="size-4" />
            {t("method")}
          </a>
        </Button>
      )}
    </Surface>
  );
}
