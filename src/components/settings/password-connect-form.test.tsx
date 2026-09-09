import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PasswordConnectForm,
  type PasswordConnectLabels,
} from "@/components/settings/password-connect-form";
import en from "@/i18n/messages/en.json";
import { okResult, type ActionResult } from "@/lib/api/action-result";

const actions = vi.hoisted(() => ({ connect: vi.fn() }));

vi.mock("@/lib/account/actions", () => ({
  connectPasswordAction: actions.connect,
}));

const catalog = en.settings;

const labels: PasswordConnectLabels = {
  title: catalog.connections.passwordTitle,
  description: catalog.connections.passwordDescription,
  email: catalog.connections.passwordEmail,
  password: catalog.connections.passwordPassword,
  reveal: catalog.connections.passwordReveal,
  conceal: catalog.connections.passwordConceal,
  submit: catalog.connections.passwordSubmit,
  pending: catalog.connections.passwordPending,
  done: catalog.connections.passwordDone,
  fieldInvalid: catalog.errors.validationFailed,
  errors: catalog.errors,
};

function submitted() {
  return actions.connect.mock.calls.at(-1)?.[1] as FormData;
}

async function fill(user: ReturnType<typeof userEvent.setup>, password: string) {
  await user.type(screen.getByLabelText(labels.email), "dilnoza@example.org");
  await user.type(screen.getByLabelText(labels.password), password);
}

describe("PasswordConnectForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.connect.mockResolvedValue(okResult);
  });

  it("sends the typed password to the server action exactly as typed", async () => {
    const user = userEvent.setup();
    render(<PasswordConnectForm locale="uz" labels={labels} />);

    await fill(user, "  seven purple lanterns  ");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    await waitFor(() => expect(actions.connect).toHaveBeenCalledTimes(1));
    expect(submitted().get("password")).toBe("  seven purple lanterns  ");
    expect(submitted().get("email")).toBe("dilnoza@example.org");
    expect(submitted().get("locale")).toBe("uz");
  });

  it("keeps the password out of the document and out of the URL", async () => {
    const user = userEvent.setup();
    render(<PasswordConnectForm locale="en" labels={labels} />);

    await fill(user, "seven purple lanterns");
    const field = screen.getByLabelText(labels.password);
    expect(field).toHaveAttribute("type", "password");
    expect(field.getAttribute("value")).toBeNull();
    expect(document.body.innerHTML).not.toContain("seven purple lanterns");
    expect(window.location.search).toBe("");
  });

  it("names a malformed address before the server action is reached", async () => {
    const user = userEvent.setup();
    render(<PasswordConnectForm locale="en" labels={labels} />);

    await user.type(screen.getByLabelText(labels.email), "not-an-address");
    await user.type(screen.getByLabelText(labels.password), "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    expect(await screen.findByText(labels.fieldInvalid)).toBeInTheDocument();
    expect(actions.connect).not.toHaveBeenCalled();
  });

  it("cannot be submitted twice while the first submission is in flight", async () => {
    const user = userEvent.setup();
    let settle: ((result: ActionResult) => void) | undefined;
    actions.connect.mockImplementation(
      () =>
        new Promise<ActionResult>((resolve) => {
          settle = resolve;
        }),
    );
    render(<PasswordConnectForm locale="en" labels={labels} />);

    await fill(user, "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    const pending = await screen.findByRole("button", { name: labels.pending });
    expect(pending).toBeDisabled();
    await user.click(pending);
    settle?.(okResult);

    await waitFor(() => expect(actions.connect).toHaveBeenCalledTimes(1));
  });

  it("translates a backend refusal instead of showing its code", async () => {
    const user = userEvent.setup();
    actions.connect.mockResolvedValue({
      status: "error",
      code: "invalidCredentials",
      fields: {},
    } satisfies ActionResult);
    render(<PasswordConnectForm locale="en" labels={labels} />);

    await fill(user, "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(catalog.errors.invalidCredentials);
    expect(alert).not.toHaveTextContent("invalidCredentials");
  });

  it("confirms in words when the check succeeds", async () => {
    const user = userEvent.setup();
    render(<PasswordConnectForm locale="en" labels={labels} />);

    await fill(user, "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    expect(await screen.findByText(labels.done)).toBeInTheDocument();
  });
});
