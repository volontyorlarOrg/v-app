import { useId } from "react";

import { ICON_GLYPH, ICON_HEART } from "@/components/brand/logo-paths";
import type { PassParts } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";

export function VolunteerPassBadge({
  parts,
  className,
}: {
  parts: PassParts;
  className?: string;
}) {
  const id = useId();
  const shadowId = `${id}-shadow`;
  const stop = { stopColor: "var(--color-primary-deep)" };
  const on = (key: keyof PassParts) => (parts[key] ? "true" : "false");

  return (
    <svg
      viewBox="0 0 240 330"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
    >
      <defs>
        <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <stop offset="0" style={stop} stopOpacity="0.18" />
          <stop offset="0.5" style={stop} stopOpacity="0.08" />
          <stop offset="1" style={stop} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="128" cy="242" rx="128" ry="118" fill={`url(#${shadowId})`} />
      <path
        d="M28 0 C60 52 92 96 118 118"
        className="stroke-primary"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M212 0 C180 52 148 96 122 118"
        className="stroke-primary"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <rect
        x="104"
        y="112"
        width="32"
        height="22"
        rx="5"
        className="fill-primary-deep"
      />
      <circle cx="120" cy="140" r="9" className="stroke-primary-deep" strokeWidth="5" />
      <rect
        x="18"
        y="144"
        width="204"
        height="180"
        rx="18"
        className="fill-surface-soft"
      />
      <path
        d="M18 162 a18 18 0 0 1 18 -18 h168 a18 18 0 0 1 18 18 v28 h-204 z"
        className="fill-primary"
      />
      <g transform="translate(104.91 154) scale(0.04682) translate(-175.73 -278.41)">
        <path d={ICON_GLYPH} fillRule="evenodd" className="fill-knockout" />
        <path d={ICON_HEART} fillRule="evenodd" className="fill-logo-orange" />
      </g>
      <rect
        x="34"
        y="204"
        width="46"
        height="46"
        rx="9"
        className="fill-primary-muted"
      />
      <circle cx="57" cy="221" r="8" className="fill-primary" />
      <path d="M43 246 a14 12 0 0 1 28 0 z" className="fill-primary" />
      <g className="onboarding-pass-part" data-on={on("name")}>
        <rect x="92" y="208" width="88" height="11" rx="5.5" className="fill-ink" />
        <rect x="92" y="226" width="66" height="8" rx="4" className="fill-ink-muted" />
        <rect x="92" y="240" width="48" height="8" rx="4" className="fill-ink-muted" />
      </g>
      <g className="onboarding-pass-part" data-on={on("place")}>
        <circle cx="42" cy="268" r="5" className="fill-primary" />
        <rect x="56" y="264" width="118" height="8" rx="4" className="fill-ink-muted" />
      </g>
      <g className="onboarding-pass-part" data-on={on("languages")}>
        <rect
          x="34"
          y="282"
          width="40"
          height="15"
          rx="7.5"
          className="fill-primary-muted"
        />
        <rect
          x="80"
          y="282"
          width="32"
          height="15"
          rx="7.5"
          className="fill-primary-muted"
        />
        <rect
          x="118"
          y="282"
          width="46"
          height="15"
          rx="7.5"
          className="fill-primary-muted"
        />
      </g>
      <g className="onboarding-pass-part" data-on={on("contact")}>
        <circle cx="42" cy="310" r="5" className="stroke-primary" strokeWidth="3" />
        <rect x="56" y="306" width="100" height="8" rx="4" className="fill-ink-muted" />
      </g>
      <g className="onboarding-pass-part" data-on={on("sealed")}>
        <circle cx="184" cy="286" r="26" className="fill-accent" />
        <circle
          cx="184"
          cy="286"
          r="19"
          className="stroke-knockout"
          strokeWidth="2.5"
        />
        <g
          transform="translate(174.14 277.5) scale(0.030613) translate(-175.73 -278.41)"
          className="fill-knockout"
        >
          <path d={ICON_GLYPH} fillRule="evenodd" />
          <path d={ICON_HEART} fillRule="evenodd" />
        </g>
      </g>
    </svg>
  );
}
