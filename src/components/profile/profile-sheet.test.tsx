import { render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProfileSheet } from "@/components/profile/profile-sheet";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    prefetch,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => (
    <a href={href} data-prefetch={prefetch ? "" : undefined} {...rest}>
      {children}
    </a>
  ),
}));

const base = {
  name: "Dilnoza Karimova",
  initials: "DK",
  handle: "dilnoza_k",
  level: "Active",
  bio: "Second-year student.",
  figures: [{ id: "events", content: "5 events" }],
  rows: [
    { id: "region", label: "Region", value: "Tashkent City" },
    { id: "telegram", label: "Telegram", value: "@dilnoza_k" },
  ],
  labels: { action: "Edit profile", figures: "Participation" },
};

describe("ProfileSheet", () => {
  it("carries the volunteer's name as the page's one heading", () => {
    render(<ProfileSheet {...base} completion={null} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Dilnoza Karimova" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByText("@dilnoza_k", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("lists every detail as a labelled row and hands editing to one link", () => {
    render(<ProfileSheet {...base} completion={null} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Region",
      "Telegram",
    ]);
    expect(screen.getAllByRole("definition").map((row) => row.textContent)).toEqual([
      "Tashkent City",
      "@dilnoza_k",
    ]);
    const edit = screen.getByRole("link", { name: "Edit profile" });
    expect(edit).toHaveAttribute("href", "/profile/edit");
    expect(edit).toHaveAttribute("data-prefetch");
    expect(
      within(screen.getByRole("list", { name: "Participation" })).getByText("5 events"),
    ).toBeInTheDocument();
  });

  it("shows completeness only while something is missing", () => {
    const { rerender } = render(
      <ProfileSheet
        {...base}
        completion={{
          percent: 83,
          value: "83% complete",
          missing: "Still missing: Bio",
          label: "Profile completeness",
        }}
      />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Profile completeness" }),
    ).toHaveAttribute("aria-valuenow", "83");
    expect(screen.getByText("Still missing: Bio")).toBeInTheDocument();

    rerender(<ProfileSheet {...base} completion={null} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("leaves out an empty bio, the figures and the rows rather than drawing blanks", () => {
    render(<ProfileSheet {...base} bio="" figures={[]} rows={[]} completion={null} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("term")).not.toBeInTheDocument();
    expect(screen.queryByText("Second-year student.")).not.toBeInTheDocument();
  });
});
