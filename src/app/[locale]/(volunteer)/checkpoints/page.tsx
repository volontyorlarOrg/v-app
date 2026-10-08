import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  LoadErrorPanel,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { PageHeader } from "@/components/app/page-header";
import { ProfileTask, type TaskAvatar } from "@/components/checkpoints/profile-task";
import { getMe } from "@/lib/api/account.server";
import { getCheckpoints } from "@/lib/api/checkpoints.server";
import { settle, type LoadFailure } from "@/lib/api/load.server";
import { getProfile } from "@/lib/api/profile.server";
import type { CheckpointList } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import {
  profileReward,
  profileTaskChecklist,
  type ProfileTaskItem,
} from "@/lib/checkpoints/checkpoints";
import { EMPTY_PROFILE } from "@/lib/profile/completion";
import { initialsOf } from "@/lib/profile/initials";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkpoints">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkpoints" });
  return { title: t("metaTitle") };
}

export default async function TasksRoute({
  params,
}: PageProps<"/[locale]/checkpoints">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [, checkpoints, profile, me, common] = await Promise.all([
    requireSession(),
    settle(() => getCheckpoints()),
    settle(() => getProfile()),
    settle(() => getMe()),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const unavailable = (failure: LoadFailure) => (
    <TasksUnavailable failure={failure} labels={loadErrorLabels(common)} />
  );
  if (checkpoints.status === "failed") return unavailable(checkpoints.failure);
  if (profile.status === "failed") return unavailable(profile.failure);
  if (me.status === "failed") return unavailable(me.failure);

  const checklist = profileTaskChecklist(
    profile.data ?? EMPTY_PROFILE,
    me.data.usernameSource !== "generated",
    Boolean(me.data.avatarUrl),
  );

  const name = profile.data?.fullName.trim() || me.data.displayName?.trim() || "";
  const avatar = {
    url: me.data.avatarUrl ?? null,
    initials: name ? initialsOf(name) : "",
  };

  return <Tasks list={checkpoints.data} checklist={checklist} avatar={avatar} />;
}

function TasksUnavailable({
  failure,
  labels,
}: {
  failure: LoadFailure;
  labels: LoadErrorLabels;
}) {
  const t = useTranslations("checkpoints");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <LoadErrorPanel failure={failure} labels={labels} />
    </>
  );
}

function Tasks({
  list,
  checklist,
  avatar,
}: {
  list: CheckpointList;
  checklist: ProfileTaskItem[];
  avatar: TaskAvatar;
}) {
  const t = useTranslations("checkpoints");
  const reward = profileReward(list.items);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {reward ? (
        <ProfileTask
          reward={reward}
          checklist={checklist}
          avatar={avatar}
          claimingEnabled={list.claimingEnabled}
          className="mt-8 max-w-4xl"
        />
      ) : null}
    </>
  );
}
