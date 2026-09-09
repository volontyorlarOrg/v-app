import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConnectionList } from "@/components/settings/connection-list";
import en from "@/i18n/messages/en.json";
import type { ConnectionState } from "@/lib/account/connections";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    [...namespace.split("."), ...key.split(".")].reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      en,
    ) as string,
}));

const states: ConnectionState[] = [
  { provider: "telegram", connected: true, detail: "@dilnoza_k", verified: false },
  { provider: "google", connected: false, detail: null, verified: false },
  {
    provider: "password",
    connected: true,
    detail: "dilnoza@example.org",
    verified: true,
  },
];

function rowFor(name: string) {
  return within(screen.getByText(name).closest("li") as HTMLElement);
}

describe("ConnectionList", () => {
  it("names every account type and what it is connected to", () => {
    render(<ConnectionList states={states} locale="en" googleConfigured />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(rowFor("Telegram").getByText("@dilnoza_k")).toBeInTheDocument();
    expect(rowFor("Google").getByText("Not connected")).toBeInTheDocument();
    expect(rowFor("Email and password").getByText("Verified")).toBeInTheDocument();
  });

  it("offers a connection handoff only for what is missing", () => {
    render(<ConnectionList states={states} locale="uz" googleConfigured />);

    const connect = screen.getByRole("link", { name: "Connect Google" });
    expect(connect).toHaveAttribute("href", "/api/auth/connect/google/start?locale=uz");
    expect(screen.queryByRole("link", { name: "Connect Telegram" })).toBeNull();
  });

  it("sends nothing but the interface language to a provider handoff", () => {
    render(
      <ConnectionList
        states={[
          { provider: "telegram", connected: false, detail: null, verified: false },
        ]}
        locale="ru"
        googleConfigured
      />,
    );

    const href =
      screen.getByRole("link", { name: "Connect Telegram" }).getAttribute("href") ?? "";
    expect(href).toBe("/api/auth/connect/telegram/start?locale=ru");
    expect(new URL(href, "https://app.test").searchParams.get("locale")).toBe("ru");
    expect(href).not.toMatch(/token|state|email|@|id=/i);
  });

  it("disables the Google button with a visible note when no client id is set", () => {
    render(
      <ConnectionList
        states={[
          { provider: "google", connected: false, detail: null, verified: false },
        ]}
        locale="en"
        googleConfigured={false}
      />,
    );

    const button = screen.getByRole("button", { name: "Connect Google" });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription("Not available yet.");
    expect(screen.queryByRole("link", { name: "Connect Google" })).toBeNull();
  });
});
