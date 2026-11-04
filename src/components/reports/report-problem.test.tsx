import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ReportProblemButton,
  ReportProblemProvider,
} from "@/components/reports/report-problem";
import en from "@/i18n/messages/en.json";

const mocks = vi.hoisted(() => ({ submit: vi.fn(), pathname: "/profile/edit" }));
vi.mock("@/lib/reports/actions", () => ({ submitReportAction: mocks.submit }));
vi.mock("@/i18n/navigation", () => ({ usePathname: () => mocks.pathname }));

function mount() {
  return render(
    <ReportProblemProvider labels={en.reports}>
      <ReportProblemButton />
    </ReportProblemProvider>,
  );
}
describe("report form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.submit.mockResolvedValue({ status: "ok" });
  });
  it("explains unsupported characters without sending the invalid description", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: en.reports.trigger }));
    fireEvent.change(screen.getByLabelText(en.reports.description), {
      target: { value: "Problem\u0000text" },
    });
    await user.click(screen.getByRole("button", { name: en.reports.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      en.reports.errors.reportDescriptionInvalid,
    );
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it("attaches the opening page and prevents an empty submission", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: en.reports.trigger }));
    expect(screen.getByRole("dialog")).toHaveTextContent("/profile/edit");
    await user.click(screen.getByRole("button", { name: en.reports.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(en.reports.fieldInvalid);
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it("keeps text and the same submission UUID after a failed send, then closes on success", async () => {
    const user = userEvent.setup();
    mocks.submit.mockResolvedValueOnce({
      status: "error",
      code: "network",
      fields: {},
    });
    mount();
    await user.click(screen.getByRole("button", { name: en.reports.trigger }));
    await user.type(
      screen.getByLabelText(en.reports.description),
      "The page did not save.",
    );
    await user.click(screen.getByRole("button", { name: en.reports.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      en.reports.errors.network,
    );
    expect(screen.getByLabelText(en.reports.description)).toHaveValue(
      "The page did not save.",
    );
    const first = mocks.submit.mock.calls[0]![1] as FormData;
    expect(first.get("pagePath")).toBe("/profile/edit");
    expect(first.get("description")).toBe("The page did not save.");
    await user.click(screen.getByRole("button", { name: en.reports.submit }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    const second = mocks.submit.mock.calls[1]![1] as FormData;
    expect(second.get("submissionId")).toBe(first.get("submissionId"));
  });
  it("shows the hourly limit while retaining the volunteer's description", async () => {
    mocks.submit.mockResolvedValue({
      status: "error",
      code: "rateLimitExceeded",
      fields: {},
    });
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole("button", { name: en.reports.trigger }));
    await user.type(screen.getByLabelText(en.reports.description), "Another issue.");
    await user.click(screen.getByRole("button", { name: en.reports.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      en.reports.errors.rateLimitExceeded,
    );
    expect(screen.getByLabelText(en.reports.description)).toHaveValue("Another issue.");
  });
});
