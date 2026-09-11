"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { buttonClass } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const AUTO_RETRY_SECONDS = [5, 10, 20] as const;

export type RetryLabels = {
  retry: string;
  retrying: string;
  retryingNow: string;
};

export function RetryControls({
  auto,
  labels,
  size = "sm",
  className,
}: {
  auto: boolean;
  labels: RetryLabels;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [round, setRound] = useState(0);
  const [seconds, setSeconds] = useState<number | null>(null);

  const refresh = () => {
    setSeconds(null);
    startTransition(() => router.refresh());
  };

  useEffect(() => {
    if (!auto || pending) return;
    const delay = AUTO_RETRY_SECONDS[round];
    if (delay === undefined) return;

    const started = Date.now();
    const tick = () => {
      const left = delay - Math.floor((Date.now() - started) / 1000);
      if (left > 0) {
        setSeconds(left);
        return;
      }
      clearInterval(timer);
      setSeconds(null);
      setRound(round + 1);
      startTransition(() => router.refresh());
    };
    const timer = setInterval(tick, 250);

    return () => clearInterval(timer);
  }, [auto, pending, round, router]);

  const status = pending
    ? labels.retryingNow
    : seconds !== null
      ? labels.retrying.replace("{seconds}", String(seconds))
      : null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className={buttonClass({ size, className: "disabled:opacity-70" })}
      >
        <RotateCw
          aria-hidden="true"
          className={cn("size-4", pending && "animate-spin")}
        />
        {labels.retry}
      </button>
      <p role="status" aria-live="polite" className="tabular text-sm text-ink-muted">
        {status}
      </p>
    </div>
  );
}
