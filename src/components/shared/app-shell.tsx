import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  Bookmark,
  Compass,
  FileText,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { PublicSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { NavLink, TabLink } from "./nav-link";

/**
 * The application chrome: header, main region, and a mobile tab bar.
 *
 * A Server Component. Only the pieces that genuinely need interactivity —
 * the language `<select>` and the active-route links — are client components,
 * so a signed-out visitor opening an opportunity from Telegram downloads
 * almost no JavaScript for the shell itself.
 */
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
      {/* First focusable element on every page. */}
      <a href="#main" className="skip-link">
        {common("skipToContent")}
      </a>

      <header className="sticky top-0 z-40 border-b border-signal-line/70 bg-night/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/opportunities"
            className="flex shrink-0 items-center gap-2"
            aria-label={common("appName")}
          >
            <Image
              src="/logo/volontyorlar-mark.svg"
              alt=""
              width={32}
              height={32}
              priority
              className="size-8"
            />
            <span className="hidden font-display text-base font-semibold tracking-tight text-ink sm:inline">
              {common("appShortName")}
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
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
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
        // `pb-20` on mobile clears the fixed tab bar; without it the last card
        // of a list sits permanently underneath it.
        className={`mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10 ${
          signedIn ? "pb-24 md:pb-10" : ""
        }`}
      >
        {children}
      </main>

      <footer className="border-t border-signal-line/70 px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-muted">
          {common("appName")}
        </p>
      </footer>

      {signedIn ? (
        <nav
          aria-label={nav("primary")}
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-signal-line bg-night/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"
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
