import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  NotificationsMenu,
  type NotificationItem,
} from "@/components/app/notifications-menu";
import { SidebarNav, type SidebarItem } from "@/components/app/sidebar-nav";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { BrandLockup } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { accountNavRoutes, navHref, primaryNavRoutes } from "@/lib/routing/routes";

export type ShellUser = {
  name: string;
  initials: string;
  level: string;
  handle: string | null;
};

const FOOTER_ROW =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-shell-muted transition-colors hover:bg-shell-raised hover:text-shell-ink";

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

function Identity({ user }: { user: ShellUser }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-shell-line bg-shell-raised/60 px-3 py-2.5">
      <Avatar aria-hidden="true" className="size-10 shrink-0 ring-2 ring-accent/70">
        <AvatarFallback className="bg-primary-muted text-sm text-primary-deep">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-shell-ink">{user.name}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5">
          {user.handle ? (
            <span className="truncate text-xs text-shell-muted">@{user.handle}</span>
          ) : null}
          <Badge variant="achievement" className="shrink-0">
            {user.level}
          </Badge>
        </p>
      </div>
    </div>
  );
}

export function Sidebar({
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
    <div className="hidden lg:block lg:w-[16.5rem] lg:shrink-0 lg:border-r lg:border-shell-line lg:bg-shell">
      <aside className="sticky top-0 flex h-dvh flex-col text-shell-ink">
        <div className="shell-glow flex items-center gap-2 px-4 pt-5 pb-4">
          <Link
            href={navHref("dashboard")}
            className="-m-1 inline-flex min-w-0 flex-1 rounded-lg p-1"
            aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
          >
            <BrandLockup name={ORGANIZATION_NAME} tone="inverse" />
          </Link>
          <NotificationsMenu
            variant="shell"
            label={t("notifications.label")}
            title={t("notifications.title")}
            emptyLabel={t("notifications.empty")}
            markAllLabel={t("notifications.markAllRead")}
            items={notifications}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pt-1 pb-3">
          <SidebarNav items={navItems(primaryNavRoutes, t)} label={t("primaryLabel")} />
        </div>

        <div className="flex flex-col gap-2 border-t border-shell-line px-3 py-3">
          <Identity user={user} />

          <div className="flex flex-col gap-0.5">
            <SidebarNav
              items={navItems(accountNavRoutes, t)}
              label={t("secondaryLabel")}
            />
            {signOutLocale ? (
              <SignOutForm
                locale={signOutLocale}
                label={t("signOut")}
                className={FOOTER_ROW}
                iconClassName="size-5"
              />
            ) : (
              <Link href={navHref("login")} className={FOOTER_ROW}>
                <LogOut aria-hidden="true" className="size-5 shrink-0" />
                {t("signOut")}
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
