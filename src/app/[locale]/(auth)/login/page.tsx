import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TriangleAlert } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { isAuthConfigured } from "@/lib/auth/session.server";
import { safeReturnPath } from "@/lib/auth/session";
import { isTelegramStatus } from "@/features/auth/telegram";
import { Surface } from "@/components/ui/surface";
import { TelegramPanel } from "./_components/telegram-panel";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const searchParams = await props.searchParams;
  const [t, configured] = await Promise.all([
    getTranslations("auth"),
    isAuthConfigured(),
  ]);

  const rawNext = searchParams.next;
  const next = safeReturnPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  const rawStatus = searchParams.telegram;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const telegramStatus = isTelegramStatus(status) ? status : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/brand/mark-blue.svg"
          alt=""
          width={56}
          height={56}
          priority
          className="size-14"
        />
        <h1 className="text-2xl">{t("signIn.title")}</h1>
        <p className="text-sm leading-6 text-ink-muted">{t("signIn.subtitle")}</p>
      </header>

      {telegramStatus ? (
        <Surface
          tone="quiet"
          padding="sm"
          role="alert"
          className="flex items-start gap-3 border-danger/40"
        >
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-danger"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-ink">
              {t(`telegram.${telegramStatus}Title`)}
            </p>
            <p className="text-xs leading-6 text-ink-muted">
              {t(`telegram.${telegramStatus}Body`)}
            </p>
          </div>
        </Surface>
      ) : null}

      {!configured ? (
        <Surface
          tone="quiet"
          padding="sm"
          role="note"
          className="flex flex-col gap-1 border-blue-deep/25"
        >
          <p className="text-sm font-bold text-blue-deep">{t("notConfigured.title")}</p>
          <p className="text-xs leading-6 text-ink-muted">{t("notConfigured.body")}</p>
        </Surface>
      ) : null}

      <TelegramPanel
        locale={locale as Locale}
        next={next ?? undefined}
        disabled={!configured}
      />

      <p className="text-center text-xs leading-6 text-ink-muted">
        {t("signIn.createsAccount")}
      </p>
    </div>
  );
}
