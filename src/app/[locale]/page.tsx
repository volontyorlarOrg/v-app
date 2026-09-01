import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * There is no marketing landing page in this repository — that is
 * `volontyorlarOrg/v-web`. The root of the product is discovery, so `/uz`
 * resolves straight to the opportunity list rather than showing a second,
 * competing home page that would duplicate the marketing site's job.
 */
export default async function LocaleRootPage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  redirect({ href: "/opportunities", locale: locale as Locale });
}
