import { ArrowUpRight } from "lucide-react";
import { Children, type CSSProperties, type ReactNode } from "react";

import { RollingNumber } from "@/components/motion/rolling-number";
import { SplitWords } from "@/components/motion/scene";
import { SharedElement } from "@/components/motion/shared-element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProfileSocialLinks } from "@/components/profile/profile-social-links";
import { PROFILE_AVATAR_TRANSITION } from "@/components/profile/transitions";
import { Link } from "@/i18n/navigation";
import type { ProfileLink } from "@/lib/profile/links";
import type {
  ProfileSocialLink,
  ProfileSocialPlatform,
} from "@/lib/profile/social-links";
import { navHref } from "@/lib/routing/routes";
import { cn } from "@/lib/utils";

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
  socials,
  figures,
  rows,
  activity,
  note,
  completion,
  labels,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  handle: string | null;
  level: string | null;
  bio: string;
  socials: readonly ProfileSocialLink[];
  figures: readonly ProfileFigure[];
  rows: readonly ProfileRow[];
  activity?: ReactNode;
  note?: ReactNode;
  completion: ProfileCompletionLine | null;
  labels: {
    action?: string;
    figures: string;
    socials: string;
    socialPlatforms: Record<ProfileSocialPlatform, string>;
  };
}) {
  const longName = name.split(/\s+/).some((word) => word.length > LONG_WORD);

  return (
    <article
      aria-labelledby="profile-name"
      className="profile-sheet mx-auto w-full max-w-[46rem] overflow-clip rounded-lg border border-border bg-surface shadow-panel"
    >
      {completion ? (
        <div className="border-b border-border">
          <Progress
            value={completion.percent}
            valueText={completion.value}
            aria-label={completion.label}
            className="profile-completion-meter"
          />
          <p className="px-5 py-2 text-xs text-ink-muted sm:px-6">
            <span className="tabular font-medium text-ink">{completion.value}</span>
            <span aria-hidden="true"> · </span>
            {completion.missing}
          </p>
        </div>
      ) : null}

      <header className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SharedElement name={PROFILE_AVATAR_TRANSITION}>
            <Avatar
              aria-hidden="true"
              className="size-16 outline-2 outline-offset-2 outline-accent sm:size-20"
            >
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="text-xl sm:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </SharedElement>
          {labels.action ? (
            <Link
              href={navHref("profileEdit")}
              prefetch
              className={buttonClass({
                size: "sm",
                className: "",
              })}
            >
              {labels.action}
            </Link>
          ) : null}
        </div>

        <h1
          id="profile-name"
          data-long={longName || undefined}
          className="profile-name enter-words mt-4"
        >
          <SplitWords text={name} />
        </h1>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {handle ? (
            <span className="min-w-0 text-sm [overflow-wrap:anywhere] text-ink-muted">
              @{handle}
            </span>
          ) : null}
          {level ? <Badge variant="achievement">{level}</Badge> : null}
        </p>

        {bio || socials.length > 0 ? (
          <div
            className={cn(
              "mt-5 grid gap-5",
              bio &&
                socials.length > 0 &&
                "sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.62fr)] sm:gap-8",
            )}
          >
            {bio ? <p className="profile-bio">{bio}</p> : null}
            <ProfileSocialLinks
              links={socials}
              label={labels.socials}
              platformLabels={labels.socialPlatforms}
            />
          </div>
        ) : null}

        {figures.length > 0 ? (
          <ul aria-label={labels.figures} className="profile-figures mt-4">
            {figures.map((figure, index) => (
              <li
                key={figure.id}
                className=""
                style={{ "--enter-delay": `${320 + index * 80}ms` } as CSSProperties}
              >
                {figure.content}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {rows.length > 0 ? (
        <dl className="profile-rows mt-6">
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
        <div className="pb-5 sm:pb-6" />
      )}
      {activity}
      {note ? (
        <p className="border-t border-border px-5 py-3 text-sm text-ink-muted sm:px-6">
          {note}
        </p>
      ) : null}
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
            className="profile-link inline-flex max-w-full items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            <span className="truncate">{link.label}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}
