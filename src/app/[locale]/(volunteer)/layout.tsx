import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app/app-shell";
import { LoadErrorPanel, loadErrorLabels } from "@/components/app/load-error";
import type { NotificationItem } from "@/components/app/notifications-menu";
import { PanelErrorBoundary } from "@/components/app/panel-error-boundary";
import { getMe } from "@/lib/api/account.server";
import { isApiError } from "@/lib/api/errors";
import { failureOf, type LoadFailure } from "@/lib/api/load.server";
import { listNotifications } from "@/lib/api/notifications.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import { mergeNotificationName } from "@/lib/notifications/types";
import { initialsOf } from "@/lib/profile/initials";
import { levelFor } from "@/lib/record/levels";
import { navHref } from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function VolunteerLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireSession();
  const [record, common, settings, format] = await Promise.all([
    getTranslations({ locale, namespace: "record" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "settings" }),
    getFormatter({ locale }),
  ]);
  const errorLabels = loadErrorLabels(common);

  let shell: Awaited<ReturnType<typeof loadShell>>;
  try {
    shell = await loadShell();
  } catch (error) {
    if (!isApiError(error)) throw error;
    console.error("[panel] the shell could not load", error);
    return <ShellError failure={failureOf(error)} labels={errorLabels} />;
  }

  const [me, volunteerRecord, notificationList] = shell;
  const name =
    me.displayName?.trim() || session.displayName?.trim() || common("volunteer");
  const now = new Date();
  const notifications: NotificationItem[] = notificationList.items.map((item) => {
    const merge = mergeNotificationName(item.kind);
    return {
      id: item.id,
      title: merge ? settings(`mergeNotifications.${merge}`) : item.title,
      body: merge ? settings("mergeNotifications.body") : item.body,
      time: format.relativeTime(new Date(item.at), now),
      unread: item.unread,
      ...(merge ? { href: navHref("settings") } : {}),
    };
  });

  return (
    <AppShell
      user={{
        name,
        initials: initialsOf(name),
        level: record(`level.${levelFor(volunteerRecord.counts)}`),
        handle: me.username,
      }}
      notifications={notifications}
      signOutLocale={locale}
    >
      <PanelErrorBoundary labels={errorLabels}>{children}</PanelErrorBoundary>
    </AppShell>
  );
}

function ShellError({
  failure,
  labels,
}: {
  failure: LoadFailure;
  labels: ReturnType<typeof loadErrorLabels>;
}) {
  return (
    <main id="main" className="container-page flex flex-1 flex-col py-8">
      <LoadErrorPanel failure={failure} labels={labels} />
    </main>
  );
}

function loadShell() {
  return Promise.all([getMe(), getRecord(), listNotifications()]);
}
