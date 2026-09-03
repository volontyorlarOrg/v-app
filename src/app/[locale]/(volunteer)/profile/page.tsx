import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Panel } from "@/components/app/panel";
import { PageHeader } from "@/components/app/page-header";
import { PreviewNote } from "@/components/app/preview-note";
import { ProfileMeter } from "@/components/dashboard/profile-meter";
import { ProfileForm } from "@/components/profile/profile-form";
import { REGIONS } from "@/lib/opportunities/types";
import { profileCompletion } from "@/lib/profile/completion";
import { sampleVolunteer } from "@/lib/sample/volunteer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/profile">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Profile />;
}

function Profile() {
  const t = useTranslations("profile");
  const opportunities = useTranslations("opportunities");
  const common = useTranslations("common");
  const volunteer = sampleVolunteer();
  const completion = profileCompletion(volunteer.profile);

  const fieldKeys = [
    "fullName",
    "bio",
    "bioHelp",
    "school",
    "gradeYear",
    "region",
    "regionAny",
    "city",
    "languages",
    "languagesHelp",
    "skills",
    "skillsHelp",
    "phone",
    "phoneHelp",
    "telegram",
    "telegramHelp",
    "links",
    "linksHelp",
  ] as const;
  const sectionKeys = [
    "identity",
    "education",
    "location",
    "skills",
    "contact",
    "links",
  ] as const;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        chip={common("sample.chip")}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="enter-rise min-w-0 [--enter-delay:90ms]">
          <ProfileForm
            values={volunteer.profile}
            regions={REGIONS.map((region) => ({
              value: region,
              label: opportunities(`regions.${region}`),
            }))}
            labels={{
              sections: Object.fromEntries(
                sectionKeys.map((key) => [key, t(`sections.${key}`)]),
              ) as Record<(typeof sectionKeys)[number], string>,
              fields: Object.fromEntries(
                fieldKeys.map((key) => [key, t(`fields.${key}`)]),
              ) as Record<(typeof fieldKeys)[number], string>,
              save: t("save"),
              saved: t("saved"),
            }}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Panel id="completion" title={t("completion.label")}>
            <ProfileMeter completion={completion} withAction={false} />
          </Panel>
          <PreviewNote
            chip={common("preview.chip")}
            body={common("preview.notSaved")}
          />
        </div>
      </div>
    </>
  );
}
