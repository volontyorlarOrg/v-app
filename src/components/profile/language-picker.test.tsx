import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { LanguagePicker } from "@/components/profile/language-picker";
import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";
import uz from "@/i18n/messages/uz.json";
import { profileFormValues, type ProfileFormValues } from "@/lib/profile/input";
import { EMPTY_PROFILE } from "@/lib/profile/completion";
import {
  PROFILE_LANGUAGE_CODES,
  PROFILE_LANGUAGE_LIMIT,
  createLanguageDirectory,
} from "@/lib/profile/languages";

const directory = createLanguageDirectory({
  en: en.languages,
  ru: ru.languages,
  uz: uz.languages,
});
const fields = en.profile.fields;

function Harness({ languages }: { languages: string[] }) {
  const form = useForm<ProfileFormValues>({
    defaultValues: profileFormValues({ ...EMPTY_PROFILE, languages }),
  });

  return (
    <form data-testid="form">
      <label id="languages-label" htmlFor="languages">
        {fields.languages}
      </label>
      <LanguagePicker
        id="languages"
        control={form.control}
        options={directory.options("en", languages)}
        labels={{
          search: fields.languagesSearch,
          empty: fields.languagesEmpty,
          common: fields.languagesCommon,
          all: fields.languagesAll,
          remove: fields.languagesRemove,
          limit: fields.languagesLimit,
        }}
      />
    </form>
  );
}

function submittedLanguages() {
  return new FormData(screen.getByTestId("form") as HTMLFormElement).getAll(
    "languages",
  );
}

describe("LanguagePicker", () => {
  it("shows stored languages as removable chips and submits them", () => {
    render(<Harness languages={["uz", "ru"]} />);

    expect(screen.getByRole("button", { name: "Remove: Uzbek" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove: Russian" })).toBeInTheDocument();
    expect(submittedLanguages()).toEqual(["uz", "ru"]);
  });

  it("adds a language found by typing and choosing it with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Harness languages={[]} />);

    const box = screen.getByRole("combobox", { name: fields.languages });
    await user.type(box, "ingl");
    expect(box).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    await user.keyboard("{Enter}");

    expect(box).toHaveValue("");
    expect(submittedLanguages()).toEqual(["en"]);
    expect(screen.getByRole("option", { name: "English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("groups the common languages first when nothing is typed", async () => {
    const user = userEvent.setup();
    render(<Harness languages={[]} />);

    await user.click(screen.getByRole("combobox", { name: fields.languages }));
    const common = screen.getByRole("group", { name: fields.languagesCommon });

    expect(within(common).getAllByRole("option")[0]).toHaveAccessibleName("Uzbek");
    expect(
      screen.getByRole("group", { name: fields.languagesAll }),
    ).toBeInTheDocument();
  });

  it("removes the last chip with Backspace and a chip by pressing it", async () => {
    const user = userEvent.setup();
    render(<Harness languages={["uz", "ru", "en"]} />);

    await user.click(screen.getByRole("combobox", { name: fields.languages }));
    await user.keyboard("{Backspace}");
    expect(submittedLanguages()).toEqual(["uz", "ru"]);

    await user.click(screen.getByRole("button", { name: "Remove: Uzbek" }));
    expect(submittedLanguages()).toEqual(["ru"]);
  });

  it(`stops adding at ${PROFILE_LANGUAGE_LIMIT} but still lets one be taken away`, async () => {
    const user = userEvent.setup();
    const ten = PROFILE_LANGUAGE_CODES.slice(0, PROFILE_LANGUAGE_LIMIT);
    render(<Harness languages={[...ten]} />);

    await user.click(screen.getByRole("combobox", { name: fields.languages }));
    expect(screen.getByText(fields.languagesLimit)).toBeInTheDocument();

    const german = screen.getByRole("option", { name: "German" });
    expect(german).toHaveAttribute("aria-disabled", "true");
    await user.click(german);
    expect(submittedLanguages()).toHaveLength(PROFILE_LANGUAGE_LIMIT);

    await user.click(screen.getByRole("option", { name: "Uzbek" }));
    expect(submittedLanguages()).not.toContain("uz");
  });

  it("says so when nothing matches the search", async () => {
    const user = userEvent.setup();
    render(<Harness languages={[]} />);

    await user.type(screen.getByRole("combobox", { name: fields.languages }), "zzzz");

    expect(screen.getByRole("status")).toHaveTextContent(fields.languagesEmpty);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
});
