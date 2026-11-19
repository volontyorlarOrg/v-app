import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import en from "@/i18n/messages/en.json";
import { updateProfileAction } from "@/lib/profile/actions";
import { EMPTY_PROFILE } from "@/lib/profile/completion";
import { ProfileForm, type ProfileFormLabels } from "./profile-form";

vi.mock("@/lib/profile/actions", () => ({ updateProfileAction: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: "a",
}));

const labels: ProfileFormLabels = {
  ...en.profile,
  ...en.profile.form,
  fields: en.profile.fields,
  regionNote: {
    title: en.profile.regionNote.title,
    region: { term: en.profile.fields.region, text: en.profile.regionNote.region },
    hometownRegion: {
      term: en.profile.fields.hometownRegion,
      text: en.profile.regionNote.hometownRegion,
    },
  },
};

function renderForm() {
  return render(
    <ProfileForm
      values={{ ...EMPTY_PROFILE, fullName: "Volunteer" }}
      languageOptions={[]}
      regions={[]}
      labels={labels}
      visibility={{ hidden: ["phone"], labels: en.profile.visibility }}
    />,
  );
}

beforeEach(() => vi.mocked(updateProfileAction).mockReset());

describe("ProfileForm contact confirmation", () => {
  it("lets a stale form confirm publication after the backend requires it", async () => {
    const user = userEvent.setup();
    vi.mocked(updateProfileAction)
      .mockResolvedValueOnce({
        status: "error",
        code: "profileContactConfirmationRequired",
        fields: { hiddenFields: ["profileContactConfirmationRequired"] },
      })
      .mockResolvedValueOnce({ status: "ok" });
    renderForm();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: labels.save }));
    const confirmation = await screen.findByRole("checkbox", {
      name: en.profile.visibility.confirmContacts,
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      en.profile.visibility.confirmContacts,
    );
    expect(screen.getByRole("button", { name: labels.save })).toBeDisabled();
    await user.click(confirmation);
    await user.click(screen.getByRole("button", { name: labels.save }));
    await waitFor(() => expect(updateProfileAction).toHaveBeenCalledTimes(2));
    expect(
      vi
        .mocked(updateProfileAction)
        .mock.calls[1]?.[1].get("confirmContactPublication"),
    ).toBe("on");
  });

  it("requires confirmation before saving a newly visible phone", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(
      screen.getByRole("switch", { name: en.profile.visibility.parts.phone }),
    );
    expect(
      screen.getByRole("checkbox", { name: en.profile.visibility.confirmContacts }),
    ).not.toBeChecked();
    expect(screen.getByRole("button", { name: labels.save })).toBeDisabled();
  });
});
