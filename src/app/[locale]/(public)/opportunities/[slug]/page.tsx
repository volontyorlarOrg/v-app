import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { siteOrigin } from "@/lib/api/env.server";
import { localeAlternates, robotsFor } from "@/lib/routes/policy";
import { getOpportunity } from "@/features/opportunities/api.server";
import { canApply } from "@/features/opportunities/deadline";
import { getSession } from "@/lib/auth/session.server";
import { OpportunityDeadline } from "@/components/opportunities/opportunity-deadline";
import { OpportunityStatusBadge } from "@/components/opportunities/opportunity-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

/**
 * Opportunity detail — the page a Telegram link actually opens.
 *
 * Indexable, server-rendered, and readable without JavaScript. Everything a
 * volunteer needs in order to decide is above the fold on a 360px screen:
 * what it is, when, where, by when to apply, and the apply button.
 */

export async function generateMetadata(
  props: PageProps<"/[locale]/opportunities/[slug]">,
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const opportunity = await getOpportunity(slug);

  if (!opportunity) {
    const t = await getTranslations({ locale, namespace: "errors.opportunityNotFound" });
    return { title: t("title"), robots: { index: false, follow: false } };
  }

  const origin = siteOrigin();
  const path = `/opportunities/${slug}`;

  return {
    title: opportunity.title,
    description: opportunity.summary,
    robots: robotsFor(path),
    alternates: {
      canonical: `${origin}/${locale}${path}`,
      languages: localeAlternates(origin, path, locales),
    },
    openGraph: {
      title: opportunity.title,
      description: opportunity.summary,
      type: "article",
      ...(opportunity.imageUrl ? { images: [opportunity.imageUrl] } : {}),
    },
  };
}

/**
 * Deliberately **no** `generateStaticParams`.
 *
 * This page reads the session to decide its call to action — "Apply",
 * "Sign in to apply", or "You have applied" — and a route that reads cookies
 * cannot be statically prerendered. Exporting `generateStaticParams` here
 * marks the route static and every request then fails with
 * `DYNAMIC_SERVER_USAGE`.
 *
 * Rendering dynamically costs less than it looks: the expensive part is the
 * backend read, and that is cached by `revalidate` + tags inside
 * `getOpportunity`, so a burst of visitors arriving from one Telegram link
 * share a single upstream fetch. The sitemap still enumerates slugs through
 * `listOpportunitySlugs`.
 */

