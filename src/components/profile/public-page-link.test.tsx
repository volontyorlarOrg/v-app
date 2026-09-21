import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicPageLink } from "@/components/profile/public-page-link";

const labels = { copy: "Copy link", copied: "Link copied" };
const href = "https://volontyorlar.uz/dilnoza_k";

describe("PublicPageLink", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the address without its scheme and opens it in a new tab", () => {
    render(<PublicPageLink href={href} labels={labels} />);
    const link = screen.getByRole("link", { name: "volontyorlar.uz/dilnoza_k" });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("copies the full address and says so", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<PublicPageLink href={href} labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Copy link" }));

    expect(writeText).toHaveBeenCalledWith(href);
    expect(screen.getByRole("button", { name: "Link copied" })).toBeInTheDocument();
    expect(
      screen.getByText("Link copied", { selector: "[aria-live]" }),
    ).toBeInTheDocument();
  });

  it("stays quiet when the clipboard refuses", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    render(<PublicPageLink href={href} labels={labels} />);

    await user.click(screen.getByRole("button", { name: "Copy link" }));

    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
  });
});
