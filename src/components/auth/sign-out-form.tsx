import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function SignOutForm({
  label,
  className,
  showIcon = true,
  iconClassName = "size-4",
}: {
  label: string;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
}) {
  return (
    <form action={signOut} className="contents">
      <button type="submit" className={cn(className)}>
        {showIcon ? (
          <LogOut aria-hidden="true" className={cn("shrink-0", iconClassName)} />
        ) : null}
        {label}
      </button>
    </form>
  );
}
