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
      className="mt-4 flex flex-col gap-3 rounded-lg border border-border px-5 py-4 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <h2 id="connect-telegram-title" className="text-sm font-semibold text-ink">
          {labels.title}
        </h2>
        <p className="text-sm text-ink-muted">{labels.body}</p>
        <p className="mt-1 text-xs text-ink-muted">{labels.handoff}</p>
      </div>
      {/* A full page load: the route hands off to Telegram, so no client router. */}
      <a href={href} className={buttonClass({ size: "sm", className: "shrink-0" })}>
        {labels.connect}
      </a>
    </section>
  );
}
