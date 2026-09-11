import { redirect } from "@/i18n/navigation";
import { historyHref } from "@/lib/routing/routes";

export default async function RecordPage({ params }: PageProps<"/[locale]/record">) {
  const { locale } = await params;
  redirect({ href: historyHref(), locale });
}
