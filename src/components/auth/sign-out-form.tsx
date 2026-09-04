import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function SignOutForm({
  locale,
  label,
  className,
  showIcon = true,
}: {
  locale: string;
  label: string;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <form action={signOut} className="contents">
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={cn(className)}>
        {showIcon ? <LogOut aria-hidden="true" className="size-4" /> : null}
        {label}
      </button>
    </form>
  );
}
