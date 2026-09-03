import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app/app-shell";
import type { NotificationItem } from "@/components/app/notifications-menu";
import type { Locale } from "@/i18n/routing";
import { localized } from "@/lib/opportunities/types";
import { levelFor } from "@/lib/record/levels";
import { sampleVolunteer } from "@/lib/sample/volunteer";

export const dynamic = "force-dynamic";

export default async function VolunteerLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

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

  return (
    <AppShell
      user={{
        name: volunteer.fullName,
        initials: volunteer.initials,
        level: record(`level.${levelFor(volunteer.record.counts)}`),
      }}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
