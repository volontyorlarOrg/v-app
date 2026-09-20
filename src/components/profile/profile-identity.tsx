import { CircleCheck, GraduationCap, Languages, Link2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ProfileLink } from "@/lib/profile/links";
import { historyHref, navHref } from "@/lib/routing/routes";

export type IdentityStat = {
  id: string;
  label: string;
  value: string;
};

export type IdentityFact = {
  id: "education" | "place" | "languages";
  value: string;
};

export type ProfileIdentityLabels = {
  level: string;
  complete: string;
  joined: string | null;
  bioEmpty: string;
  edit: string;
  record: string;
  publicProfile: string;
};

const FACT_ICONS = {
  education: GraduationCap,
  place: MapPin,
  languages: Languages,
} as const;

export function ProfileIdentity({
  name,
  initials,
  avatarUrl,
  handle,
  publicHref,
  stats,
  bio,
  facts,
  links,
  complete,
  labels,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  handle: string | null;
  publicHref: string | null;
  stats: readonly IdentityStat[];
  bio: string;
  facts: readonly IdentityFact[];
  links: readonly ProfileLink[];
  complete: boolean;
  labels: ProfileIdentityLabels;
}) {
  return (
    <section
      aria-labelledby="identity-name"
      className="panel-surface enter-rise overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div aria-hidden="true" className="identity-cover h-24 sm:h-32" />

      <div className="-mt-10 px-5 sm:-mt-12 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-end gap-4">
              <Avatar
                aria-hidden="true"
                className="size-20 shrink-0 ring-4 ring-surface sm:size-24"
              >
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className="text-2xl sm:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <h1
                  id="identity-name"
                  className="text-3xl tracking-[-0.025em] text-balance sm:text-4xl"
                >
                  {name}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <Badge variant="achievement">{labels.level}</Badge>
              {complete ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-accent-ink">
                  <CircleCheck aria-hidden="true" className="size-4" />
                  {labels.complete}
                </span>
              ) : null}
              {handle || labels.joined ? (
                <p className="text-ink-muted">
                  {handle ? (
                    <span className="font-semibold text-ink">@{handle}</span>
                  ) : null}
                  {handle && labels.joined ? <span aria-hidden="true"> · </span> : null}
                  {labels.joined}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:shrink-0 sm:pb-0.5">
            {publicHref ? (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({ variant: "outline", size: "sm" })}
              >
                {labels.publicProfile}
              </a>
            ) : null}
            <Link href={navHref("profileEdit")} className={buttonClass({ size: "sm" })}>
              {labels.edit}
            </Link>
            <Link
              href={historyHref()}
              className={buttonClass({ variant: "outline", size: "sm" })}
            >
              {labels.record}
            </Link>
          </div>
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="mt-5 border-y border-border bg-surface-sunk/60 px-5 py-4 sm:px-7">
          <dl className="grid grid-cols-3 gap-x-4 sm:max-w-lg">
            {stats.map((stat) => (
              <div key={stat.id} className="grid min-w-0">
                <dt className="row-start-2 mt-1.5 text-xs font-semibold tracking-normal text-ink-muted uppercase sm:tracking-[0.12em]">
                  {stat.label}
                </dt>
                <dd className="display-face tabular row-start-1 text-2xl leading-none text-accent-ink sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="mt-5 border-t border-border" />
      )}

      <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
        <p
          className={
            bio.trim()
              ? "max-w-prose leading-relaxed text-pretty text-ink"
              : "max-w-prose leading-relaxed text-pretty text-ink-muted"
          }
        >
          {bio.trim() || labels.bioEmpty}
        </p>

        {facts.length || links.length ? (
          <ul className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            {facts.map((fact) => {
              const Icon = FACT_ICONS[fact.id];
              return (
                <li key={fact.id} className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 truncate">{fact.value}</span>
                </li>
              );
            })}
            {links.map((link) => (
              <li key={link.href} className="flex items-center gap-2">
                <Link2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="min-w-0 truncate font-semibold text-primary-ink underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
