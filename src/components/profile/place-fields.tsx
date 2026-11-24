"use client";

import { GraduationCap, School, Sunrise } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { RegionOptions, type RegionOption } from "@/components/profile/region-options";
import {
  SearchSelect,
  type SearchSelectOption,
} from "@/components/profile/search-select";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PROFILE_TEXT_LIMITS } from "@/lib/profile/input";
import {
  EDUCATION_TYPES,
  isEducationType,
  localName,
  matchesOption,
  needsInstitution,
  numberedSchoolOption,
  schoolNumberQuery,
  sortByLocalName,
  type DistrictOption,
  type EducationType,
  type InstitutionOption,
  type PlaceOption,
} from "@/lib/profile/place";
import { cn } from "@/lib/utils";

export type PlaceValue = {
  region: string;
  districtId: string;
  educationType: string;
  institutionId: string;
  gradeYear: string;
};

export type PlaceFieldName = keyof PlaceValue;

export const PLACE_FIELD_NAMES = [
  "region",
  "districtId",
  "educationType",
  "institutionId",
  "gradeYear",
] as const satisfies readonly PlaceFieldName[];

export type PlaceLabels = {
  region: string;
  regionPlaceholder: string;
  district: string;
  districtPlaceholder: string;
  districtSearch: string;
  districtEmpty: string;
  districtNeedsRegion: string;
  education: string;
  educationTypes: Record<EducationType, string>;
  school: string;
  university: string;
  schoolPlaceholder: string;
  universityPlaceholder: string;
  institutionSearch: string;
  schoolEmpty: string;
  universityEmpty: string;
  schoolNumberHint: string;
  schoolsLoading: string;
  schoolsFailed: string;
  schoolNeedsDistrict: string;
  schoolDistrict: string;
  otherDistrict: string;
  ownDistrict: string;
  gradeSchool: string;
  gradeUniversity: string;
  gapYearNote: string;
  gradeRequired: string;
  previous: string;
};

type SchoolsState =
  | { status: "idle" | "loading" | "failed"; items: InstitutionOption[] }
  | { status: "ready"; items: InstitutionOption[] };

const schoolRequests = new Map<string, Promise<InstitutionOption[]>>();

