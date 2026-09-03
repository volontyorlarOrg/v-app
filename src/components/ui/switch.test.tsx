import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("is a labelled switch that reports and toggles its state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch
        label="Telegram messages"
        description="From the bot"
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByRole("switch", { name: "Telegram messages" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAccessibleDescription("From the bot");

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("submits a hidden value only while it is on", async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch label="Open only" name="open" />);

    expect(container.querySelector('input[name="open"]')).toBeNull();
    await user.click(screen.getByRole("switch"));
    expect(container.querySelector('input[name="open"]')).toHaveValue("1");
  });

  it("follows a controlled value without owning it", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Dark theme" checked onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
