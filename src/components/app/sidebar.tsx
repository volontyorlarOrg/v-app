import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar } from "@/components/app/avatar";
import { SidebarNav, type SidebarItem } from "@/components/app/sidebar-nav";
import { BrandLockup } from "@/components/brand/logo";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ORGANIZATION_NAME } from "@/lib/content/org";
import { accountRoutes, navHref, navRoutes } from "@/lib/routing/routes";

export type ShellUser = { name: string; initials: string; level: string };

export function Sidebar({ user }: { user: ShellUser }) {
  const t = useTranslations("nav");

  const toItem = (route: { key: SidebarItem["key"] }): SidebarItem => ({
    key: route.key,
    href: navHref(route.key),
    label: t(route.key),
  });

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface">
      <div className="px-5 pt-5 pb-4">
        <Link
          href={navHref("dashboard")}
          className="-m-1 inline-flex rounded-lg p-1"
          aria-label={`${ORGANIZATION_NAME} — ${t("dashboard")}`}
        >
          <BrandLockup name={ORGANIZATION_NAME} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav
          primary={navRoutes.map(toItem)}
          secondary={accountRoutes.map(toItem)}
          primaryLabel={t("primaryLabel")}
          secondaryLabel={t("secondaryLabel")}
        />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar initials={user.initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs font-semibold text-accent-ink">{user.level}</p>
          </div>
        </div>
        <Link
          href={navHref("login")}
          className={buttonClass({
            variant: "outline",
            size: "sm",
            className: "mt-4 w-full",
          })}
        >
          <LogOut aria-hidden="true" className="size-4" />
          {t("signOut")}
        </Link>
      </div>
    </aside>
  );
}
