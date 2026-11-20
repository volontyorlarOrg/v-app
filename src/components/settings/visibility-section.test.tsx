import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  VisibilitySection,
  type VisibilityLabels,
} from "@/components/settings/visibility-section";
import en from "@/i18n/messages/en.json";
import { failedResult, okResult } from "@/lib/api/action-result";
import {
  OPTIONAL_PROFILE_PARTS,
  REQUIRED_PROFILE_PARTS,
  type OptionalProfilePart,
} from "@/lib/profile/visibility";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@/lib/profile/actions", () => ({
  updateProfileVisibilityAction: mocks.save,
}));

vi.mock("sonner", () => ({ toast: { success: mocks.success } }));

const copy = en.settings.visibility;

const labels: VisibilityLabels = {
  alwaysTitle: copy.alwaysTitle,
  optionalTitle: copy.optionalTitle,
  always: [
    { id: "photo", label: copy.always.photo },
    { id: "name", label: copy.always.name },
    { id: "bio", label: en.profile.visibility.parts.bio },
    { id: "region", label: en.profile.visibility.parts.region },
    { id: "city", label: en.profile.visibility.parts.city },
    { id: "school", label: en.profile.visibility.parts.school },
    { id: "links", label: en.profile.visibility.parts.links },
    { id: "languages", label: en.profile.visibility.parts.languages },
    { id: "joined", label: en.profile.visibility.parts.joined },
  ],
  parts: Object.fromEntries(
    OPTIONAL_PROFILE_PARTS.map((part) => [part, en.profile.visibility.parts[part]]),
  ) as Record<OptionalProfilePart, string>,
  recommended: copy.recommended,
  recommendedHelp: copy.recommendedHelp,
  confirmContacts: copy.confirmContacts,
  save: copy.save,
  saving: copy.saving,
  saved: copy.saved,
  saveError: copy.saveError,
};

const everythingHidden = [...OPTIONAL_PROFILE_PARTS];

function renderSection(hidden: readonly OptionalProfilePart[]) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <VisibilitySection hidden={hidden} labels={labels} />
    </QueryClientProvider>,
  );
}

const saveButton = () => screen.getByRole("button", { name: copy.save });

describe("VisibilitySection", () => {
  beforeEach(() => {
    mocks.save.mockReset();
    mocks.success.mockReset();
    mocks.save.mockResolvedValue(okResult);
  });

  it("lists what is always shown apart from the switches the volunteer controls", () => {
    renderSection(["phone"]);

    const always = screen.getByRole("region", { name: copy.alwaysTitle });
    for (const item of labels.always) expect(always).toHaveTextContent(item.label);
    for (const part of REQUIRED_PROFILE_PARTS) {
      expect(
        screen.queryByRole("switch", { name: en.profile.visibility.parts[part] }),
      ).not.toBeInTheDocument();
    }
    expect(screen.getAllByRole("switch")).toHaveLength(OPTIONAL_PROFILE_PARTS.length);
  });

  it("reflects what is hidden and keeps saving off until something changes", () => {
    renderSection(["phone"]);

    expect(screen.getByRole("switch", { name: "Phone" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Hometown region" })).toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it("saves a hidden detail without asking for contact confirmation", async () => {
    const user = userEvent.setup();
    renderSection(["phone"]);

    await user.click(screen.getByRole("switch", { name: "Year or grade" }));
    expect(screen.queryByText(copy.confirmContacts)).not.toBeInTheDocument();
    await user.click(saveButton());

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0]![0]).toEqual({
      hiddenFields: ["phone", "gradeYear"],
      confirmContactPublication: false,
    });
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith(copy.saved));
  });

  it("holds back publishing a hidden contact until it is confirmed", async () => {
    const user = userEvent.setup();
    renderSection(["phone", "telegram"]);

    await user.click(screen.getByRole("switch", { name: "Telegram" }));
    expect(screen.getByLabelText(copy.confirmContacts)).not.toBeChecked();
    expect(saveButton()).toBeDisabled();

    await user.click(screen.getByLabelText(copy.confirmContacts));
    expect(saveButton()).toBeEnabled();
    await user.click(saveButton());

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0]![0]).toEqual({
      hiddenFields: ["phone"],
      confirmContactPublication: true,
    });
  });

  it("moves a profile that hid everything to the recommended choice", async () => {
    const user = userEvent.setup();
    renderSection(everythingHidden);

    await user.click(screen.getByRole("button", { name: copy.recommended }));
    expect(screen.getByRole("switch", { name: "Hometown region" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Phone" })).not.toBeChecked();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(saveButton()).toBeDisabled();

    await user.click(screen.getByLabelText(copy.confirmContacts));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.save.mock.calls[0]![0]).toEqual({
      hiddenFields: ["phone"],
      confirmContactPublication: true,
    });
  });

  it("asks for confirmation when the server requires it", async () => {
    mocks.save.mockResolvedValueOnce(
      failedResult("profileContactConfirmationRequired"),
    );
    const user = userEvent.setup();
    renderSection(["phone"]);

    await user.click(screen.getByRole("switch", { name: "Year or grade" }));
    expect(screen.queryByText(copy.confirmContacts)).not.toBeInTheDocument();
    await user.click(saveButton());

    expect(await screen.findByLabelText(copy.confirmContacts)).not.toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();

    await user.click(screen.getByLabelText(copy.confirmContacts));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1]![0]).toEqual({
      hiddenFields: ["phone", "gradeYear"],
      confirmContactPublication: true,
    });
  });

  it("says so when the choice could not be saved and keeps the pending choice", async () => {
    mocks.save.mockResolvedValue(failedResult("server"));
    const user = userEvent.setup();
    renderSection(["phone"]);

    await user.click(screen.getByRole("switch", { name: "Year or grade" }));
    await user.click(saveButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(copy.saveError);
    expect(screen.getByRole("switch", { name: "Year or grade" })).not.toBeChecked();
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
