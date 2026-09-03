import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ProviderButtons({
  href,
  google,
  telegram,
}: {
  href: string;
  google: string;
  telegram: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={href}
        className={buttonClass({ variant: "outline", className: "w-full" })}
      >
        <GoogleMark className="size-5" />
        {google}
      </Link>
      <Link
        href={href}
        className={buttonClass({ variant: "outline", className: "w-full" })}
      >
        <TelegramMark className="size-5" />
        {telegram}
      </Link>
    </div>
  );
}
