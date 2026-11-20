"use client";

import { Check } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { ActionStatus } from "@/components/app/action-status";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useServerAction } from "@/hooks/use-server-action";
import { updateProfileVisibilityAction } from "@/lib/profile/actions";
import {
  DEFAULT_HIDDEN_PROFILE_PARTS,
  OPTIONAL_PROFILE_PARTS,
  contactPublicationRequired,
  type OptionalProfilePart,
} from "@/lib/profile/visibility";

export type VisibilityLabels = {
  alwaysTitle: string;
  optionalTitle: string;
  always: readonly { id: string; label: string }[];
  parts: Record<OptionalProfilePart, string>;
  recommended: string;
  recommendedHelp: string;
  confirmContacts: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
};

function sameParts(
  left: readonly OptionalProfilePart[],
  right: readonly OptionalProfilePart[],
) {
  return left.length === right.length && left.every((part) => right.includes(part));
}

export function VisibilitySection({
  hidden: initialHidden,
  labels,
}: {
  hidden: readonly OptionalProfilePart[];
  labels: VisibilityLabels;
}) {
  const id = useId();
  const alwaysId = `${id}-always`;
  const optionalId = `${id}-optional`;
  const [saved, setSaved] = useState<readonly OptionalProfilePart[]>(initialHidden);
  const [hidden, setHidden] = useState<readonly OptionalProfilePart[]>(initialHidden);
  const [confirmed, setConfirmed] = useState(false);

  const save = useServerAction(updateProfileVisibilityAction, {
    onSuccess: (_result, input) => {
      setSaved(input.hiddenFields);
      setConfirmed(false);
      toast.success(labels.saved);
    },
  });

  const changed = !sameParts(saved, hidden);
  const serverRequiresConfirmation =
    save.error?.result.code === "profileContactConfirmationRequired";
  const needsConfirmation =
    serverRequiresConfirmation || contactPublicationRequired(saved, hidden);
  const canSave = changed && !save.isPending && (!needsConfirmation || confirmed);

  function choose(next: readonly OptionalProfilePart[]) {
    setHidden(next);
    setConfirmed(false);
    save.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby={alwaysId} className="flex flex-col gap-3">
        <h3 id={alwaysId} className="font-sans text-sm font-semibold text-ink">
          {labels.alwaysTitle}
        </h3>
        <ul className="flex flex-wrap gap-2">
          {labels.always.map((item) => (
            <li
              key={item.id}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface-soft px-3 text-sm text-ink"
            >
              <Check aria-hidden="true" className="size-3.5 text-accent-ink" />
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={optionalId} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h3 id={optionalId} className="font-sans text-sm font-semibold text-ink">
            {labels.optionalTitle}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={save.isPending}
            onClick={() => choose([...DEFAULT_HIDDEN_PROFILE_PARTS])}
          >
            {labels.recommended}
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          {labels.recommendedHelp}
        </p>
        <ul aria-labelledby={optionalId} className="grid gap-x-10 sm:grid-cols-2">
          {OPTIONAL_PROFILE_PARTS.map((part) => (
            <li key={part} className="border-b border-border">
              <Switch
                label={labels.parts[part]}
                checked={!hidden.includes(part)}
                disabled={save.isPending}
                onCheckedChange={(shown) =>
                  choose(
                    shown
                      ? hidden.filter((value) => value !== part)
                      : [...hidden, part],
                  )
                }
              />
            </li>
          ))}
        </ul>
      </section>

      {needsConfirmation ? (
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-ink">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-action"
          />
          {labels.confirmContacts}
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          disabled={!canSave}
          aria-busy={save.isPending}
          onClick={() =>
            save.mutate({
              hiddenFields: [...hidden],
              confirmContactPublication: confirmed,
            })
          }
        >
          {save.isPending ? labels.saving : labels.save}
        </Button>
        {save.isError && !serverRequiresConfirmation ? (
          <ActionStatus tone="error">{labels.saveError}</ActionStatus>
        ) : null}
      </div>
    </div>
  );
}
