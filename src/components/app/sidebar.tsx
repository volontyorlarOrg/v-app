import { useTranslations } from "next-intl";

import {
  NotificationsMenu,
  type NotificationItem,
} from "@/components/app/notifications-menu";
import { SidebarIdentity } from "@/components/app/sidebar-identity";
import { SidebarNav, type SidebarItem } from "@/components/app/sidebar-nav";
import { BrandLockup } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { notificationLabels } from "@/lib/notifications/labels";
import {
  IDENTITY_ROUTE,
  accountNavRoutes,
  navHref,
  primaryNavRoutes,
} from "@/lib/routing/routes";

export type ShellUser = {
  name: string;
  initials: string;
  avatarUrl?: string;
  level: string | null;
  handle: string | null;
};

function navItems(
  routes: typeof primaryNavRoutes,
  t: (key: string) => string,
): SidebarItem[] {
  return routes.map((route) => ({
    key: route.key,
    href: navHref(route.key),
    label: t(route.key),
  }));
}

export function Sidebar({
  user,
  notifications,
}: {
  user: ShellUser;
  notifications: readonly NotificationItem[];
}) {
  const t = useTranslations("nav");

  return (
    <div className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:border-sidebar-line lg:bg-sidebar">
      <aside className="sticky top-0 flex h-dvh flex-col">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <Link
            href={navHref("dashboard")}
            className="-m-1 inline-flex min-w-0 flex-1 rounded-md p-1"
            aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
          >
            <BrandLockup name={ORGANIZATION_NAME} />
          </Link>
          <NotificationsMenu
            label={t("notifications.label")}
            title={t("notifications.title")}
            emptyLabel={t("notifications.empty")}
            markAllLabel={t("notifications.markAllRead")}
            items={notifications}
            labels={notificationLabels(t)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <SidebarNav items={navItems(primaryNavRoutes, t)} label={t("primaryLabel")} />
        </div>

        <div className="border-t border-sidebar-line px-3 py-3">
          <SidebarNav
            items={navItems(accountNavRoutes, t)}
            label={t("secondaryLabel")}
            lead={<SidebarIdentity user={user} label={t(IDENTITY_ROUTE)} />}
          />
        </div>
      </aside>
    </div>
  );
}
