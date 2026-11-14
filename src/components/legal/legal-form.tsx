"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/api/action-result";
import { LEGAL_REQUEST_KINDS } from "@/lib/legal/constants";
import { giveConsentAction, requestDataAction } from "@/lib/legal/actions";

const idle: ActionResult = { status: "idle" };

export type ConsentFormLabels = {
  accept: string;
  leaderboard: string;
  leaderboardHelp: string;
  publicProfile: string;
  publicProfileHelp: string;
  optional: string;
  submit: string;
  pending: string;
  required: string;
  error: string;
};

function Choice({
  name,
  label,
  help,
  required = false,
}: {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
}) {
  return (
    <label className="flex min-h-11 items-start gap-3 text-base leading-relaxed text-ink">
      <input
        type="checkbox"
        name={name}
        required={required}
        className="mt-0.5 size-5 shrink-0 accent-action"
      />
      <span>
        <span className={required ? "font-semibold" : undefined}>{label}</span>
        {help ? <span className="mt-0.5 block text-ink-muted">{help}</span> : null}
      </span>
    </label>
  );
}

export function ConsentForm({
  locale,
  next,
  labels,
}: {
  locale: string;
  next: string | null;
  labels: ConsentFormLabels;
}) {
  const [state, action, pending] = useActionState(giveConsentAction, idle);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Choice name="accepted" label={labels.accept} required />
      <fieldset className="flex flex-col gap-3 border-t border-border pt-4">
        <legend className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {labels.optional}
        </legend>
        <Choice
          name="leaderboard"
          label={labels.leaderboard}
          help={labels.leaderboardHelp}
        />
        <Choice
          name="publicProfile"
          label={labels.publicProfile}
          help={labels.publicProfileHelp}
        />
      </fieldset>
      {state.status === "error" ? (
        <ActionStatus tone="error">
          {state.code === "consentRequired" ? labels.required : labels.error}
        </ActionStatus>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? labels.pending : labels.submit}
      </Button>
    </form>
  );
}

export type DataRequestLabels = {
  kind: string;
  kinds: Record<(typeof LEGAL_REQUEST_KINDS)[number], string>;
  message: string;
  submit: string;
  pending: string;
  sent: string;
  error: string;
};

export function DataRequestForm({ labels }: { labels: DataRequestLabels }) {
  const [state, action, pending] = useActionState(requestDataAction, idle);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-ink" htmlFor="request-kind">
        {labels.kind}
      </label>
      <NativeSelect id="request-kind" name="kind">
        {LEGAL_REQUEST_KINDS.map((kind) => (
          <NativeSelectOption value={kind} key={kind}>
            {labels.kinds[kind]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <label className="text-sm font-semibold text-ink" htmlFor="request-message">
        {labels.message}
      </label>
      <Textarea id="request-message" name="message" maxLength={2000} rows={3} />
      <div aria-live="polite">
        {state.status === "ok" ? (
          <ActionStatus tone="done">{labels.sent}</ActionStatus>
        ) : null}
        {state.status === "error" ? (
          <ActionStatus tone="error">{labels.error}</ActionStatus>
        ) : null}
      </div>
      <Button type="submit" variant="outline" disabled={pending} className="self-start">
        {pending ? labels.pending : labels.submit}
      </Button>
    </form>
  );
}
