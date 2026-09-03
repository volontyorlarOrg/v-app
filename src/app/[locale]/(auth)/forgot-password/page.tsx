import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthIntro } from "@/components/auth/auth-intro";
import { AuthPanel } from "@/components/auth/auth-panel";
import { PreviewNotice } from "@/components/auth/preview-notice";
import { Link } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/forgot-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgot" });
  return { title: t("metaTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPassword />;
}

function ForgotPassword() {
  const t = useTranslations("auth");

  return (
    <>
      <AuthIntro title={t("forgot.title")} lead={t("forgot.lead")} />
      <PreviewNotice chip={t("preview.chip")} body={t("preview.body")} />

      <AuthPanel>
        <AuthForm
          destination={`${navHref("login")}?reset=sent`}
          submitLabel={t("forgot.submit")}
          passwordLabels={{
            show: t("fields.showPassword"),
            hide: t("fields.hidePassword"),
          }}
          fields={[{ name: "email", label: t("fields.email") }]}
        />
      </AuthPanel>

      <p className="enter-rise mt-6 text-center text-sm text-ink-muted [--enter-delay:820ms]">
        <Link
          href={navHref("login")}
          className="font-semibold text-primary-ink underline-offset-4 hover:underline"
        >
          {t("forgot.back")}
        </Link>
      </p>
    </>
  );
}
