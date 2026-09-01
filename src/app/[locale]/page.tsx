import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function LocaleRootPage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  redirect({ href: "/opportunities", locale: locale as Locale });
}
