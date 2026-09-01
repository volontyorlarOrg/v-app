"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import type { Locale } from "@/i18n/routing";

/**
 * The Telegram sign-in control.
 *
 * Client-side only because it needs to know whether the browser is a pointer
 * device: on desktop the bot opens in a new tab and this panel switches to
 * "check Telegram"; on touch the page hands itself to the Telegram app.
 *
 * It deliberately does not poll for completion. The user finishes in the tab
 * Telegram opens — see the route handler for why that is a security property
 * rather than an inconvenience.
 */
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

  function open() {
    // `matchMedia` rather than a user-agent sniff: what matters is whether
    // this device has a hover-capable pointer, not what it calls itself.
    const isPointerDevice =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (isPointerDevice) {
      window.open(startHref, "_blank", "noopener,noreferrer");
      setOpened(true);
    } else {
      // A full page navigation, not `router.push`. The href is an internal
      // route handler, but it answers with a redirect to `t.me` — a
      // client-side navigation cannot follow a response out to another origin,
      // and on touch the point is to hand the device to the Telegram app.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = startHref;
    }
  }

  return (
    <Surface padding="md" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold">{t("panelTitle")}</h2>
        <p className="text-sm leading-6 text-muted">{t("panelIntro")}</p>
      </div>

      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-6 text-muted marker:font-bold marker:text-teal">
        <li>{t("step1")}</li>
        <li>{t("step2")}</li>
        <li>{t("step3")}</li>
      </ol>

      {opened ? (
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          <p className="text-sm font-bold text-teal">{t("checkTelegram")}</p>
          <p className="text-sm leading-6 text-muted">{t("checkTelegramHelp")}</p>
          <Button variant="secondary" size="lg" block onClick={open}>
            {t("reopen")}
          </Button>
        </div>
      ) : (
        <Button size="lg" block onClick={open} disabled={disabled}>
          <Send aria-hidden="true" className="size-4" />
          {t("method")}
        </Button>
      )}
    </Surface>
  );
}
