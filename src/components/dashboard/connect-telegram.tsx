import { TelegramMark } from "@/components/brand/provider-marks";
import { buttonClass } from "@/components/ui/button";

export type ConnectTelegramLabels = {
  title: string;
  body: string;
  connect: string;
  handoff: string;
};

export function ConnectTelegram({
  href,
  labels,
}: {
  href: string;
  labels: ConnectTelegramLabels;
}) {
  return (
    <section
      aria-labelledby="connect-telegram-title"
      className="enter-rise mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface px-5 py-4 [--enter-delay:260ms] sm:flex-row sm:items-center"
    >
      <span
        aria-hidden="true"
        className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary-ink sm:inline-flex"
      >
        <TelegramMark className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2
          id="connect-telegram-title"
          className="font-sans text-base font-semibold text-ink"
        >
          {labels.title}
        </h2>
        <p className="mt-0.5 text-sm text-ink-muted">{labels.body}</p>
        <p className="mt-1 text-xs text-ink-muted">{labels.handoff}</p>
      </div>
      {/* A full page load: the route hands off to Telegram, so no client router. */}
      <a href={href} className={buttonClass({ size: "sm", className: "shrink-0" })}>
        {labels.connect}
      </a>
    </section>
  );
}
