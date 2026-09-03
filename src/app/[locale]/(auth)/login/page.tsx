import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthDivider, AuthPanel } from "@/components/auth/auth-panel";
import { PreviewNotice } from "@/components/auth/preview-notice";
import { ProviderButtons } from "@/components/auth/provider-buttons";
import { Link } from "@/i18n/navigation";
import { HOME_ROUTE, navHref } from "@/lib/routing/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("metaTitle") };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { reset } = await searchParams;
  return <Login resetSent={reset === "sent"} />;
}

function Login({ resetSent }: { resetSent: boolean }) {
  const t = useTranslations("auth");

  return (
    <>
      <AuthIntro title={t("login.title")} lead={t("login.lead")} />
      <PreviewNotice chip={t("preview.chip")} body={t("preview.body")} />

      {resetSent ? (
        <p
          role="status"
          className="enter-rise mt-6 flex items-start gap-3 rounded-lg bg-surface-soft px-4 py-3 text-sm leading-relaxed text-primary-ink [--enter-delay:650ms]"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t("login.resetSent")}
        </p>
      ) : null}

      <AuthPanel>
        <ProviderButtons
          href={navHref(HOME_ROUTE)}
          google={t("providers.google")}
          telegram={t("providers.telegram")}
        />
        <AuthDivider label={t("providers.or")} />
        <AuthForm
          destination={navHref(HOME_ROUTE)}
          submitLabel={t("login.submit")}
          passwordLabels={{
            show: t("fields.showPassword"),
            hide: t("fields.hidePassword"),
          }}
          fields={[
            { name: "email", label: t("fields.email") },
            {
              name: "password",
              label: t("fields.password"),
              trailing: { href: navHref("forgotPassword"), label: t("login.forgot") },
            },
          ]}
        />
      </AuthPanel>

      <p className="enter-rise mt-6 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        {t("login.noAccount")}{" "}
        <Link
          href={navHref("signup")}
          className="font-semibold text-primary-ink underline-offset-4 hover:underline"
        >
          {t("login.createAccount")}
        </Link>
      </p>
    </>
  );
}
