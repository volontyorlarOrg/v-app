import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MergeRequestList,
  type MergeRequestItem,
  type MergeRequestLabels,
} from "@/components/settings/merge-requests";
import en from "@/i18n/messages/en.json";
import { okResult, type ActionResult } from "@/lib/api/action-result";

const actions = vi.hoisted(() => ({
  approve: vi.fn(),
  reject: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("@/lib/account/actions", () => ({
  approveMergeRequestAction: actions.approve,
  rejectMergeRequestAction: actions.reject,
  cancelMergeRequestAction: actions.cancel,
}));

const catalog = en.settings;

const labels: MergeRequestLabels = {
  empty: catalog.merge.empty,
  approve: catalog.merge.approve,
  approving: catalog.merge.approving,
  reject: catalog.merge.reject,
  rejecting: catalog.merge.rejecting,
  cancel: catalog.merge.cancel,
  cancelling: catalog.merge.cancelling,
  rejected: catalog.merge.rejected,
  cancelled: catalog.merge.cancelled,
  freshAuthTitle: catalog.merge.freshAuthTitle,
  freshAuthDescription: catalog.merge.freshAuthDescription,
  freshAuthAction: catalog.merge.freshAuthAction,
  errors: catalog.errors,
};

const incoming: MergeRequestItem = {
  id: "merge-request-1",
  provider: "Through Google",
  counterparty: "Bekzod Rustamov",
  asked: "Asked 2 minutes ago",
  expires: "Expires in 23 hours",
};

const outgoing: MergeRequestItem = {
  id: "merge-request-2",
  provider: "Through Telegram",
  counterparty: null,
  asked: "Asked 1 minute ago",
  expires: "Expires in 23 hours",
};

function failure(code: string): ActionResult {
  return { status: "error", code, fields: {} };
}

function renderIncoming() {
  return render(
    <MergeRequestList
      direction="incoming"
      items={[incoming]}
      locale="uz"
      labels={labels}
    />,
  );
}

function submitted(mock: ReturnType<typeof vi.fn>) {
  const call = mock.mock.calls.at(-1);
  return call?.[1] as FormData;
}

describe("MergeRequestList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.approve.mockResolvedValue(okResult);
    actions.reject.mockResolvedValue(okResult);
    actions.cancel.mockResolvedValue(okResult);
  });

  it("names the account on the other side, and the way in when it has no name", () => {
    render(
      <MergeRequestList
        direction="incoming"
        items={[incoming, { ...outgoing, id: "merge-request-3" }]}
        locale="uz"
        labels={labels}
      />,
    );

    expect(screen.getByText("Bekzod Rustamov")).toBeInTheDocument();
    expect(screen.getByText("Through Google")).toBeInTheDocument();
    expect(screen.getByText("Through Telegram")).toBeInTheDocument();
    expect(screen.getAllByText("Expires in 23 hours")).toHaveLength(2);
  });

  it("says plainly when nothing is waiting", () => {
    render(
      <MergeRequestList direction="incoming" items={[]} locale="uz" labels={labels} />,
    );
    expect(screen.getByText(catalog.merge.empty)).toBeInTheDocument();
  });

  it("approves an incoming request through the approve action alone", async () => {
    const user = userEvent.setup();
    renderIncoming();

    await user.click(screen.getByRole("button", { name: catalog.merge.approve }));

    await waitFor(() => expect(actions.approve).toHaveBeenCalledTimes(1));
    expect(actions.reject).not.toHaveBeenCalled();
    expect(submitted(actions.approve).get("requestId")).toBe(incoming.id);
    expect(submitted(actions.approve).get("locale")).toBe("uz");
  });

  it("rejects an incoming request through the reject action alone", async () => {
    const user = userEvent.setup();
    renderIncoming();

    await user.click(screen.getByRole("button", { name: catalog.merge.reject }));

    await waitFor(() => expect(actions.reject).toHaveBeenCalledTimes(1));
    expect(actions.approve).not.toHaveBeenCalled();
    expect(submitted(actions.reject).get("requestId")).toBe(incoming.id);
  });

  it("cancels an outgoing request through the cancel action alone", async () => {
    const user = userEvent.setup();
    render(
      <MergeRequestList
        direction="outgoing"
        items={[outgoing]}
        locale="ru"
        labels={labels}
      />,
    );

    expect(screen.queryByRole("button", { name: catalog.merge.approve })).toBeNull();
    await user.click(screen.getByRole("button", { name: catalog.merge.cancel }));

    await waitFor(() => expect(actions.cancel).toHaveBeenCalledTimes(1));
    expect(submitted(actions.cancel).get("requestId")).toBe(outgoing.id);
  });

  it("cannot be submitted twice while the first submission is in flight", async () => {
    const user = userEvent.setup();
    let settle: ((result: ActionResult) => void) | undefined;
    actions.approve.mockImplementation(
      () =>
        new Promise<ActionResult>((resolve) => {
          settle = resolve;
        }),
    );
    renderIncoming();

    const approve = screen.getByRole("button", { name: catalog.merge.approve });
    await user.click(approve);

    const pending = await screen.findByRole("button", {
      name: catalog.merge.approving,
    });
    expect(pending).toBeDisabled();
    expect(screen.getByRole("button", { name: catalog.merge.reject })).toBeDisabled();

    await user.click(pending);
    settle?.(okResult);

    await waitFor(() => expect(actions.approve).toHaveBeenCalledTimes(1));
    expect(actions.reject).not.toHaveBeenCalled();
  });

  it("offers a fresh sign-in instead of an error when approval needs one", async () => {
    const user = userEvent.setup();
    actions.approve.mockResolvedValue(failure("recentAuthenticationRequired"));
    renderIncoming();

    await user.click(screen.getByRole("button", { name: catalog.merge.approve }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(catalog.merge.freshAuthTitle)).toBeInTheDocument();
    const form = within(alert)
      .getByRole("button", { name: catalog.merge.freshAuthAction })
      .closest("form");
    expect(form).toHaveAttribute("action", "/api/auth/connect/reauthenticate");
    expect(form).toHaveAttribute("method", "post");
    expect(form?.querySelector('input[name="locale"]')).toHaveValue("uz");
  });

  it("keeps the buttons usable after a failure and never shows the backend's code", async () => {
    const user = userEvent.setup();
    actions.approve.mockResolvedValue(failure("accountMergeRequestExpired"));
    renderIncoming();

    await user.click(screen.getByRole("button", { name: catalog.merge.approve }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(catalog.errors.accountMergeRequestExpired);
    expect(alert).not.toHaveTextContent("accountMergeRequestExpired");

    const approve = screen.getByRole("button", { name: catalog.merge.approve });
    expect(approve).toBeEnabled();
    approve.focus();
    expect(approve).toHaveFocus();
  });

  it("translates a code it does not know rather than printing it", async () => {
    const user = userEvent.setup();
    actions.approve.mockResolvedValue(failure("someUndocumentedBackendCode"));
    renderIncoming();

    await user.click(screen.getByRole("button", { name: catalog.merge.approve }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(catalog.errors.unknown);
    expect(alert).not.toHaveTextContent("someUndocumentedBackendCode");
  });

  it("is operable from the keyboard alone", async () => {
    const user = userEvent.setup();
    renderIncoming();

    await user.tab();
    expect(screen.getByRole("button", { name: catalog.merge.approve })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: catalog.merge.reject })).toHaveFocus();

    await user.keyboard("{Enter}");
    await waitFor(() => expect(actions.reject).toHaveBeenCalledTimes(1));
  });
});
