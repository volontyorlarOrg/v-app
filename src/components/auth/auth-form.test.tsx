import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/components/auth/auth-form";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderForm() {
  return render(
    <AuthForm
      destination="/dashboard"
      submitLabel="Log in"
      passwordLabels={{ show: "Show password", hide: "Hide password" }}
      fields={[
        { name: "email", label: "Email" },
        {
          name: "password",
          label: "Password",
          trailing: { href: "/forgot-password", label: "Forgot password?" },
        },
      ]}
    />,
  );
}

describe("AuthForm", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("labels every control and links the recovery path", () => {
    renderForm();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("opens the destination on submit without sending anything, because sign-in is not connected", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "dilnoza@example.org");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
  });

  it("reveals and hides the password from a labelled toggle", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});
