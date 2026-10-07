import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { LoadErrorPanel, loadErrorLabels } from "@/components/app/load-error";
import type { NotificationItem } from "@/components/app/notifications-menu";
import { PanelErrorBoundary } from "@/components/app/panel-error-boundary";
import {
  CheckpointToasts,
  type CheckpointToast,
} from "@/components/checkpoints/checkpoint-toasts";
import { getMe } from "@/lib/api/account.server";
import { isApiError } from "@/lib/api/errors";
import { failureOf, type LoadFailure } from "@/lib/api/load.server";
import { listNotifications } from "@/lib/api/notifications.server";
import { getRecord } from "@/lib/api/record.server";
import { requireSession } from "@/lib/api/session.server";
import type { Locale } from "@/i18n/routing";
import {
  activityNotification,
  checkpointNotification,
  mergeNotificationName,
} from "@/lib/notifications/types";
import { initialsOf } from "@/lib/profile/initials";
import {
  applicationHref,
  historyHref,
  localePath,
  navHref,
} from "@/lib/routing/routes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHECKPOINT_TOAST_WINDOW_MS = 5 * 60_000;

export default async function VolunteerLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireSession();
  const [record, common, settings, nav, format, checkpointsT] = await Promise.all([
    getTranslations({ locale, namespace: "record" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "settings" }),
    getTranslations({ locale, namespace: "nav" }),
    getFormatter({ locale }),
    getTranslations({ locale, namespace: "checkpoints" }),
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
  if (me.usernameSource === "generated") {
    redirect(localePath(locale as Locale, "welcome"));
  }
  const name =
    me.displayName?.trim() || session.displayName?.trim() || common("volunteer");
  const now = new Date();
  const checkpointToasts: CheckpointToast[] = [];
  const notifications: NotificationItem[] = notificationList.items.map((item) => {
    const time = format.relativeTime(new Date(item.at), now);
    const checkpoint = checkpointNotification(item.kind, item.data);
    if (checkpoint) {
      const [only] = checkpoint.keys;
      const xp = format.number(checkpoint.xp);
      const title = nav(
        item.kind === "checkpoint.ready"
          ? "notifications.checkpoint.readyTitle"
          : "notifications.checkpoint.title",
        {
          count: checkpoint.keys.length,
        },
      );
      const body =
        checkpoint.keys.length === 1 && only
          ? nav(
              item.kind === "checkpoint.ready"
                ? "notifications.checkpoint.readyOne"
                : "notifications.checkpoint.one",
              {
                name: checkpointsT(`items.${only}.title`),
                xp,
              },
            )
          : nav(
              item.kind === "checkpoint.ready"
                ? "notifications.checkpoint.readyMany"
                : "notifications.checkpoint.many",
              { xp },
            );
      if (
        item.unread &&
        now.getTime() - new Date(item.at).getTime() < CHECKPOINT_TOAST_WINDOW_MS
      ) {
        checkpointToasts.push({ id: item.id, title, body });
      }
      return {
        id: item.id,
        title,
        body,
        time,
        unread: item.unread,
        href: navHref("checkpoints"),
      };
    }
    const merge = mergeNotificationName(item.kind);
    if (merge) {
      return {
        id: item.id,
        title: settings(`mergeNotifications.${merge}`),
        body: settings("mergeNotifications.body"),
        time,
        unread: item.unread,
        href: navHref("settings"),
      };
    }

    const activity = activityNotification(item.kind, item.data);
    if (activity) {
      const href = activity.applicationId
        ? applicationHref(activity.applicationId)
        : item.kind === "attendance.resolved"
          ? historyHref()
          : undefined;
      return {
        id: item.id,
        title: nav(`notifications.activity.${activity.name}.title`),
        body: nav(`notifications.activity.${activity.name}.body`),
        time,
        unread: item.unread,
        ...(href ? { href } : {}),
      };
    }

    return {
      id: item.id,
      title: item.title,
      body: item.body,
      time,
      unread: item.unread,
    };
  });

  return (
    <AppShell
      user={{
        name,
        initials: initialsOf(name),
        avatarUrl: me.avatarUrl,
        level: record(`level.${volunteerRecord.level}`),
        handle: me.username,
      }}
      notifications={notifications}
      signOutLocale={locale}
    >
      <CheckpointToasts items={checkpointToasts} />
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
