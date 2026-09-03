import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Bookmark, Compass, FileText, LayoutDashboard, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { PublicSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { NavLink, TabLink } from "./nav-link";

export async function AppShell({
  session,
  children,
}: {
  session: PublicSession | null;
  children: ReactNode;
}) {
  const [common, nav] = await Promise.all([
    getTranslations("common"),
    getTranslations("nav"),
  ]);

  const signedIn = session !== null;

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {common("skipToContent")}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/opportunities"
            className="flex shrink-0 items-center gap-2"
            aria-label={common("appName")}
          >
            <Image
              src="/brand/mark-blue.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="size-10"
            />
            <span className="hidden text-lg font-bold tracking-tight text-ink sm:inline">
              {common("brandWordmark")}
            </span>
          </Link>

          <nav
            aria-label={nav("primary")}
            className="hidden flex-1 items-center gap-1 md:flex"
          >
            <NavLink href="/opportunities">{nav("opportunities")}</NavLink>
            {signedIn ? (
              <>
                <NavLink href="/dashboard">{nav("dashboard")}</NavLink>
                <NavLink href="/applications">{nav("applications")}</NavLink>
                <NavLink href="/saved">{nav("saved")}</NavLink>
              </>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            {signedIn ? (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/profile">{session.displayName ?? nav("profile")}</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">{common("action.signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main
        id="main"

        className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10 ${
          signedIn ? "pb-24 md:pb-10" : ""
        }`}
      >
        {children}
      </main>

      <footer className="border-t border-line bg-surface px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/mark-blue.svg"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="font-bold tracking-tight text-ink">
              {common("brandWordmark")}
            </span>
          </div>
          <p className="text-xs text-ink-muted">{common("appName")}</p>
        </div>
      </footer>

      {signedIn ? (
        <nav
          aria-label={nav("primary")}
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
          <TabLink
            href="/opportunities"
            icon={<Compass aria-hidden="true" />}
            label={nav("opportunities")}
          />
          <TabLink
            href="/dashboard"
            icon={<LayoutDashboard aria-hidden="true" />}
            label={nav("dashboard")}
          />
          <TabLink
            href="/applications"
            icon={<FileText aria-hidden="true" />}
            label={nav("applications")}
          />
          <TabLink
            href="/saved"
            icon={<Bookmark aria-hidden="true" />}
            label={nav("saved")}
          />
          <TabLink
            href="/profile"
            icon={<UserRound aria-hidden="true" />}
            label={nav("profile")}
          />
        </nav>
      ) : null}
    </div>
  );
}
