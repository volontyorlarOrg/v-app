import type { PlaceCheckLabels } from "@/components/profile/place-check-dialog";
import type { PlaceLabels } from "@/components/profile/place-fields";
import { EDUCATION_TYPES, type EducationType } from "@/lib/profile/place";

type Translate = {
  (key: string): string;
  raw: (key: string) => unknown;
};

const TEXT_KEYS = [
  "region",
  "regionPlaceholder",
  "district",
  "districtPlaceholder",
  "districtSearch",
  "districtEmpty",
  "districtNeedsRegion",
  "education",
  "school",
  "university",
  "schoolPlaceholder",
  "universityPlaceholder",
  "institutionSearch",
  "schoolEmpty",
  "universityEmpty",
  "schoolNumberHint",
  "schoolsLoading",
  "schoolsFailed",
  "schoolNeedsDistrict",
  "schoolDistrict",
  "otherDistrict",
  "ownDistrict",
  "gradeSchool",
  "gradeUniversity",
  "gapYearNote",
  "gradeRequired",
  "attribution",
] as const satisfies readonly (keyof PlaceLabels)[];

export function placeLabels(t: Translate): PlaceLabels {
  const text = Object.fromEntries(
    TEXT_KEYS.map((key) => [key, t(`place.${key}`)]),
  ) as Record<(typeof TEXT_KEYS)[number], string>;
  return {
    ...text,
    educationTypes: Object.fromEntries(
      EDUCATION_TYPES.map((type) => [type, t(`place.educationTypes.${type}`)]),
    ) as Record<EducationType, string>,
    previous: String(t.raw("place.previous")),
  };
}

export function placeCheckLabels(
  t: Translate,
  action: "saveApply" | "saveSubmit",
): PlaceCheckLabels {
  return {
    title: t("placeCheck.title"),
    lead: t("placeCheck.lead"),
    save: t(`placeCheck.${action}`),
    saving: t("placeCheck.saving"),
    cancel: t("placeCheck.cancel"),
    close: t("placeCheck.close"),
    error: t("placeCheck.error"),
    required: t("place.required"),
    invalid: t("fieldInvalid"),
    place: placeLabels(t),
  };
}
