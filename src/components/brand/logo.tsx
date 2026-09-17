import {
  ICON_GLYPH,
  ICON_HEART,
  ICON_TILE,
  WORDMARK,
  WORDMARK_HEART,
} from "@/components/brand/logo-paths";
import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path d={ICON_TILE} className="fill-logo-blue" />
      <path d={ICON_GLYPH} fillRule="evenodd" className="fill-knockout" />
      <path d={ICON_HEART} fillRule="evenodd" className="fill-logo-orange" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 210.74"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path d={WORDMARK} fillRule="evenodd" fill="currentColor" />
      <path d={WORDMARK_HEART} fillRule="evenodd" className="fill-logo-orange" />
    </svg>
  );
}

export function BrandLockup({
  name,
  className,
  tone = "primary",
}: {
  name: string;
  className?: string;
  tone?: "primary" | "inverse";
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn("inline-flex items-start [--logo:2.65rem]", className)}
    >
      <BrandIcon className="size-(--logo)" />
      <BrandWordmark
        className={cn(
          "mt-[calc(var(--logo)*0.24)] ml-[calc(var(--logo)*0.3025)] hidden h-[calc(var(--logo)*0.6006)] w-auto min-[360px]:block",
          tone === "primary" ? "text-logo-word" : "text-knockout",
        )}
      />
    </span>
  );
}
