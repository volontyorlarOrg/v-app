import { useTranslations } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  UsernameSection,
  type UsernameLabels,
} from "@/components/account/username-section";
import { ActionStatus, type ActionTone } from "@/components/app/action-status";
import {
  LoadErrorRows,
  loadErrorLabels,
  type LoadErrorLabels,
} from "@/components/app/load-error";
import { PageHeader } from "@/components/app/page-header";
import { Panel } from "@/components/app/panel";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { AccountSummary } from "@/components/settings/account-summary";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { ConnectionList } from "@/components/settings/connection-list";
import {
  MergeRequestList,
  type MergeRequestItem,
  type MergeRequestLabels,
} from "@/components/settings/merge-requests";
import {
  PasswordForm,
  type PasswordFormLabels,
} from "@/components/settings/password-connect-form";
import { PrivacySection } from "@/components/settings/privacy-section";
import {
  VisibilitySection,
  type VisibilityLabels,
} from "@/components/settings/visibility-section";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  connectionStates,
  isConnectStatus,
  type ConnectionState,
} from "@/lib/account/connections";
import { ACCOUNT_ERROR_KEYS, type ConnectStatus } from "@/lib/account/types";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  usernameIdentity,
  type UsernameIdentity,
} from "@/lib/account/username";
import { getMe, listMergeRequests } from "@/lib/api/account.server";
import { settle, type LoadFailure } from "@/lib/api/load.server";
import { getProfile } from "@/lib/api/profile.server";
import { getProgress } from "@/lib/api/record.server";
import type { MergeRequest } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { isGoogleConfigured } from "@/lib/auth/config";
import { initialsOf } from "@/lib/profile/initials";
import {
  OPTIONAL_PROFILE_PARTS,
  REQUIRED_PROFILE_PARTS,
  hiddenProfileParts,
  type OptionalProfilePart,
} from "@/lib/profile/visibility";
import type { Level } from "@/lib/record/levels";
import { navHref } from "@/lib/routing/routes";
import { getLegalState } from "@/lib/legal/state.server";

export const dynamic = "force-dynamic";

const DONE_STATUSES: readonly ConnectStatus[] = ["linked", "alreadyLinked"];
const INFO_STATUSES: readonly ConnectStatus[] = ["approvalRequired", "alreadyPending"];
const PASSWORD_STATUSES = ["set", "changed"] as const;

type PasswordStatus = (typeof PASSWORD_STATUSES)[number];

type VisibilityState =
  | { status: "ready"; hidden: readonly OptionalProfilePart[] }
  | { status: "missing" }
  | { status: "failed"; failure: LoadFailure };

function isPasswordStatus(value: unknown): value is PasswordStatus {
  return (
    typeof value === "string" &&
    (PASSWORD_STATUSES as readonly string[]).includes(value)
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/settings">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("metaTitle") };
}

export default async function SettingsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { connect, password } = await searchParams;
  const [session, me, requests, progress, profile, format, t, common, legal] =
    await Promise.all([
      requireSession(),
      getMe(),
      listMergeRequests(),
      settle(() => getProgress()),
      settle(() => getProfile()),
      getFormatter({ locale }),
      getTranslations({ locale, namespace: "settings" }),
      getTranslations({ locale, namespace: "common" }),
      getLegalState(),
    ]);

  const visibility: VisibilityState =
    profile.status === "failed"
      ? { status: "failed", failure: profile.failure }
      : profile.data
        ? {
            status: "ready",
            hidden: [...hiddenProfileParts(profile.data.hiddenFields)],
          }
        : { status: "missing" };

  const now = new Date();
  const toItem = (request: MergeRequest): MergeRequestItem => ({
    id: request.id,
    provider: t("merge.providerLine", {
      provider: t(`connections.${request.requestedVia}`),
    }),
    counterparty: request.counterparty.displayName?.trim() || null,
    asked: t("merge.asked", {
      time: format.relativeTime(new Date(request.createdAt), now),
    }),
    expires: t("merge.expires", {
      time: format.relativeTime(new Date(request.expiresAt), now),
    }),
  });

  return (
    <Settings
      locale={locale as Locale}
      name={me.displayName?.trim() || session.displayName?.trim() || ""}
      avatarUrl={me.avatarUrl}
      level={progress.status === "loaded" ? progress.data.level : null}
      states={connectionStates(me)}
      username={usernameIdentity(me)}
      leaderboardEnabled={legal.leaderboard}
      visibility={visibility}
      errorLabels={loadErrorLabels(common)}
      email={me.email ?? null}
      hasPassword={me.authMethods.password}
      googleConfigured={isGoogleConfigured()}
      status={isConnectStatus(connect) ? connect : null}
      passwordStatus={isPasswordStatus(password) ? password : null}
      incoming={requests.incoming.map(toItem)}
      outgoing={requests.outgoing.map(toItem)}
    />
  );
}

