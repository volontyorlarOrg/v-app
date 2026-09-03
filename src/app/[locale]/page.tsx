import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ENTRY_ROUTE, navHref } from "@/lib/routing/routes";

export default async function LocaleRootPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  redirect({ href: navHref(ENTRY_ROUTE), locale: locale as Locale });
}
