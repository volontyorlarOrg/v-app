import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { AppFooter } from "@/components/app/app-footer";
import type { NotificationItem } from "@/components/app/notifications-menu";
import { Sidebar, type ShellUser } from "@/components/app/sidebar";
import { TabBar, type TabBarItem } from "@/components/app/tab-bar";
import { TopBar } from "@/components/app/top-bar";
import { navHref, tabBarRoutes } from "@/lib/routing/routes";

export function AppShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications: readonly NotificationItem[];
  children: ReactNode;
}) {
  const t = useTranslations("nav");

  const tabs: TabBarItem[] = tabBarRoutes.map((route) => ({
    key: route.key,
    href: navHref(route.key),
    label: t(route.key),
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-action focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-knockout"
      >
        {t("skipToContent")}
      </a>
      <Sidebar user={user} />
      <div className="workspace-backdrop flex min-h-full min-w-0 flex-1 flex-col bg-surface-sunk">
        <TopBar user={user} notifications={notifications} />
        <main
          id="main"
          className="mx-auto w-full max-w-[80rem] flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10"
        >
          {children}
        </main>
        <AppFooter />
      </div>
      <TabBar items={tabs} label={t("tabBarLabel")} />
    </div>
  );
}
