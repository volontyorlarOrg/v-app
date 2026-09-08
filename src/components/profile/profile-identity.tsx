import { CircleCheck, GraduationCap, Languages, Link2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/i18n/navigation";
import type { ProfileCompletion } from "@/lib/profile/completion";
import type { ProfileLink } from "@/lib/profile/links";
import { navHref } from "@/lib/routing/routes";

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
  joined: string;
  bioEmpty: string;
  edit: string;
  record: string;
  completion: {
    label: string;
    value: string;
    missing: string;
  };
};

const FACT_ICONS = {
  education: GraduationCap,
  place: MapPin,
  languages: Languages,
} as const;

export function ProfileIdentity({
  name,
  initials,
  handle,
  stats,
  bio,
  facts,
  links,
  completion,
  labels,
}: {
  name: string;
  initials: string;
  handle: string | null;
  stats: readonly IdentityStat[];
  bio: string;
  facts: readonly IdentityFact[];
  links: readonly ProfileLink[];
  completion: ProfileCompletion;
  labels: ProfileIdentityLabels;
}) {
  return (
    <section
      aria-labelledby="identity-name"
      className="enter-rise rounded-xl border border-border bg-surface"
    >
      <div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-7">
        <div className="flex items-center gap-4 sm:gap-6">
          <Avatar
            aria-hidden="true"
            className="size-16 shrink-0 ring-1 ring-border sm:size-24"
          >
            <AvatarFallback className="text-xl sm:text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h1
            id="identity-name"
            className="min-w-0 flex-1 text-3xl tracking-[-0.025em] text-balance sm:text-4xl"
          >
            {name}
          </h1>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <Badge variant="achievement">{labels.level}</Badge>
          {completion.complete ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-accent-ink">
              <CircleCheck aria-hidden="true" className="size-4" />
              {labels.complete}
            </span>
          ) : null}
          <p className="text-ink-muted">
            {handle ? <span className="font-semibold">@{handle}</span> : null}
            {handle ? <span aria-hidden="true"> · </span> : null}
            {labels.joined}
          </p>
        </div>
      </div>

      <div className="border-y border-border px-5 py-4 sm:px-7">
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

      <div className="flex flex-col gap-5 px-5 py-6 sm:px-7">
        <p
          className={
            bio
              ? "max-w-prose leading-relaxed text-pretty text-ink"
              : "max-w-prose leading-relaxed text-pretty text-ink-muted"
          }
        >
          {bio || labels.bioEmpty}
        </p>

        {facts.length || links.length ? (
          <ul className="flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            {facts.map((fact) => {
              const Icon = FACT_ICONS[fact.id];
              return (
                <li key={fact.id} className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{fact.value}</span>
                </li>
              );
            })}
            {links.map((link) => (
              <li key={link.href} className="flex items-center gap-2">
                <Link2 aria-hidden="true" className="size-4 shrink-0" />
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

        <div className="mt-1 flex flex-wrap gap-3">
          <a href="#edit" className={buttonClass({ variant: "outline", size: "sm" })}>
            {labels.edit}
          </a>
          <Link
            href={navHref("record")}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            {labels.record}
          </Link>
        </div>
      </div>

      {completion.complete ? null : (
        <div className="border-t border-border px-5 py-5 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-ink">{labels.completion.label}</p>
            <span className="tabular text-sm font-semibold text-primary-ink">
              {labels.completion.value}
            </span>
          </div>
          <Progress
            value={completion.percent}
            valueText={labels.completion.value}
            aria-label={labels.completion.label}
            className="mt-3"
          />
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {labels.completion.missing}
          </p>
        </div>
      )}
    </section>
  );
}
