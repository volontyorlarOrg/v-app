import { redirect } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  const { locale } = await params;
  redirect({ href: navHref("profile"), locale });
}
