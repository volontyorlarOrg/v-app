import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getMyRecord } from "@/features/record/api.server";
import { VolunteerRecordCard } from "@/components/volunteers/volunteer-record-card";
import { ApiErrorState } from "@/components/shared/api-error-state";
import { PageHeader } from "@/components/ui/page-header";

/** The volunteer's confirmed participation record. */
export default async function RecordPage(props: PageProps<"/[locale]/record">) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("record");

  let record;

  try {
    record = await getMyRecord();
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("title")} description={t("subtitle")} />
        <ApiErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <VolunteerRecordCard
        counts={record.counts}
        hours={record.hours}
        hoursVerified={record.hoursVerified}
      />
    </div>
  );
}
