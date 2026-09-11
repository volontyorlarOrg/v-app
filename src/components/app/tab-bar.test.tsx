import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TabBar } from "@/components/app/tab-bar";

const usePathname = vi.fn(() => "/applications/123");

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => usePathname(),
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const items = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "opportunities", href: "/opportunities", label: "Opportunities" },
] as const;

describe("TabBar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/applications/123");
  });

  it("is a labelled navigation with one link per section", () => {
    render(<TabBar items={items} label="App sections" />);
    expect(
      screen.getByRole("navigation", { name: "App sections" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("marks the section that owns the current path, including pages folded into it", () => {
    render(<TabBar items={items} label="App sections" />);
    expect(screen.getByRole("link", { name: "Opportunities" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the dashboard for the old record URL", () => {
    usePathname.mockReturnValue("/record");
    render(<TabBar items={items} label="App sections" />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
