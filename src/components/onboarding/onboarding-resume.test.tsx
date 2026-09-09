import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  OnboardingResume,
  type OnboardingResumeLabels,
} from "@/components/onboarding/onboarding-resume";
import {
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_STORAGE_KEY,
} from "@/lib/onboarding/state";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props} />
  ),
}));

const labels: OnboardingResumeLabels = {
  title: "Finish your pass",
  bodyByDone: ["none done", "1 of 3 done", "2 of 3 done", "all done"],
  continue: "Continue setup",
  dismiss: "Not now",
  rail: "Setup steps",
  steps: { about: "About you", place: "Where you study", contact: "Contact" },
  states: { done: "done", current: "current step", upcoming: "not yet" },
};

describe("OnboardingResume", () => {
  beforeEach(() => {
    refresh.mockClear();
    localStorage.clear();
    document.cookie = `${ONBOARDING_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("stays out of the way for a volunteer who has onboarded", () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");

    render(<OnboardingResume serverState={null} labels={labels} />);

    expect(screen.queryByText("Finish your pass")).not.toBeInTheDocument();
  });

  it("offers the button when only localStorage remembers the unfinished setup", () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "pending:place");

    render(<OnboardingResume serverState={null} labels={labels} />);

    expect(screen.getByText("Finish your pass")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue setup" })).toHaveAttribute(
      "href",
      "/welcome",
    );
  });

  it("puts the cookie back so the next server render agrees", () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "pending:contact");

    render(<OnboardingResume serverState={null} labels={labels} />);

    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=pending:contact`);
  });

  it("hides the card when localStorage has outrun the cookie the server saw", () => {
    document.cookie = `${ONBOARDING_COOKIE_NAME}=pending:about; path=/`;
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");

    render(<OnboardingResume serverState="pending:about" labels={labels} />);

    expect(screen.queryByText("Finish your pass")).not.toBeInTheDocument();
  });

  it("records the dismissal in both stores", async () => {
    // The server only knew the step because the cookie was there to read.
    document.cookie = `${ONBOARDING_COOKIE_NAME}=pending:about; path=/`;

    render(<OnboardingResume serverState="pending:about" labels={labels} />);

    await userEvent.click(screen.getByRole("button", { name: "Not now" }));

    expect(screen.queryByText("Finish your pass")).not.toBeInTheDocument();
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("done");
    expect(document.cookie).toContain(`${ONBOARDING_COOKIE_NAME}=done`);
    expect(refresh).toHaveBeenCalled();
  });
});
