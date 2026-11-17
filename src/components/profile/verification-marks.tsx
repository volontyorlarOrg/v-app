import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { z } from "zod";
import type { verificationSchema } from "@/lib/api/schemas";

export function VerificationMarks({
  verification,
}: {
  verification?: z.infer<typeof verificationSchema>;
}) {
  const t = useTranslations("verification");
  if (!verification || (!verification.verified && !verification.organization))
    return null;
  const organization = verification.organization;
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {verification.verified ? (
        <span aria-label={t("verified")} title={t("verified")}>
          <BadgeCheck aria-hidden="true" className="size-4 fill-action text-knockout" />
        </span>
      ) : null}
      {organization ? (
        <span
          aria-label={t("affiliation", { name: organization.name })}
          title={organization.name}
        >
          <Avatar className="size-5 rounded-sm">
            {organization.logoUrl ? (
              <AvatarImage src={organization.logoUrl} alt="" />
            ) : null}
            <AvatarFallback className="rounded-sm text-[10px]">
              {organization.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </span>
      ) : null}
    </span>
  );
}
