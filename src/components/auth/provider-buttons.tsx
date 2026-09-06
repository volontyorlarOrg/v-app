import { GoogleMark, TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";

export function ProviderButtons({
  telegramHref,
  googleHref,
  telegram,
  google,
  googleUnavailable,
}: {
  telegramHref: string;
  googleHref: string | null;
  telegram: string;
  google: string;
  googleUnavailable: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <a
        href={telegramHref}
        rel="nofollow"
        className={buttonClass({ className: "w-full" })}
      >
        <TelegramMark className="size-5" />
        {telegram}
      </a>
      {googleHref ? (
        <a
          href={googleHref}
          rel="nofollow"
          className={buttonClass({ variant: "outline", className: "w-full" })}
        >
          <GoogleMark className="size-5" />
          {google}
        </a>
      ) : (
        <>
          <button
            type="button"
            disabled
            aria-describedby="google-unavailable"
            className={buttonClass({ variant: "outline", className: "w-full" })}
          >
            <GoogleMark className="size-5" />
            {google}
          </button>
          <p id="google-unavailable" className="text-xs leading-relaxed text-ink-muted">
            {googleUnavailable}
          </p>
        </>
      )}
    </div>
  );
}

function startHref(provider: string, locale: string, next?: string | null): string {
  const params = new URLSearchParams({ locale });
  if (next) params.set("next", next);
  return `/api/auth/${provider}/start?${params.toString()}`;
}

export function telegramStartHref(locale: string, next?: string | null): string {
  return startHref("telegram", locale, next);
}

export function googleStartHref(locale: string, next?: string | null): string {
  return startHref("google", locale, next);
}
