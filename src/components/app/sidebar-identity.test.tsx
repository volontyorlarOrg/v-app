import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarIdentity } from "@/components/app/sidebar-identity";

const usePathname = vi.fn(() => "/dashboard");

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => usePathname(),
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const user = {
  name: "Dilnoza Karimova",
  initials: "DK",
  level: "Newcomer",
  handle: "dilnoza_k",
};

describe("SidebarIdentity", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/dashboard");
  });

  it("is the one link to the profile, named for it and for the volunteer", () => {
    render(<SidebarIdentity user={user} label="Profile" />);
    const link = screen.getByRole("link", { name: "Profile: Dilnoza Karimova" });
    expect(link).toHaveAttribute("href", "/profile");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("keeps the name, the handle and the level on the card", () => {
    render(<SidebarIdentity user={user} label="Profile" />);
    expect(screen.getByText("Dilnoza Karimova")).toBeInTheDocument();
    expect(screen.getByText("@dilnoza_k")).toBeInTheDocument();
    expect(screen.getByText("Newcomer")).toBeInTheDocument();
  });

  it("leaves the handle out when the account has none", () => {
    render(<SidebarIdentity user={{ ...user, handle: null }} label="Profile" />);
    expect(screen.queryByText(/^@/)).not.toBeInTheDocument();
  });

  it("marks the profile and its editor as the current page, and nothing else", () => {
    const { rerender } = render(<SidebarIdentity user={user} label="Profile" />);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");

    for (const path of ["/profile", "/profile/edit"]) {
      usePathname.mockReturnValue(path);
      rerender(<SidebarIdentity user={user} label="Profile" />);
      expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
    }

    usePathname.mockReturnValue("/settings");
    rerender(<SidebarIdentity user={user} label="Profile" />);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });
});