function toneFor(status: ConnectStatus): ActionTone {
  if (DONE_STATUSES.includes(status)) return "done";
  if (INFO_STATUSES.includes(status)) return "info";
  return "error";
}

function Settings({
  locale,
  name,
  avatarUrl,
  level,
  states,
  username,
  leaderboardEnabled,
  visibility,
  errorLabels,
  email,
  hasPassword,
  googleConfigured,
  status,
  passwordStatus,
  incoming,
  outgoing,
}: {
  locale: Locale;
  name: string;
  avatarUrl?: string;
  level: Level | null;
  states: readonly ConnectionState[];
  username: UsernameIdentity;
  leaderboardEnabled: boolean;
  visibility: VisibilityState;
  errorLabels: LoadErrorLabels;
  email: string | null;
  hasPassword: boolean;
  googleConfigured: boolean;
  status: ConnectStatus | null;
  passwordStatus: PasswordStatus | null;
  incoming: readonly MergeRequestItem[];
  outgoing: readonly MergeRequestItem[];
}) {
  const t = useTranslations("settings");
  const common = useTranslations("common");
  const record = useTranslations("record");
  const profile = useTranslations("profile");
  const errors = Object.fromEntries(
    ACCOUNT_ERROR_KEYS.map((key) => [key, t(`errors.${key}`)]),
  );

  const displayName = name || common("volunteer");
  const passwordMode = hasPassword ? "change" : "set";
  const passwordTitle = t(
    `connections.${hasPassword ? "changePasswordTitle" : "setPasswordTitle"}`,
  );

  const passwordLabels: PasswordFormLabels = {
    title: passwordTitle,
    description: t(
      `connections.${hasPassword ? "changePasswordDescription" : "setPasswordDescription"}`,
    ),
    email: t("connections.passwordEmail"),
    currentPassword: t("connections.currentPassword"),
    newPassword: t("connections.newPassword"),
    confirmPassword: t("connections.confirmPassword"),
    passwordHint: t("connections.passwordHint", { min: 8 }),
    reveal: t("connections.passwordReveal"),
    conceal: t("connections.passwordConceal"),
    submit: t(`connections.${hasPassword ? "changePassword" : "setPassword"}`),
    pending: t("connections.passwordPending"),
    done: t(`connections.${hasPassword ? "changePasswordDone" : "setPasswordDone"}`),
    fieldInvalid: t("errors.validationFailed"),
    errors,
  };

  const usernameLabels: UsernameLabels = {
    legend: t("username.title"),
    description: t("username.description"),
    field: t("username.field"),
    hint: t("username.hint", {
      min: USERNAME_MIN_LENGTH,
      max: USERNAME_MAX_LENGTH,
    }),
    current: t("username.current"),
    generated: t("username.generated"),
    managed: t("username.managed"),
    save: t("username.save"),
    saving: t("username.saving"),
    saved: t("username.saved"),
    errors,
  };

  const mergeLabels: MergeRequestLabels = {
    empty: t("merge.empty"),
    approve: t("merge.approve"),
    approving: t("merge.approving"),
    reject: t("merge.reject"),
    rejecting: t("merge.rejecting"),
    cancel: t("merge.cancel"),
    cancelling: t("merge.cancelling"),
    rejected: t("merge.rejected"),
    cancelled: t("merge.cancelled"),
    freshAuthTitle: t("merge.freshAuthTitle"),
    freshAuthDescription: t("merge.freshAuthDescription"),
    freshAuthAction: t("merge.freshAuthAction"),
    errors,
  };

  const partLabel = (
    part: OptionalProfilePart | (typeof REQUIRED_PROFILE_PARTS)[number],
  ) => profile(`visibility.parts.${part}`);
  const visibilityLabels: VisibilityLabels = {
    alwaysTitle: t("visibility.alwaysTitle"),
    optionalTitle: t("visibility.optionalTitle"),
    always: [
      ...(["photo", "name", "username", "level", "figures"] as const).map((id) => ({
        id,
        label: t(`visibility.always.${id}`),
      })),
      ...REQUIRED_PROFILE_PARTS.map((id) => ({ id, label: partLabel(id) })),
    ],
    parts: Object.fromEntries(
      OPTIONAL_PROFILE_PARTS.map((part) => [part, partLabel(part)]),
    ) as Record<OptionalProfilePart, string>,
    recommended: t("visibility.recommended"),
    recommendedHelp: t("visibility.recommendedHelp"),
    confirmContacts: t("visibility.confirmContacts"),
    save: t("visibility.save"),
    saving: t("visibility.saving"),
    saved: t("visibility.saved"),
    saveError: t("visibility.saveError"),
  };

  const waiting = incoming.length + outgoing.length;

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      {status ? (
        <ActionStatus tone={toneFor(status)} className="mt-6">
          {t(`connectStatus.${status}`)}
        </ActionStatus>
      ) : null}

      {passwordStatus ? (
        <ActionStatus tone="done" className="mt-6">
          {t(`passwordStatus.${passwordStatus}`)}
        </ActionStatus>
      ) : null}

      <div className="mt-6 flex min-w-0 flex-col gap-6">
        <AccountSummary
          id="account"
          name={displayName}
          initials={initialsOf(displayName)}
          avatarUrl={avatarUrl}
          email={email}
          username={username.username}
          connected={states
            .filter((state) => state.connected)
            .map((state) => ({
              provider: state.provider,
              label: t(`connections.${state.provider}`),
            }))}
          labels={{
            title: t("account.title"),
            signsInWith: t("account.signsInWith"),
            nothingConnected: t("account.nothingConnected"),
            level: level ? record(`level.${level}`) : null,
          }}
          action={
            <SignOutForm
              label={t("session.signOut")}
              className={buttonClass({ variant: "danger-outline", size: "sm" })}
            />
          }
        />

        <Panel
          id="visibility"
          title={t("visibility.title")}
          description={t("visibility.description")}
          className="scroll-mt-20"
        >
          {visibility.status === "ready" ? (
            <VisibilitySection hidden={visibility.hidden} labels={visibilityLabels} />
          ) : visibility.status === "failed" ? (
            <LoadErrorRows failure={visibility.failure} labels={errorLabels} />
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                {t("visibility.needsProfile")}
              </p>
              <Link
                href={navHref("profileEdit")}
                className={buttonClass({ variant: "outline", size: "sm" })}
              >
                {t("visibility.needsProfileAction")}
              </Link>
            </div>
          )}
        </Panel>

        {waiting > 0 ? (
          <div id="requests" className="scroll-mt-20">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h2 className="font-sans text-base font-semibold text-ink">
                {t("merge.title")}
              </h2>
              <p className="text-sm text-ink-muted">
                {t("merge.waitingCount", { count: waiting })}
              </p>
            </div>
            <div
              className={
                incoming.length > 0 && outgoing.length > 0
                  ? "grid gap-6 xl:grid-cols-2 xl:items-start"
                  : "grid gap-6"
              }
            >
              {incoming.length > 0 ? (
                <Panel
                  id="incoming-requests"
                  title={t("merge.incomingTitle")}
                  description={t("merge.incomingDescription")}
                >
                  <MergeRequestList
                    direction="incoming"
                    items={incoming}
                    labels={mergeLabels}
                  />
                </Panel>
              ) : null}

              {outgoing.length > 0 ? (
                <Panel
                  id="outgoing-requests"
                  title={t("merge.outgoingTitle")}
                  description={t("merge.outgoingDescription")}
                >
                  <MergeRequestList
                    direction="outgoing"
                    items={outgoing}
                    labels={mergeLabels}
                  />
                </Panel>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2 xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <Panel
              id="username"
              title={t("username.title")}
              description={t("username.description")}
              className="scroll-mt-20"
            >
              <UsernameSection
                identity={username}
                labels={usernameLabels}
                headed={false}
              />
            </Panel>

            <Panel
              id="privacy"
              title={t("privacy.title")}
              description={t("privacy.description")}
              className="scroll-mt-20"
            >
              <PrivacySection
                leaderboard={leaderboardEnabled}
                labels={{
                  leaderboard: {
                    label: t("privacy.leaderboard"),
                    description: t("privacy.leaderboardHelp"),
                    on: t("privacy.leaderboardOn"),
                    off: t("privacy.leaderboardOff"),
                  },
                  error: t("preferences.saveError"),
                  dataLink: t("privacy.dataLink"),
                }}
              />
            </Panel>

            <Panel
              id="appearance"
              title={t("appearance.title")}
              description={t("appearance.description")}
              className="scroll-mt-20"
            >
              <AppearanceSection
                labels={{
                  darkTheme: t("appearance.darkTheme"),
                  darkThemeHelp: t("appearance.darkThemeHelp"),
                  language: t("appearance.language"),
                  languageHelp: t("appearance.languageHelp"),
                }}
              />
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <Panel
              id="connections"
              title={t("connections.title")}
              description={t("connections.description")}
              className="scroll-mt-20"
            >
              <ConnectionList
                states={states}
                locale={locale}
                googleConfigured={googleConfigured}
              />
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                {t("connections.handoff")}
              </p>
            </Panel>

            <Panel
              id="password"
              title={passwordTitle}
              description={passwordLabels.description}
              className="scroll-mt-20"
            >
              <PasswordForm
                key={passwordMode}
                mode={passwordMode}
                email={email}
                labels={passwordLabels}
                headed={false}
              />
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
