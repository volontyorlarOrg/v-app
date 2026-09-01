"use client";

import { LogOut } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";

/**
 * Sign out.
 *
 * Navigates to `/login` rather than refreshing in place: after the session
 * cookie is gone, refreshing the current authenticated route would bounce
 * through the proxy redirect anyway, and going straight there is one hop less.
 */
export function SignOutButton() {
  const t = useTranslations("profile.settings");
  const auth = useTranslations("auth.session");
  const router = useRouter();

  const signOut = useAction(signOutAction, {
    onSuccess() {
      toast.success(auth("signedOut"));
      router.replace("/login");
    },
  });

  return (
    <Button
      variant="secondary"
      className="self-start"
      disabled={signOut.isPending}
      onClick={() => signOut.execute(undefined)}
    >
      <LogOut aria-hidden="true" className="size-4" />
      {t("signOutEverywhere")}
    </Button>
  );
}
