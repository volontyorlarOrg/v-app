import { ArrowUpRight } from "lucide-react";
import { Children, type CSSProperties, type ReactNode } from "react";

import { RollingNumber } from "@/components/motion/rolling-number";
import { SplitWords } from "@/components/motion/scene";
import { SharedElement } from "@/components/motion/shared-element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROFILE_AVATAR_TRANSITION } from "@/components/profile/transitions";
import { Link } from "@/i18n/navigation";
import type { ProfileLink } from "@/lib/profile/links";
import { navHref } from "@/lib/routing/routes";

const LONG_WORD = 13;

export type ProfileRow = {
  id: string;
  label: string;
  value: ReactNode;
};

export type ProfileFigure = {
  id: string;
  content: ReactNode;
};

export type ProfileCompletionLine = {
  percent: number;
  value: string;
  missing: string;
  label: string;
};

export function ProfileSheet({
  name,
  initials,
  avatarUrl,
  handle,
  level,
  bio,
  figures,
  rows,
  completion,
  labels,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  handle: string | null;
  level: string;
  bio: string;
  figures: readonly ProfileFigure[];
  rows: readonly ProfileRow[];
  completion: ProfileCompletionLine | null;
  labels: { action: string; figures: string };
}) {
  const longName = name.split(/\s+/).some((word) => word.length > LONG_WORD);

  return (
    <article
      aria-labelledby="profile-name"
      className="profile-sheet panel-surface mx-auto w-full max-w-[46rem] overflow-clip rounded-xl border border-border bg-surface"
    >
      {completion ? (
        <div className="border-b border-border">
          <Progress
            value={completion.percent}
            valueText={completion.value}
            aria-label={completion.label}
            className="profile-completion-meter"
          />
          <p className="px-5 py-3 text-sm leading-snug text-ink-muted sm:px-8">
            <span className="tabular font-semibold text-primary-ink">
              {completion.value}
            </span>
            <span aria-hidden="true"> · </span>
            {completion.missing}
          </p>
        </div>
      ) : null}

      <header className="px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SharedElement name={PROFILE_AVATAR_TRANSITION}>
            <Avatar aria-hidden="true" className="profile-avatar size-24 sm:size-28">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="bg-primary-muted font-serif text-4xl font-normal tracking-[-0.02em] text-primary-deep">
                {initials}
              </AvatarFallback>
            </Avatar>
          </SharedElement>
          <Link
            href={navHref("profileEdit")}
            prefetch
            className={buttonClass({
              size: "sm",
              className: "enter-rise [--enter-delay:140ms]",
            })}
          >
            {labels.action}
          </Link>
        </div>

        <h1
          id="profile-name"
          data-long={longName || undefined}
          className="profile-name enter-words mt-6 [--enter-delay:40ms]"
        >
          <SplitWords text={name} />
        </h1>

        <p className="enter-rise mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 [--enter-delay:200ms]">
          {handle ? (
            <span className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere] text-ink">
              @{handle}
            </span>
          ) : null}
          <Badge variant="achievement">{level}</Badge>
        </p>

        {bio ? (
          <p className="profile-bio enter-rise mt-5 [--enter-delay:260ms]">{bio}</p>
        ) : null}

        {figures.length > 0 ? (
          <ul aria-label={labels.figures} className="profile-figures mt-5">
            {figures.map((figure, index) => (
              <li
                key={figure.id}
                className="enter-rise"
                style={{ "--enter-delay": `${320 + index * 80}ms` } as CSSProperties}
              >
                {figure.content}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {rows.length > 0 ? (
        <dl className="profile-rows mt-7">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="profile-row"
              style={{ "--row": index } as CSSProperties}
            >
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="pb-6 sm:pb-8" />
      )}
    </article>
  );
}

export function ProfileFigureNumber({ chunks }: { chunks: ReactNode }) {
  const value = Children.toArray(chunks)
    .filter((chunk) => typeof chunk === "string" || typeof chunk === "number")
    .join("");

  return <RollingNumber value={value} className="profile-figure-number" />;
}

export function ProfileLinkList({ links }: { links: readonly ProfileLink[] }) {
  return (
    <ul className="flex min-w-0 flex-col gap-1">
      {links.map((link) => (
        <li key={link.href} className="min-w-0">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="profile-link inline-flex max-w-full items-center gap-1.5 font-semibold text-primary-ink underline-offset-4 hover:underline"
          >
            <span className="truncate">{link.label}</span>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}
