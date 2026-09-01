"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Href = ComponentProps<typeof Link>["href"];

function useIsActive(href: string): boolean {
  const pathname = usePathname();
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const active = useIsActive(href);

  return (
    <Link
      href={href as Href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-blue-tint text-blue-deep"
          : "text-ink-muted hover:bg-surface hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function TabLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const active = useIsActive(href);

  return (
    <Link
      href={href as Href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-1 flex-col items-center justify-center gap-1",
        "text-[0.6875rem] font-semibold transition-colors [&_svg]:size-5",
        active ? "text-blue-deep" : "text-ink-muted hover:text-ink",
      )}
    >
      {icon}
      <span className="max-w-full truncate px-1">{label}</span>
    </Link>
  );
}
