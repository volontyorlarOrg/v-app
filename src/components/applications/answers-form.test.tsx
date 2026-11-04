import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnswersForm, type AnswersFormLabels } from "./answers-form";

const actions = vi.hoisted(() => ({ save: vi.fn(), submit: vi.fn() }));
vi.mock("@/lib/applications/actions", () => ({
  saveDraftAction: actions.save,
  submitApplicationAction: actions.submit,
}));

const labels: AnswersFormLabels = {
  save: "Save draft",
  saving: "Saving",
  submit: "Submit application",
  submitting: "Submitting",
  savedDraft: "Draft saved",
  choose: "Choose",
  fieldRequired: "Required",
  fieldInvalid: "Invalid",
  essayLabel: "Essay",
  essayHelp: "Tell us why",
  errors: { invalidAnswers: "Check your answers" },
  fallback: "Try again",
  profileLink: { href: "/profile/edit", label: "Edit profile" },
};

function setup() {
  render(
    <AnswersForm
      applicationId="a1"
      essayRequired
      essay=""
      questions={[
        {
          id: "q1",
          prompt: "Why?",
          type: "long_text",
          required: true,
          help: "Required answer",
        },
      ]}
      answers={{}}
      labels={labels}
    />,
  );
  return userEvent.setup();
}

beforeEach(() => {
  actions.save.mockReset().mockResolvedValue({ status: "ok" });
  actions.submit.mockReset().mockResolvedValue({ status: "ok" });
});

describe("AnswersForm", () => {
  it("saves unfinished required answers and an empty essay", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(actions.save).toHaveBeenCalledOnce());
    expect(actions.submit).not.toHaveBeenCalled();
    expect(await screen.findByText("Draft saved")).toBeInTheDocument();
  });

  it("requires complete answers when sending after saving a draft", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Draft saved");
    await user.click(screen.getByRole("button", { name: "Submit application" }));
    expect(await screen.findAllByText("Required")).toHaveLength(2);
    expect(actions.submit).not.toHaveBeenCalled();
    await user.type(
      screen.getByRole("textbox", { name: "Essay" }),
      "I want to volunteer.",
    );
    await user.type(screen.getByRole("textbox", { name: /Why/ }), "To help.");
    await user.click(screen.getByRole("button", { name: "Submit application" }));
    await waitFor(() => expect(actions.submit).toHaveBeenCalledOnce());
  });

  it("replaces a failed submission message with the next draft save result", async () => {
    actions.submit.mockResolvedValue({
      status: "error",
      code: "invalidAnswers",
      fields: {},
    });
    const user = setup();
    await user.type(
      screen.getByRole("textbox", { name: "Essay" }),
      "I want to volunteer.",
    );
    await user.type(screen.getByRole("textbox", { name: /Why/ }), "To help.");
    await user.click(screen.getByRole("button", { name: "Submit application" }));
    await screen.findByText("Check your answers");
    await user.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Draft saved");
    expect(screen.queryByText("Check your answers")).not.toBeInTheDocument();
  });
});
