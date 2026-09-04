import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app/app-shell";
import type { NotificationItem } from "@/components/app/notifications-menu";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { isAuthConfigured } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/session.server";
import { localized } from "@/lib/opportunities/types";
import { levelFor } from "@/lib/record/levels";
import { navHref } from "@/lib/routing/routes";
import { sampleVolunteer } from "@/lib/sample/volunteer";

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

  const authConfigured = isAuthConfigured();
  const session = authConfigured ? await getSession() : null;

  if (authConfigured && !session) {
    redirect({ href: navHref("login"), locale });
  }

  const [record, notificationsT, format] = await Promise.all([
    getTranslations({ locale, namespace: "record" }),
    getTranslations({ locale, namespace: "notifications" }),
    getFormatter({ locale }),
  ]);

  const now = new Date();
  const volunteer = sampleVolunteer(now);

  const notifications: NotificationItem[] = volunteer.notifications.map(
    (notification) => ({
      id: notification.id,
      text: notificationsT(`kinds.${notification.kind}`, {
        title: localized(notification.subject, locale as Locale),
      }),
      time: format.relativeTime(new Date(notification.at), now),
      unread: notification.unread,
    }),
  );

  const displayName = session?.displayName?.trim();
  const name = displayName || volunteer.fullName;

  return (
    <AppShell
      user={{
        name,
        initials: initialsOf(name) || volunteer.initials,
        level: record(`level.${levelFor(volunteer.record.counts)}`),
      }}
      notifications={notifications}
      signOutLocale={authConfigured ? locale : null}
    >
      {children}
    </AppShell>
  );
}
