import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaceFields, type PlaceLabels } from "./place-fields";

const labels = new Proxy({} as PlaceLabels, {
  get: (_target, key) =>
    key === "educationTypes"
      ? { school: "School", university: "University", gap_year: "Gap year" }
      : String(key),
});

const chilonzor = {
  id: "1726294",
  region: "tashkent-city",
  kind: "district" as const,
  name: { uz: "Chilonzor tumani", ru: "Чиланзарский район", en: "Chilonzor District" },
};

const university = {
  id: "university-q1",
  type: "university" as const,
  region: "tashkent-city",
  districtId: null,
  name: { uz: "Universitet", ru: "Университет", en: "University One" },
};

const value = {
  region: "tashkent-city",
  districtId: "1726294",
  educationType: "university",
  institutionId: "university-q1",
  gradeYear: "2",
};

function setup(unavailable?: React.ReactNode) {
  return render(
    <form aria-label="place">
      <PlaceFields
        idPrefix="p"
        value={value}
        onChange={() => {}}
        errors={{}}
        regions={[{ value: "tashkent-city", label: "Tashkent city" }]}
        districts={[chilonzor]}
        universities={[university]}
        initialInstitution={null}
        locale="en"
        labels={labels}
        unavailable={unavailable}
      />
    </form>,
  );
}

describe("PlaceFields", () => {
  it("credits the directory sources beside the institution", () => {
    setup();

    expect(screen.getByRole("link", { name: "attribution" })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/copyright",
    );
  });

  it("keeps the saved place and shows the load error when the lists are unavailable", () => {
    setup(<p role="alert">Lists unavailable</p>);

    expect(screen.getByRole("alert")).toHaveTextContent("Lists unavailable");
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    const data = new FormData(
      screen.getByRole("form", { name: "place" }) as HTMLFormElement,
    );
    expect(Object.fromEntries(data)).toEqual(value);
  });
});
