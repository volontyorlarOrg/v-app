import { useTranslations } from "next-intl";

import { AccountMenu } from "@/components/app/account-menu";
import {
  NotificationsMenu,
  type NotificationItem,
} from "@/components/app/notifications-menu";
import {
  accountMenuItems,
  accountMenuLabels,
  type ShellUser,
} from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { BrandLockup } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { navHref } from "@/lib/routing/routes";

export function MobileHeader({
  user,
  notifications,
  signOutLocale,
}: {
  user: ShellUser;
  notifications: readonly NotificationItem[];
  signOutLocale: string | null;
}) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm lg:hidden">
      <div className="flex min-h-14 items-center gap-2 px-4 sm:px-6">
        <Link
          href={navHref("dashboard")}
          className="-m-1 rounded-lg p-1"
          aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
        >
          <BrandLockup name={ORGANIZATION_NAME} />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle label={t("themeLabel")} />
          <NotificationsMenu
            label={t("notifications.label")}
            title={t("notifications.title")}
            emptyLabel={t("notifications.empty")}
            markAllLabel={t("notifications.markAllRead")}
            items={notifications}
          />
          <AccountMenu
            variant="avatar"
            labels={accountMenuLabels(t)}
            name={user.name}
            initials={user.initials}
            handle={user.handle}
            level={user.level}
            items={accountMenuItems(t)}
            signOutLocale={signOutLocale}
            loginHref={navHref("login")}
          />
        </div>
      </div>
    </header>
  );
}
