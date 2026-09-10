import { useTranslations } from "next-intl";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { ActionStatus, type ActionTone } from "@/components/app/action-status";
import { PageHeader } from "@/components/app/page-header";
import { Panel } from "@/components/app/panel";
import { SignOutForm } from "@/components/auth/sign-out-form";
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
import { buttonClass } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import {
  connectionStates,
  isConnectStatus,
  type ConnectionState,
} from "@/lib/account/connections";
import { ACCOUNT_ERROR_KEYS, type ConnectStatus } from "@/lib/account/types";
import { getMe, listMergeRequests } from "@/lib/api/account.server";
import type { MergeRequest } from "@/lib/api/schemas";
import { isGoogleConfigured } from "@/lib/auth/config";

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
  const [me, requests, format, t] = await Promise.all([
    getMe(),
    listMergeRequests(),
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
      states={connectionStates(me)}
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
  states,
  email,
  hasPassword,
  googleConfigured,
  status,
  passwordStatus,
  incoming,
  outgoing,
}: {
  locale: Locale;
  states: readonly ConnectionState[];
  email: string | null;
  hasPassword: boolean;
  googleConfigured: boolean;
  status: ConnectStatus | null;
  passwordStatus: PasswordStatus | null;
  incoming: readonly MergeRequestItem[];
  outgoing: readonly MergeRequestItem[];
}) {
  const t = useTranslations("settings");
  const errors = Object.fromEntries(
    ACCOUNT_ERROR_KEYS.map((key) => [key, t(`errors.${key}`)]),
  );

  const passwordLabels: PasswordFormLabels = {
    title: t(`connections.${hasPassword ? "changePasswordTitle" : "setPasswordTitle"}`),
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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          id="connections"
          title={t("connections.title")}
          description={t("connections.description")}
          className="enter-rise xl:col-span-2"
        >
          <ConnectionList
            states={states}
            locale={locale}
            googleConfigured={googleConfigured}
          />
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            {t("connections.handoff")}
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <PasswordForm
              key={hasPassword ? "change" : "set"}
              locale={locale}
              mode={hasPassword ? "change" : "set"}
              email={email}
              labels={passwordLabels}
            />
          </div>
        </Panel>

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

        <Panel
          id="session"
          title={t("session.title")}
          description={t("session.description")}
          className="xl:col-span-2"
        >
          <SignOutForm
            locale={locale}
            label={t("session.signOut")}
            showIcon={false}
            className={buttonClass({ variant: "outline", size: "sm" })}
          />
        </Panel>
      </div>
    </>
  );
}
