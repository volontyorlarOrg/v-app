"use client";

import { ActionStatus } from "@/components/app/action-status";
import { Button, buttonClass } from "@/components/ui/button";
import { useActionForm, type FormAction } from "@/hooks/use-action-form";
import {
  approveMergeRequestAction,
  cancelMergeRequestAction,
  rejectMergeRequestAction,
} from "@/lib/account/actions";
import {
  REAUTHENTICATE_PATH,
  accountErrorKey,
  mergeRequestFormSchema,
} from "@/lib/account/connections";
import type { ActionResult } from "@/lib/api/action-result";

export type MergeRequestItem = {
  id: string;
  provider: string;
  counterparty: string | null;
  asked: string;
  expires: string;
};

export type MergeRequestLabels = {
  empty: string;
  approve: string;
  approving: string;
  reject: string;
  rejecting: string;
  cancel: string;
  cancelling: string;
  rejected: string;
  cancelled: string;
  freshAuthTitle: string;
  freshAuthDescription: string;
  freshAuthAction: string;
  errors: Record<string, string>;
};

function useRequestForm(action: FormAction, item: MergeRequestItem, locale: string) {
  return useActionForm({
    schema: mergeRequestFormSchema,
    defaultValues: { requestId: item.id, locale },
    action,
  });
}

function HiddenFields({
  register,
  item,
  locale,
}: {
  register: ReturnType<typeof useRequestForm>["form"]["register"];
  item: MergeRequestItem;
  locale: string;
}) {
  return (
    <>
      <input type="hidden" {...register("requestId")} defaultValue={item.id} />
      <input type="hidden" {...register("locale")} defaultValue={locale} />
    </>
  );
}

function Summary({ item }: { item: MergeRequestItem }) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-ink">
        {item.counterparty ?? item.provider}
      </p>
      {item.counterparty ? (
        <p className="mt-0.5 text-sm text-ink-muted">{item.provider}</p>
      ) : null}
      <p className="mt-0.5 text-sm text-ink-muted">{item.asked}</p>
      <p className="text-sm text-ink-muted">{item.expires}</p>
    </div>
  );
}

function failureOf(
  result: ActionResult,
  labels: MergeRequestLabels,
): { key: string; message: string } | null {
  if (result.status !== "error") return null;
  const key = accountErrorKey(result.code);
  return { key, message: labels.errors[key] ?? labels.errors.unknown ?? "" };
}

function FreshAuth({ labels, locale }: { labels: MergeRequestLabels; locale: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-border-control bg-surface-sunk p-4"
    >
      <p className="text-sm font-semibold text-ink">{labels.freshAuthTitle}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {labels.freshAuthDescription}
      </p>
      <form action={REAUTHENTICATE_PATH} method="post">
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className={buttonClass({ variant: "outline", size: "sm", className: "mt-3" })}
        >
          {labels.freshAuthAction}
        </button>
      </form>
    </div>
  );
}

function IncomingRow({
  item,
  locale,
  labels,
}: {
  item: MergeRequestItem;
  locale: string;
  labels: MergeRequestLabels;
}) {
  const approve = useRequestForm(approveMergeRequestAction, item, locale);
  const reject = useRequestForm(rejectMergeRequestAction, item, locale);
  const pending = approve.pending || reject.pending;
  const failure = failureOf(approve.result, labels) ?? failureOf(reject.result, labels);

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Summary item={item} />
        <div className="flex flex-wrap gap-2">
          <form {...approve.formProps} className="contents">
            <HiddenFields
              register={approve.form.register}
              item={item}
              locale={locale}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {approve.pending ? labels.approving : labels.approve}
            </Button>
          </form>
          <form {...reject.formProps} className="contents">
            <HiddenFields register={reject.form.register} item={item} locale={locale} />
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              {reject.pending ? labels.rejecting : labels.reject}
            </Button>
          </form>
        </div>
      </div>
      {failure?.key === "recentAuthenticationRequired" ? (
        <FreshAuth labels={labels} locale={locale} />
      ) : failure ? (
        <ActionStatus tone="error">{failure.message}</ActionStatus>
      ) : null}
      {reject.result.status === "ok" ? (
        <ActionStatus tone="done">{labels.rejected}</ActionStatus>
      ) : null}
    </li>
  );
}

function OutgoingRow({
  item,
  locale,
  labels,
}: {
  item: MergeRequestItem;
  locale: string;
  labels: MergeRequestLabels;
}) {
  const cancel = useRequestForm(cancelMergeRequestAction, item, locale);
  const failure = failureOf(cancel.result, labels);

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Summary item={item} />
        <form {...cancel.formProps} className="contents">
          <HiddenFields register={cancel.form.register} item={item} locale={locale} />
          <Button type="submit" size="sm" variant="outline" disabled={cancel.pending}>
            {cancel.pending ? labels.cancelling : labels.cancel}
          </Button>
        </form>
      </div>
      {failure ? <ActionStatus tone="error">{failure.message}</ActionStatus> : null}
      {cancel.result.status === "ok" ? (
        <ActionStatus tone="done">{labels.cancelled}</ActionStatus>
      ) : null}
    </li>
  );
}

export function MergeRequestList({
  direction,
  items,
  locale,
  labels,
}: {
  direction: "incoming" | "outgoing";
  items: readonly MergeRequestItem[];
  locale: string;
  labels: MergeRequestLabels;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">{labels.empty}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) =>
        direction === "incoming" ? (
          <IncomingRow key={item.id} item={item} locale={locale} labels={labels} />
        ) : (
          <OutgoingRow key={item.id} item={item} locale={locale} labels={labels} />
        ),
      )}
    </ul>
  );
}
