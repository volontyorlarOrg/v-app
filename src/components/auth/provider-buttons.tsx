import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";

export function ProviderButtons({
  telegramHref,
  telegram,
  google,
  googleUnavailable,
}: {
  telegramHref: string;
  telegram: string;
  google: string;
  googleUnavailable: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <a href={telegramHref} rel="nofollow" className={buttonClass({ className: "w-full" })}>
        <TelegramMark className="size-5" />
        {telegram}
      </a>
      <button
        type="button"
        disabled
        aria-describedby="google-unavailable"
        className={buttonClass({
          variant: "outline",
          className: "w-full disabled:opacity-50",
        })}
      >
        <GoogleMark className="size-5" />
        {google}
      </button>
      <p id="google-unavailable" className="text-xs leading-relaxed text-ink-muted">
        {googleUnavailable}
      </p>
    </div>
  );
}

export function telegramStartHref(locale: string, next?: string | null): string {
  const params = new URLSearchParams({ locale });
  if (next) params.set("next", next);
  return `/api/auth/telegram/start?${params.toString()}`;
}
