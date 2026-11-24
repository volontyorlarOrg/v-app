"use client";

import { MapPinned } from "lucide-react";
import { useId } from "react";

import { ActionStatus } from "@/components/app/action-status";
import {
  PlaceFields,
  usePlaceValue,
  type PlaceFieldName,
  type PlaceLabels,
} from "@/components/profile/place-fields";
import type { RegionOption } from "@/components/profile/region-options";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActionForm } from "@/hooks/use-action-form";
import type { Region } from "@/lib/opportunities/types";
import { confirmPlaceAction } from "@/lib/profile/actions";
import { placeFormSchema, placeFormValues } from "@/lib/profile/input";
import type {
  DistrictOption,
  EducationType,
  InstitutionOption,
  PlaceOption,
} from "@/lib/profile/place";

export type PlaceCheckLabels = {
  title: string;
  lead: string;
  save: string;
  saving: string;
  cancel: string;
  close: string;
  error: string;
  required: string;
  invalid: string;
  place: PlaceLabels;
};

export type PlaceCheckProfile = {
  region: Region | null;
  districtId: string | null;
  educationType: EducationType | null;
  institutionId: string | null;
  institution: PlaceOption | null;
  gradeYear: string;
  city: string;
  school: string;
};

export type PlaceCheckData = {
  profile: PlaceCheckProfile;
  regions: readonly RegionOption[];
  districts: readonly DistrictOption[];
  universities: readonly InstitutionOption[];
  locale: string;
  labels: PlaceCheckLabels;
};

export function PlaceCheckDialog({
  open,
  onOpenChange,
  data,
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PlaceCheckData;
  onConfirmed: () => void;
}) {
  const { labels } = data;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={labels.close} className="max-w-2xl gap-5 p-5 sm:p-7">
        <DialogHeader>
          <span
            aria-hidden="true"
            className="mb-1 inline-grid size-10 place-items-center rounded-lg bg-surface-soft text-primary-ink"
          >
            <MapPinned className="size-5" />
          </span>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.lead}</DialogDescription>
        </DialogHeader>
        {open ? (
          <PlaceCheckForm
            data={data}
            onCancel={() => onOpenChange(false)}
            onSaved={() => {
              onOpenChange(false);
              onConfirmed();
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PlaceCheckForm({
  data,
  onCancel,
  onSaved,
}: {
  data: PlaceCheckData;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const id = useId();
  const { profile, labels } = data;
  const { form, result, pending, formProps } = useActionForm({
    schema: placeFormSchema,
    defaultValues: placeFormValues(profile),
    action: confirmPlaceAction,
    onSuccess: onSaved,
  });
  const place = usePlaceValue(form);
  const { formState } = form;

  const errorFor = (name: PlaceFieldName) => {
    const local = formState.errors[name]?.message;
    const remote = result.status === "error" ? result.fields[name] : undefined;
    if (local === "required" || remote?.includes("required"))
      return name === "gradeYear" ? labels.place.gradeRequired : labels.required;
    return local || remote ? labels.invalid : undefined;
  };
  const errors = Object.fromEntries(
    (
      ["region", "districtId", "educationType", "institutionId", "gradeYear"] as const
    ).map((name) => [name, errorFor(name)]),
  ) as Partial<Record<PlaceFieldName, string>>;

  return (
    <form {...formProps} className="flex flex-col gap-6">
      <PlaceFields
        idPrefix={id}
        value={place.value}
        onChange={place.onChange}
        errors={errors}
        regions={data.regions}
        districts={data.districts}
        universities={data.universities}
        initialInstitution={profile.institution}
        previous={{ city: profile.city, school: profile.school }}
        locale={data.locale}
        labels={labels.place}
      />
      {result.status === "error" ? (
        <ActionStatus tone="error">{labels.error}</ActionStatus>
      ) : null}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          {labels.cancel}
        </Button>
        <Button type="submit" disabled={pending} className="sm:min-w-44">
          {pending ? labels.saving : labels.save}
        </Button>
      </div>
    </form>
  );
}
