import { redirect } from "@/i18n/navigation";
import { navHref } from "@/lib/routing/routes";

export default async function SavedPage({ params }: PageProps<"/[locale]/saved">) {
  const { locale } = await params;
  redirect({ href: `${navHref("opportunities")}?view=saved`, locale });
}
