import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OnboardingLabels } from "@/components/onboarding/labels";
import { UsernameStepForm } from "@/components/onboarding/username-step-form";
import en from "@/i18n/messages/en.json";
import { failedResult, okResult } from "@/lib/api/action-result";

const actions = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock("@/lib/account/actions", () => ({
  updateUsernameAction: actions.update,
}));

const text = en.onboarding;

const labels = {
  continue: text.continue,
  saving: text.saving,
  skipStep: text.skipStep,
  back: text.back,
  usernameStep: {
    field: text.usernameStep.field,
    hint: "5 to 32 characters.",
    fromTelegram: text.usernameStep.fromTelegram,
    address: text.usernameStep.address,
    addressPlaceholder: text.usernameStep.addressPlaceholder,
    errors: en.settings.errors,
  },
} as unknown as OnboardingLabels;

function renderStep(
  identity: { username: string; source: "generated" | "custom" | "telegram" },
  onContinue = vi.fn(),
) {
  render(
    <UsernameStepForm
      locale="en"
      identity={{ ...identity, editable: true }}
      addressPrefix="volontyorlar.uz/"
      labels={labels}
      onContinue={onContinue}
      onBack={vi.fn()}
    />,
  );
  return onContinue;
}

describe("UsernameStepForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.update.mockResolvedValue(okResult);
  });

  it("keeps a Telegram username with one tap and without a save", async () => {
    const user = userEvent.setup();
    const onContinue = renderStep({ username: "dilnoza_k", source: "telegram" });

    expect(screen.getByLabelText(text.usernameStep.field)).toHaveValue("dilnoza_k");
    expect(screen.getByText(/This is your Telegram username\./)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: text.continue }));

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(actions.update).not.toHaveBeenCalled();
  });

  it("saves a different username before moving on", async () => {
    const user = userEvent.setup();
    const onContinue = renderStep({ username: "dilnoza_k", source: "telegram" });
    const field = screen.getByLabelText(text.usernameStep.field);

    await user.clear(field);
    await user.type(field, "Dilnoza_Reads");
    expect(screen.getByText("volontyorlar.uz/dilnoza_reads")).toBeInTheDocument();
    expect(screen.queryByText(/This is your Telegram username\./)).toBeNull();
    await user.click(screen.getByRole("button", { name: text.continue }));

    await waitFor(() => expect(onContinue).toHaveBeenCalledTimes(1));
    expect(actions.update).toHaveBeenCalledTimes(1);
    const sent = actions.update.mock.calls[0]?.[1] as FormData;
    expect(sent.get("username")).toBe("Dilnoza_Reads");
  });

  it("starts empty for a generated username and asks for one", async () => {
    const user = userEvent.setup();
    const onContinue = renderStep({
      username: "user_0123456789abcdef0123",
      source: "generated",
    });

    expect(screen.getByLabelText(text.usernameStep.field)).toHaveValue("");
    expect(screen.getByText("volontyorlar.uz/username")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: text.continue }));

    expect(await screen.findByText(en.settings.errors.usernameRequired)).toBeVisible();
    expect(onContinue).not.toHaveBeenCalled();
    expect(actions.update).not.toHaveBeenCalled();
  });

  it("stays on the step when the backend refuses the username", async () => {
    actions.update.mockResolvedValue(failedResult("usernameUnavailable"));
    const user = userEvent.setup();
    const onContinue = renderStep({
      username: "user_0123456789abcdef0123",
      source: "generated",
    });

    await user.type(screen.getByLabelText(text.usernameStep.field), "volunteer_01");
    await user.click(screen.getByRole("button", { name: text.continue }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      en.settings.errors.usernameUnavailable,
    );
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("offers no way to skip choosing a username", () => {
    renderStep({ username: "user_0123456789abcdef0123", source: "generated" });

    expect(screen.queryByRole("button", { name: text.skipStep })).toBeNull();
  });
});
