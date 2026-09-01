import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function VolunteerLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;
  const session = await getSession();

  if (!session) redirect({ href: "/login", locale: locale as Locale });

  return props.children;
}