function loadSchools(districtId: string): Promise<InstitutionOption[]> {
  const cached = schoolRequests.get(districtId);
  if (cached) return cached;
  const request = fetch(`/api/directories/schools?district=${districtId}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { items?: InstitutionOption[] };
      return body.items ?? [];
    })
    .catch((error: unknown) => {
      schoolRequests.delete(districtId);
      throw error;
    });
  schoolRequests.set(districtId, request);
  return request;
}

function useSchools(districtId: string): SchoolsState {
  const [state, setState] = useState<SchoolsState & { key: string }>({
    key: "",
    status: "idle",
    items: [],
  });

  useEffect(() => {
    if (!districtId) return;
    let live = true;
    loadSchools(districtId).then(
      (items) => {
        if (live) setState({ key: districtId, status: "ready", items });
      },
      () => {
        if (live) setState({ key: districtId, status: "failed", items: [] });
      },
    );
    return () => {
      live = false;
    };
  }, [districtId]);

  if (!districtId) return { status: "idle", items: [] };
  if (state.key !== districtId) return { status: "loading", items: [] };
  return state;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

function PlaceField({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel id={`${id}-label`} htmlFor={id}>
        {label}
      </FieldLabel>
      {children}
      {help ? <FieldDescription id={`${id}-help`}>{help}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

const EDUCATION_ICONS = {
  school: School,
  university: GraduationCap,
  gap_year: Sunrise,
} as const;

export function PlaceFields({
  idPrefix,
  value,
  onChange,
  errors,
  regions,
  districts,
  universities,
  initialInstitution,
  previous,
  locale,
  labels,
}: {
  idPrefix: string;
  value: PlaceValue;
  onChange: (patch: Partial<PlaceValue>) => void;
  errors: Partial<Record<PlaceFieldName, string | undefined>>;
  regions: readonly RegionOption[];
  districts: readonly DistrictOption[];
  universities: readonly InstitutionOption[];
  initialInstitution: PlaceOption | null;
  previous?: { city: string; school: string };
  locale: string;
  labels: PlaceLabels;
}) {
  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const [picked, setPicked] = useState<{ id: string; label: string } | null>(
    initialInstitution
      ? { id: initialInstitution.id, label: localName(initialInstitution.name, locale) }
      : null,
  );
  const [schoolScope, setSchoolScope] = useState<string | null>(null);

  const regionLabel = useMemo(
    () => new Map(regions.map((region) => [region.value, region.label])),
    [regions],
  );
  const regionDistricts = useMemo(
    () =>
      sortByLocalName(
        districts.filter((district) => district.region === value.region),
        locale,
      ),
    [districts, value.region, locale],
  );
  const districtById = useMemo(
    () => new Map(districts.map((district) => [district.id, district])),
    [districts],
  );
  const district = districtById.get(value.districtId) ?? null;
  const education = isEducationType(value.educationType) ? value.educationType : null;
  const scopeId = schoolScope ?? value.districtId;
  const scopeDistrict = districtById.get(scopeId) ?? null;
  const schools = useSchools(education === "school" ? scopeId : "");

  const districtOptions = useMemo<SearchSelectOption[]>(
    () =>
      regionDistricts.map((option) => ({
        id: option.id,
        label: localName(option.name, locale),
      })),
    [regionDistricts, locale],
  );
  const allDistrictOptions = useMemo<SearchSelectOption[]>(
    () =>
      sortByLocalName(districts, locale).map((option) => ({
        id: option.id,
        label: localName(option.name, locale),
        hint: regionLabel.get(option.region),
      })),
    [districts, locale, regionLabel],
  );
  const institutionOptions = useMemo<SearchSelectOption[]>(() => {
    const source =
      education === "school" ? schools.items : sortByLocalName(universities, locale);
    return source.map((option) => ({
      id: option.id,
      label: localName(option.name, locale),
      hint: education === "university" ? regionLabel.get(option.region) : undefined,
    }));
  }, [education, schools.items, universities, locale, regionLabel]);
  const namesById = useMemo(() => {
    const source = education === "school" ? schools.items : universities;
    return new Map(source.map((option) => [option.id, option.name]));
  }, [education, schools.items, universities]);

  const filterOption = useCallback(
    (option: SearchSelectOption, query: string) =>
      matchesOption(
        {
          id: option.id,
          name: namesById.get(option.id) ?? {
            uz: option.label,
            ru: option.label,
            en: option.label,
          },
        },
        query,
      ),
    [namesById],
  );
  const filterDistrict = useCallback(
    (option: SearchSelectOption, query: string) => {
      const found = districtById.get(option.id);
      return found ? matchesOption(found, query) : false;
    },
    [districtById],
  );
  const numberedSchool = useCallback(
    (query: string): SearchSelectOption | null => {
      const number = schoolNumberQuery(query);
      if (number === null || !scopeDistrict) return null;
      const option = numberedSchoolOption(scopeDistrict, number);
      return { id: option.id, label: localName(option.name, locale) };
    },
    [scopeDistrict, locale],
  );

  const selectedInstitution =
    picked && picked.id === value.institutionId
      ? picked.label
      : value.institutionId
        ? (institutionOptions.find((option) => option.id === value.institutionId)
            ?.label ?? null)
        : null;

  const chooseRegion = (region: string) => {
    const keep = districtById.get(value.districtId)?.region === region;
    onChange({ region, districtId: keep ? value.districtId : "" });
  };

  const chooseEducation = (next: EducationType) => {
    if (next === education) return;
    setPicked(null);
    setSchoolScope(null);
    onChange({
      educationType: next,
      institutionId: "",
      ...(next === "gap_year" ? { gradeYear: "" } : {}),
    });
  };

  const schoolStatus =
    education !== "school"
      ? undefined
      : !scopeDistrict
        ? labels.schoolNeedsDistrict
        : schools.status === "loading"
          ? labels.schoolsLoading
          : schools.status === "failed"
            ? labels.schoolsFailed
            : undefined;

  const previousHint = (text: string | undefined) =>
    text?.trim() ? fill(labels.previous, { text: text.trim() }) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <PlaceField id={fieldId("region")} label={labels.region} error={errors.region}>
          <NativeSelect
            id={fieldId("region")}
            name="region"
            value={value.region}
            aria-invalid={Boolean(errors.region) || undefined}
            onChange={(event) => chooseRegion(event.target.value)}
          >
            <RegionOptions placeholder={labels.regionPlaceholder} regions={regions} />
          </NativeSelect>
        </PlaceField>
        <PlaceField
          id={fieldId("districtId")}
          label={labels.district}
          help={
            value.region
              ? value.districtId
                ? undefined
                : previousHint(previous?.city)
              : labels.districtNeedsRegion
          }
          error={errors.districtId}
        >
          <SearchSelect
            id={fieldId("districtId")}
            name="districtId"
            value={value.districtId}
            selectedLabel={district ? localName(district.name, locale) : null}
            options={districtOptions}
            onChange={(option) => onChange({ districtId: option.id })}
            filter={filterDistrict}
            disabled={!value.region}
            invalid={Boolean(errors.districtId)}
            describedBy={`${fieldId("districtId")}-help`}
            labels={{
              placeholder: labels.districtPlaceholder,
              search: labels.districtSearch,
              empty: labels.districtEmpty,
            }}
          />
        </PlaceField>
      </div>

      <fieldset
        aria-invalid={Boolean(errors.educationType) || undefined}
        className="flex min-w-0 flex-col gap-2.5"
      >
        <legend className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
          {labels.education}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {EDUCATION_TYPES.map((type) => {
            const Icon = EDUCATION_ICONS[type];
            const checked = education === type;
            return (
              <label
                key={type}
                className={cn(
                  "relative flex min-h-12 cursor-pointer items-center justify-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition-colors has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-primary-ink sm:justify-center sm:px-2 sm:text-center",
                  checked
                    ? "border-action bg-surface-soft text-primary-ink"
                    : "border-input bg-field text-ink hover:border-primary-ink",
                  errors.educationType && !checked && "border-ink",
                )}
              >
                <input
                  type="radio"
                  name="educationType"
                  value={type}
                  checked={checked}
                  onChange={() => chooseEducation(type)}
                  className="sr-only"
                />
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 leading-tight">
                  {labels.educationTypes[type]}
                </span>
              </label>
            );
          })}
        </div>
        {education === null ? (
          <input type="hidden" name="educationType" value="" />
        ) : null}
        <FieldError>{errors.educationType}</FieldError>
      </fieldset>

      {needsInstitution(education) ? (
        <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            <PlaceField
              id={fieldId("institutionId")}
              label={education === "school" ? labels.school : labels.university}
              help={value.institutionId ? undefined : previousHint(previous?.school)}
              error={errors.institutionId}
            >
              <SearchSelect
                id={fieldId("institutionId")}
                name="institutionId"
                value={value.institutionId}
                selectedLabel={selectedInstitution}
                options={
                  education === "school" && !scopeDistrict ? [] : institutionOptions
                }
                onChange={(option) => {
                  setPicked({ id: option.id, label: option.label });
                  onChange({ institutionId: option.id });
                }}
                filter={filterOption}
                extra={education === "school" ? numberedSchool : undefined}
                footer={education === "school" ? labels.schoolNumberHint : undefined}
                status={schoolStatus}
                invalid={Boolean(errors.institutionId)}
                describedBy={`${fieldId("institutionId")}-help`}
                labels={{
                  placeholder:
                    education === "school"
                      ? labels.schoolPlaceholder
                      : labels.universityPlaceholder,
                  search: labels.institutionSearch,
                  empty:
                    education === "school"
                      ? labels.schoolEmpty
                      : labels.universityEmpty,
                }}
              />
            </PlaceField>
            {education === "school" && value.districtId ? (
              schoolScope === null ? (
                <button
                  type="button"
                  onClick={() => setSchoolScope(value.districtId)}
                  className="self-start text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
                >
                  {labels.otherDistrict}
                </button>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg bg-surface-soft p-3">
                  <PlaceField
                    id={fieldId("schoolDistrict")}
                    label={labels.schoolDistrict}
                  >
                    <SearchSelect
                      id={fieldId("schoolDistrict")}
                      name="schoolDistrict"
                      value={schoolScope}
                      selectedLabel={
                        scopeDistrict ? localName(scopeDistrict.name, locale) : null
                      }
                      options={allDistrictOptions}
                      onChange={(option) => setSchoolScope(option.id)}
                      filter={filterDistrict}
                      labels={{
                        placeholder: labels.districtPlaceholder,
                        search: labels.districtSearch,
                        empty: labels.districtEmpty,
                      }}
                    />
                  </PlaceField>
                  <button
                    type="button"
                    onClick={() => setSchoolScope(null)}
                    className="self-start text-sm font-semibold text-primary-ink underline-offset-4 hover:underline"
                  >
                    {labels.ownDistrict}
                  </button>
                </div>
              )
            ) : null}
          </div>
          <PlaceField
            id={fieldId("gradeYear")}
            label={education === "school" ? labels.gradeSchool : labels.gradeUniversity}
            error={errors.gradeYear}
          >
            <Input
              id={fieldId("gradeYear")}
              name="gradeYear"
              value={value.gradeYear}
              aria-invalid={Boolean(errors.gradeYear) || undefined}
              maxLength={PROFILE_TEXT_LIMITS.gradeYear}
              inputMode={education === "school" ? "numeric" : undefined}
              onChange={(event) => onChange({ gradeYear: event.target.value })}
            />
          </PlaceField>
        </div>
      ) : (
        <>
          <input type="hidden" name="institutionId" value="" />
          <input type="hidden" name="gradeYear" value={value.gradeYear} />
          {education === "gap_year" ? (
            <p className="text-sm leading-relaxed text-ink-muted">
              {labels.gapYearNote}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

type PlaceForm = FieldValues & PlaceValue;

export function usePlaceValue<T extends PlaceForm>(form: UseFormReturn<T>) {
  const watched = form.watch();
  const value: PlaceValue = {
    region: watched.region ?? "",
    districtId: watched.districtId ?? "",
    educationType: watched.educationType ?? "",
    institutionId: watched.institutionId ?? "",
    gradeYear: watched.gradeYear ?? "",
  };
  const onChange = (patch: Partial<PlaceValue>) => {
    const submitted = form.formState.isSubmitted;
    for (const [key, next] of Object.entries(patch)) {
      form.setValue(key as Path<T>, next as never, {
        shouldDirty: true,
        shouldValidate: submitted,
      });
    }
    if (submitted) void form.trigger(PLACE_FIELD_NAMES as unknown as Path<T>[]);
  };
  return { value, onChange };
}
