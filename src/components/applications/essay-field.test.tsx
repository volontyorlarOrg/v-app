import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render";
import type { ApplicationQuestion } from "@/features/opportunities/schemas";
import { EssayField, SaveIndicator } from "./essay-field";

/**
 * The essay field.
 *
 * Two product rules are asserted here: a character counter appears only when
 * the backend states a limit, and the save state is always stated in words
 * rather than by an icon alone.
 */

function question(overrides: Partial<ApplicationQuestion> = {}): ApplicationQuestion {
  return {
    id: "q1",
    prompt: "Why do you want to join?",
    type: "long_text",
    required: true,
    ...overrides,
  };
}

describe("EssayField", () => {
  it("renders the prompt as the field label", () => {
    renderWithIntl(
      <EssayField question={question()} value="" onChange={() => {}} />,
      { locale: "en" },
    );

    expect(screen.getByLabelText(/Why do you want to join\?/)).toBeInTheDocument();
  });

  it("shows no counter when the backend states no limit", () => {
    // Inventing a limit would make a volunteer trim a good answer to fit a
    // number nobody set.
    renderWithIntl(
      <EssayField question={question()} value="hello" onChange={() => {}} />,
      { locale: "en" },
    );

    expect(screen.queryByText(/characters/)).not.toBeInTheDocument();
  });

  it("counts characters when a limit exists", () => {
    renderWithIntl(
      <EssayField
        question={question({ maxLength: 200 })}
        value="hello"
        onChange={() => {}}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("5 of 200 characters")).toBeInTheDocument();
  });

  it("reports the overage rather than silently truncating", () => {
    renderWithIntl(
      <EssayField
        question={question({ maxLength: 10 })}
        value={"a".repeat(14)}
        onChange={() => {}}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("4 characters over the limit")).toBeInTheDocument();
  });

  it("passes typed text up rather than holding it internally", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithIntl(
      <EssayField question={question()} value="" onChange={onChange} />,
      { locale: "en" },
    );

    await user.type(screen.getByLabelText(/Why do you want to join\?/), "Hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders a multi-select as a grouped set of checkboxes", () => {
    renderWithIntl(
      <EssayField
        question={question({
          type: "multi_select",
          prompt: "Which days can you attend?",
          options: [
            { value: "sat", label: "Saturday" },
            { value: "sun", label: "Sunday" },
          ],
        })}
        value={["sat"]}
        onChange={() => {}}
      />,
      { locale: "en" },
    );

    expect(
      screen.getByRole("group", { name: "Which days can you attend?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Saturday" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Sunday" })).not.toBeChecked();
  });

  it("marks the control invalid and announces the message on error", () => {
    renderWithIntl(
      <EssayField
        question={question()}
        value=""
        onChange={() => {}}
        error="This is required."
      />,
      { locale: "en" },
    );

    expect(screen.getByLabelText(/Why do you want to join\?/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("This is required.");
  });
});

describe("SaveIndicator", () => {
  it("states the save time in words, not just a tick", () => {
    renderWithIntl(
      <SaveIndicator status="saved" savedAt={new Date("2026-06-15T09:32:00Z")} />,
      { locale: "en" },
    );

    expect(screen.getByText(/^Saved /)).toBeInTheDocument();
  });

  it("says saving while a save is in flight", () => {
    renderWithIntl(<SaveIndicator status="saving" savedAt={null} />, {
      locale: "en",
    });

    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });

  it("announces a failed save so it cannot be mistaken for a saved one", () => {
    renderWithIntl(<SaveIndicator status="failed" savedAt={null} />, {
      locale: "en",
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Not saved");
  });

  it("explains that saving is automatic before anything has been typed", () => {
    renderWithIntl(<SaveIndicator status="idle" savedAt={null} />, {
      locale: "en",
    });

    expect(screen.getByText("Saves automatically")).toBeInTheDocument();
  });
});
