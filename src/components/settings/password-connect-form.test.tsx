import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PasswordForm,
  type PasswordFormLabels,
} from "@/components/settings/password-connect-form";
import en from "@/i18n/messages/en.json";
import { okResult, type ActionResult } from "@/lib/api/action-result";

const actions = vi.hoisted(() => ({ manage: vi.fn() }));

vi.mock("@/lib/account/actions", () => ({
  managePasswordAction: actions.manage,
}));

const catalog = en.settings;

const labels: PasswordFormLabels = {
  title: catalog.connections.setPasswordTitle,
  description: catalog.connections.setPasswordDescription,
  email: catalog.connections.passwordEmail,
  currentPassword: catalog.connections.currentPassword,
  newPassword: catalog.connections.newPassword,
  confirmPassword: catalog.connections.confirmPassword,
  passwordHint: catalog.connections.passwordHint.replace("{min}", "8"),
  reveal: catalog.connections.passwordReveal,
  conceal: catalog.connections.passwordConceal,
  submit: catalog.connections.setPassword,
  pending: catalog.connections.passwordPending,
  done: catalog.connections.setPasswordDone,
  fieldInvalid: catalog.errors.validationFailed,
  errors: catalog.errors,
};

function submitted() {
  return actions.manage.mock.calls.at(-1)?.[1] as FormData;
}

async function fillNewPassword(
  user: ReturnType<typeof userEvent.setup>,
  password: string,
) {
  await user.type(screen.getByLabelText(labels.newPassword), password);
  await user.type(screen.getByLabelText(labels.confirmPassword), password);
}

describe("PasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.manage.mockResolvedValue(okResult);
  });

  it("sets the first password and keeps it exactly as typed", async () => {
    const user = userEvent.setup();
    render(<PasswordForm locale="uz" mode="set" email={null} labels={labels} />);

    await user.type(screen.getByLabelText(labels.email), "dilnoza@example.org");
    await fillNewPassword(user, "  seven purple lanterns  ");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    await waitFor(() => expect(actions.manage).toHaveBeenCalledTimes(1));
    expect(submitted().get("newPassword")).toBe("  seven purple lanterns  ");
    expect(submitted().get("confirmPassword")).toBe("  seven purple lanterns  ");
    expect(submitted().get("email")).toBe("dilnoza@example.org");
    expect(submitted().get("mode")).toBe("set");
    expect(submitted().get("locale")).toBe("uz");
  });

  it("uses the connected Google email without another visible email field", () => {
    render(
      <PasswordForm
        locale="en"
        mode="set"
        email="dilnoza@example.org"
        labels={labels}
      />,
    );

    expect(screen.queryByLabelText(labels.email)).not.toBeInTheDocument();
    expect(document.querySelector('input[name="email"]')).toHaveValue(
      "dilnoza@example.org",
    );
  });

  it("shows current password only when changing an existing password", () => {
    render(
      <PasswordForm
        locale="en"
        mode="change"
        email="dilnoza@example.org"
        labels={{
          ...labels,
          title: catalog.connections.changePasswordTitle,
          description: catalog.connections.changePasswordDescription,
          submit: catalog.connections.changePassword,
          done: catalog.connections.changePasswordDone,
        }}
      />,
    );

    expect(screen.getByLabelText(labels.currentPassword)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("keeps passwords out of the document and URL", async () => {
    const user = userEvent.setup();
    render(
      <PasswordForm
        locale="en"
        mode="set"
        email="dilnoza@example.org"
        labels={labels}
      />,
    );

    await fillNewPassword(user, "seven purple lanterns");
    const field = screen.getByLabelText(labels.newPassword);
    expect(field).toHaveAttribute("type", "password");
    expect(field.getAttribute("value")).toBeNull();
    expect(document.body.innerHTML).not.toContain("seven purple lanterns");
    expect(window.location.search).toBe("");
  });

  it("rejects mismatched confirmation before the server action", async () => {
    const user = userEvent.setup();
    render(
      <PasswordForm
        locale="en"
        mode="set"
        email="dilnoza@example.org"
        labels={labels}
      />,
    );

    await user.type(screen.getByLabelText(labels.newPassword), "seven purple lanterns");
    await user.type(screen.getByLabelText(labels.confirmPassword), "different words");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    expect(
      await screen.findByText(catalog.errors.passwordMismatch),
    ).toBeInTheDocument();
    expect(actions.manage).not.toHaveBeenCalled();
  });

  it("cannot submit twice while saving", async () => {
    const user = userEvent.setup();
    let settle: ((result: ActionResult) => void) | undefined;
    actions.manage.mockImplementation(
      () =>
        new Promise<ActionResult>((resolve) => {
          settle = resolve;
        }),
    );
    render(
      <PasswordForm
        locale="en"
        mode="set"
        email="dilnoza@example.org"
        labels={labels}
      />,
    );

    await fillNewPassword(user, "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    const pending = await screen.findByRole("button", { name: labels.pending });
    expect(pending).toBeDisabled();
    await user.click(pending);
    settle?.(okResult);

    await waitFor(() => expect(actions.manage).toHaveBeenCalledTimes(1));
  });

  it("translates a backend refusal instead of showing its code", async () => {
    const user = userEvent.setup();
    actions.manage.mockResolvedValue({
      status: "error",
      code: "weakPassword",
      fields: {},
    } satisfies ActionResult);
    render(
      <PasswordForm
        locale="en"
        mode="set"
        email="dilnoza@example.org"
        labels={labels}
      />,
    );

    await fillNewPassword(user, "seven purple lanterns");
    await user.click(screen.getByRole("button", { name: labels.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(catalog.errors.weakPassword);
    expect(alert).not.toHaveTextContent("weakPassword");
  });
});
