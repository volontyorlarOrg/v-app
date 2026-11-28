import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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

function setup(unavailable?: React.ReactNode, place = value) {
  return render(
    <form aria-label="place">
      <PlaceFields
        idPrefix="p"
        value={place}
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PlaceFields", () => {
  it("ends the school list with the district's other school", async () => {
    const school = {
      id: "school-1726294-5",
      type: "school",
      region: "tashkent-city",
      districtId: "1726294",
      name: { uz: "5-son maktab", ru: "Школа № 5", en: "School No. 5" },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ items: [school] })),
    );
    setup(undefined, {
      ...value,
      educationType: "school",
      institutionId: "",
      gradeYear: "",
    });

    await userEvent.click(document.getElementById("p-institutionId")!);
    const listbox = await screen.findByRole("listbox");
    await within(listbox).findByText("School No. 5");

    expect(
      within(listbox)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["School No. 5", "Other school"]);

    await userEvent.type(
      screen.getByRole("combobox", { name: "institutionSearch" }),
      "nothing like it",
    );
    expect(
      within(screen.getByRole("listbox"))
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Other school"]);
    expect(screen.getByText("schoolEmpty")).toBeInTheDocument();
  });

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
