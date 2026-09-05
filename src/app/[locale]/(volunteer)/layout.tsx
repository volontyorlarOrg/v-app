import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app/app-shell";
import { LoadErrorPanel } from "@/components/app/load-error";
import type { NotificationItem } from "@/components/app/notifications-menu";
import { PanelErrorBoundary } from "@/components/app/panel-error-boundary";
import { buttonClass } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { getMe } from "@/lib/api/account.server";
import { listNotifications } from "@/lib/api/notifications.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import { levelFor } from "@/lib/record/levels";
import { localePath } from "@/lib/routing/routes";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => [...part][0] ?? "").join("");
  return letters ? letters.toLocaleUpperCase() : "";
}

export const dynamic = "force-dynamic";

export default async function VolunteerLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireSession();
  const [record, common, format] = await Promise.all([
    getTranslations({ locale, namespace: "record" }),
    getTranslations({ locale, namespace: "common" }),
    getFormatter({ locale }),
  ]);
  const errorLabels = {
    title: common("error.title"),
    body: common("error.body"),
    retry: common("error.retry"),
  };

  let shell: Awaited<ReturnType<typeof loadShell>>;
  try {
    shell = await loadShell();
  } catch (error) {
    console.error("[panel] the shell could not load", error);
    return (
      <main id="main" className="container-page flex flex-1 flex-col py-8">
        <LoadErrorPanel
          labels={errorLabels}
          action={
            <a
              href={localePath(locale as Locale, "dashboard")}
              className={buttonClass({ size: "sm" })}
            >
              {errorLabels.retry}
            </a>
          }
        />
      </main>
    );
  }

  const [me, volunteerRecord, notificationList] = shell;
  const name =
    me.displayName?.trim() || session.displayName?.trim() || common("volunteer");
  const now = new Date();
  const notifications: NotificationItem[] = notificationList.items.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    time: format.relativeTime(new Date(item.at), now),
    unread: item.unread,
  }));

  return (
    <AppShell
      user={{
        name,
        initials: initialsOf(name),
        level: record(`level.${levelFor(volunteerRecord.counts)}`),
      }}
      notifications={notifications}
      signOutLocale={locale}
    >
      <PanelErrorBoundary labels={errorLabels}>{children}</PanelErrorBoundary>
    </AppShell>
  );
}

function loadShell() {
  return Promise.all([getMe(), getRecord(), listNotifications()]);
}