export default async function OpportunityDetailPage(
  props: PageProps<"/[locale]/opportunities/[slug]">,
) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale as Locale);

  const opportunity = await getOpportunity(slug);
  if (!opportunity) notFound();

  const [t, common, session, format] = await Promise.all([
    getTranslations("opportunities"),
    getTranslations("common"),
    getSession(),
    getFormatter(),
  ]);

  const open = canApply(opportunity);
  const signedIn = session !== null;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/opportunities"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("detail.backToList")}
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <OpportunityStatusBadge opportunity={opportunity} />
          <OpportunityDeadline deadline={opportunity.applicationDeadline} />
          {opportunity.sourcedByYvc ? (
            <Badge tone="signalQuiet" icon={<BadgeCheck aria-hidden="true" />}>
              {t("detail.sourcedBy")}
            </Badge>
          ) : (
            <Badge tone="neutral">{t("detail.partnerOpportunity")}</Badge>
          )}
        </div>

        <h1 className="text-2xl leading-tight sm:text-4xl">{opportunity.title}</h1>
        <p className="max-w-2xl text-base leading-8 text-muted">
          {opportunity.summary}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex flex-col gap-6">
          <Surface as="section" aria-labelledby="facts" padding="md">
            <h2 id="facts" className="sr-only">
              {t("detail.description")}
            </h2>

            <dl className="grid gap-4 sm:grid-cols-2">
              <Fact
                icon={<Users aria-hidden="true" />}
                label={t("detail.organiser")}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {opportunity.organization.name}
                    {opportunity.organization.verified ? (
                      <BadgeCheck
                        aria-label={t("detail.sourcedBy")}
                        className="size-4 text-teal"
                      />
                    ) : null}
                  </span>
                }
              />
              <Fact
                icon={<CalendarDays aria-hidden="true" />}
                label={t("detail.date")}
                value={
                  <time dateTime={opportunity.startsAt}>
                    {format.dateTime(new Date(opportunity.startsAt), "long")}
                  </time>
                }
              />
              <Fact
                icon={<MapPin aria-hidden="true" />}
                label={t("detail.location")}
                value={[
                  opportunity.locationName,
                  opportunity.city,
                  t(`regions.${opportunity.region}`),
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Fact
                icon={<ClipboardList aria-hidden="true" />}
                label={t("detail.deadline")}
                value={
                  <time dateTime={opportunity.applicationDeadline}>
                    {format.dateTime(
                      new Date(opportunity.applicationDeadline),
                      "long",
                    )}
                  </time>
                }
              />
              {opportunity.capacity !== undefined ? (
                <Fact
                  icon={<Users aria-hidden="true" />}
                  label={t("detail.capacity")}
                  value={String(opportunity.capacity)}
                />
              ) : null}
            </dl>
          </Surface>

          <section aria-labelledby="about" className="flex flex-col gap-3">
            <h2 id="about" className="text-lg">
              {t("detail.description")}
            </h2>
            <p className="max-w-prose leading-8 text-muted whitespace-pre-line">
              {opportunity.description}
            </p>
          </section>

          {opportunity.requirements.length > 0 ? (
            <section aria-labelledby="requirements" className="flex flex-col gap-3">
              <h2 id="requirements" className="text-lg">
                {t("detail.requirements")}
              </h2>
              <ul className="flex flex-col gap-2">
                {opportunity.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-2.5 leading-7 text-muted"
                  >
                    <CircleCheck
                      aria-hidden="true"
                      className="mt-1.5 size-4 shrink-0 text-teal"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {opportunity.questions.length > 0 ? (
            <section aria-labelledby="questions" className="flex flex-col gap-3">
              <h2 id="questions" className="text-lg">
                {t("detail.questions")}
              </h2>
              {/*
                Showing the questions before sign-in is deliberate: a volunteer
                should know what a 600-word essay commitment looks like before
                creating an account, not after.
              */}
              <ol className="flex list-decimal flex-col gap-2 pl-5 leading-7 text-muted marker:text-teal">
                {opportunity.questions.map((question) => (
                  <li key={question.id}>{question.prompt}</li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        {/*
          Sticky on desktop; in normal flow on mobile, where a fixed bar would
          collide with the tab bar and eat a third of a small screen.
        */}
        <Surface as="aside" padding="md" className="lg:sticky lg:top-24">
          <div className="flex flex-col gap-3">
            {opportunity.spotsRemaining !== undefined ? (
              <p className="text-sm text-muted">
                {t("detail.spotsLeft", { count: opportunity.spotsRemaining })}
              </p>
            ) : null}

            {!open ? (
              <Button variant="secondary" size="lg" block disabled>
                {opportunity.status === "full"
                  ? t("cta.applyFull")
                  : t("cta.applyClosed")}
              </Button>
            ) : signedIn ? (
              <Button asChild size="lg" block>
                <Link href={`/applications/new/${opportunity.slug}`}>
                  {t("cta.apply")}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" block>
                  <Link href={`/login?next=/opportunities/${opportunity.slug}`}>
                    {t("cta.signInToApply")}
                  </Link>
                </Button>
                <p className="text-xs leading-6 text-muted">
                  {common("tagline")}
                </p>
              </>
            )}
          </div>
        </Surface>
      </div>
    </article>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-teal [&_svg]:size-4">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">
          {label}
        </dt>
        <dd className="text-sm leading-6 text-ink">{value}</dd>
      </div>
    </div>
  );
}
