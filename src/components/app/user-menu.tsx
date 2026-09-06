"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";

export type UserMenuItem = { href: string; label: string };

export function UserMenu({
  label,
  name,
  initials,
  items,
  signOutLabel,
  signOutLocale,
  loginHref,
}: {
  label: string;
  name: string;
  initials: string;
  items: readonly UserMenuItem[];
  signOutLabel: string;
  signOutLocale: string | null;
  loginHref: string;
}) {
  const [pending, startTransition] = useTransition();

  function onSignOut() {
    if (!signOutLocale) return;
    const data = new FormData();
    data.set("locale", signOutLocale);
    startTransition(async () => {
      await signOut(data);
    });
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${name}`}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:border-border-control"
        >
          <Avatar aria-hidden="true" className="size-9">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {signOutLocale ? (
          <DropdownMenuItem disabled={pending} onSelect={onSignOut}>
            <LogOut aria-hidden="true" />
            {signOutLabel}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={loginHref}>
              <LogOut aria-hidden="true" />
              {signOutLabel}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
