import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { ProviderButtons, telegramStartHref } from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { navHref } from "@/lib/routing/routes";
import { marketingHref } from "@/lib/seo/origin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/signup">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signup" });
  return { title: t("metaTitle") };
}

export default async function SignupPage({ params }: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Signup locale={locale as Locale} telegramHref={telegramStartHref(locale)} />;
}

const legalLinkClass =
  "font-semibold text-primary-ink hover:underline underline-offset-4";

function Signup({ locale, telegramHref }: { locale: Locale; telegramHref: string }) {
  const t = useTranslations("auth");
  const terms = marketingHref(locale, "terms");
  const privacy = marketingHref(locale, "privacy");

  return (
    <>
      <AuthIntro title={t("signup.title")} lead={t("signup.lead")} />

      <AuthPanel>
        <ProviderButtons
          telegramHref={telegramHref}
          telegram={t("providers.telegram")}
          google={t("providers.google")}
          googleUnavailable={t("providers.googleUnavailable")}
        />
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          {t("telegram.handoff")}
        </p>
        <p className="mt-5 text-xs leading-relaxed text-ink-muted">
          {terms && privacy
            ? t.rich("signup.legal", {
                terms: (chunks) => (
                  <a href={terms} className={legalLinkClass}>
                    {chunks}
                  </a>
                ),
                privacy: (chunks) => (
                  <a href={privacy} className={legalLinkClass}>
                    {chunks}
                  </a>
                ),
              })
            : t("signup.legalPlain")}
        </p>
      </AuthPanel>

      <p className="enter-rise mt-6 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        {t("signup.haveAccount")}{" "}
        <Link href={navHref("login")} className={legalLinkClass}>
          {t("signup.logIn")}
        </Link>
      </p>
    </>
  );
}
