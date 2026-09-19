import { useTranslations } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import {
  UsernameSection,
  type UsernameLabels,
} from "@/components/account/username-section";
import { ActionStatus, type ActionTone } from "@/components/app/action-status";
import { PageHeader } from "@/components/app/page-header";
import { Panel } from "@/components/app/panel";
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
import { SettingsIndex } from "@/components/settings/settings-index";
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
import { getRecord } from "@/lib/api/record.server";
import type { MergeRequest } from "@/lib/api/schemas";
import { requireSession } from "@/lib/api/session.server";
import { isGoogleConfigured } from "@/lib/auth/config";
import { initialsOf } from "@/lib/profile/initials";
import { levelFor, type Level } from "@/lib/record/levels";

export const dynamic = "force-dynamic";

const DONE_STATUSES: readonly ConnectStatus[] = ["linked", "alreadyLinked"];
const INFO_STATUSES: readonly ConnectStatus[] = ["approvalRequired", "alreadyPending"];
const PASSWORD_STATUSES = ["set", "changed"] as const;

type PasswordStatus = (typeof PASSWORD_STATUSES)[number];

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
  const [session, me, requests, volunteerRecord, format, t] = await Promise.all([
    requireSession(),
    getMe(),
    listMergeRequests(),
    getRecord(),
    getFormatter({ locale }),
    getTranslations({ locale, namespace: "settings" }),
  ]);

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
      level={levelFor(volunteerRecord.counts)}
      states={connectionStates(me)}
      username={usernameIdentity(me)}
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
  level,
  states,
  username,
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
  level: Level;
  states: readonly ConnectionState[];
  username: UsernameIdentity;
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

  const waiting = incoming.length + outgoing.length;

  const index = [
    { id: "account", label: t("account.title") },
    { id: "appearance", label: t("appearance.title") },
    { id: "connections", label: t("connections.title") },
    { id: "password", label: t("password.label") },
    ...(username.editable ? [{ id: "username", label: t("username.title") }] : []),
    ...(waiting > 0 ? [{ id: "requests", label: t("merge.title") }] : []),
  ];

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

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <SettingsIndex label={t("index.label")} items={index} />

        <div className="flex min-w-0 flex-col gap-6">
          <AccountSummary
            id="account"
            name={displayName}
            initials={initialsOf(displayName)}
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
              level: record(`level.${level}`),
            }}
          />

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
              locale={locale}
              mode={passwordMode}
              email={email}
              labels={passwordLabels}
              headed={false}
            />
          </Panel>

          {username.editable ? (
            <Panel
              id="username"
              title={t("username.title")}
              description={t("username.description")}
              className="scroll-mt-20"
            >
              <UsernameSection
                locale={locale}
                identity={username}
                labels={usernameLabels}
                headed={false}
              />
            </Panel>
          ) : null}

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
                      locale={locale}
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
                      locale={locale}
                      labels={mergeLabels}
                    />
                  </Panel>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
