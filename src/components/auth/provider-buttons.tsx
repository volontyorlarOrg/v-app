import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ProviderButtons({
  href,
  telegramHref,
  google,
  telegram,
}: {
  href: string;
  telegramHref: string | null;
  google: string;
  telegram: string;
}) {
  const className = buttonClass({ variant: "outline", className: "w-full" });

  return (
    <div className="flex flex-col gap-3">
      <Link href={href} className={className}>
        <GoogleMark className="size-5" />
        {google}
      </Link>
      {telegramHref ? (
        <a href={telegramHref} rel="nofollow" className={className}>
          <TelegramMark className="size-5" />
          {telegram}
        </a>
      ) : (
        <Link href={href} className={className}>
          <TelegramMark className="size-5" />
          {telegram}
        </Link>
      )}
    </div>
  );
}

export function telegramStartHref(locale: string, next?: string | null): string {
  const params = new URLSearchParams({ locale });
  if (next) params.set("next", next);
  return `/api/auth/telegram/start?${params.toString()}`;
}
