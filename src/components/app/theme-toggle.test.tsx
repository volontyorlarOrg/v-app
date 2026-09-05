import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { THEME_COOKIE_NAME } from "@/lib/theme";

function stubMatchMedia(matching: Record<string, boolean>) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matching[query] ?? false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0`;
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.motion;
    stubMatchMedia({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is a labelled switch that reports the current theme", () => {
    render(<ThemeToggle label="Dark theme" />);
    expect(screen.getByRole("switch", { name: "Dark theme" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("follows the system preference when nothing is stored", async () => {
    stubMatchMedia({ "(prefers-color-scheme: dark)": true });
    render(<ThemeToggle label="Dark theme" />);
    expect(document.documentElement.dataset.theme).toBe("dark");
    await waitFor(() =>
      expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true"),
    );
  });

  it("prefers a stored choice over the system preference", () => {
    stubMatchMedia({ "(prefers-color-scheme: dark)": true });
    document.cookie = `${THEME_COOKIE_NAME}=light; path=/`;
    render(<ThemeToggle label="Dark theme" />);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("switches the document theme and remembers the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle label="Dark theme" />);

    await user.click(screen.getByRole("switch"));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=dark`);

    await user.click(screen.getByRole("switch"));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.cookie).toContain(`${THEME_COOKIE_NAME}=light`);
  });

  it("leaves motion off under prefers-reduced-motion", () => {
    stubMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<ThemeToggle label="Dark theme" />);
    expect(document.documentElement.dataset.motion).toBeUndefined();
  });
});
