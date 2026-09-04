import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import {
  NotificationsMenu,
  type NotificationItem,
} from "@/components/app/notifications-menu";
import type { ShellUser } from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { BrandMark } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { navHref } from "@/lib/routing/routes";

const signOutClass =
  "flex min-h-11 w-full items-center gap-2 rounded-md border-t border-border px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunk hover:text-primary-ink";

export function TopBar({
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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex min-h-14 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href={navHref("dashboard")}
          className="-m-1 rounded-lg p-1 text-primary lg:hidden"
          aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
        >
          <BrandMark className="size-8" />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <NotificationsMenu
            label={t("notifications.label")}
            title={t("notifications.title")}
            emptyLabel={t("notifications.empty")}
            markAllLabel={t("notifications.markAllRead")}
            items={notifications}
          />
          <LocaleSwitcher label={t("languageLabel")} />
          <ThemeToggle label={t("themeLabel")} />
          <UserMenu
            label={t("userMenu.label")}
            name={user.name}
            initials={user.initials}
            items={[{ href: navHref("profile"), label: t("profile") }]}
            signOut={
              signOutLocale ? (
                <SignOutForm
                  locale={signOutLocale}
                  label={t("signOut")}
                  className={signOutClass}
                />
              ) : (
                <Link href={navHref("login")} className={signOutClass}>
                  <LogOut aria-hidden="true" className="size-4" />
                  {t("signOut")}
                </Link>
              )
            }
          />
        </div>
      </div>
    </header>
  );
}
