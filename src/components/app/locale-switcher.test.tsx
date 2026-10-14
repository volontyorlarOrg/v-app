import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { localeNames, locales } from "@/i18n/routing";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  readPreferenceCookie,
} from "@/lib/preferences";

const refresh = vi.fn();
const useLocale = vi.fn(() => "ru");

vi.mock("next-intl", () => ({
  useLocale: () => useLocale(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    refresh.mockClear();
    useLocale.mockReturnValue("ru");
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
    window.localStorage.clear();
  });

  it("offers every locale by name", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher label="Language" />);
    await user.click(screen.getByRole("button", { name: "Language: Русский" }));

    for (const locale of locales) {
      const item = screen.getByRole("menuitem", { name: localeNames[locale] });
      expect(item).toHaveAttribute("lang", locale);
      expect(item).not.toHaveAttribute("href");
    }
  });

  it("saves the chosen language in this browser and re-reads the same address", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher label="Language" />);
    await user.click(screen.getByRole("button", { name: "Language: Русский" }));
    await user.click(screen.getByRole("menuitem", { name: "English" }));

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    expect(readPreferenceCookie(LOCALE_COOKIE_NAME)).toBe("en");
    expect(readPreferenceCookie("NEXT_LOCALE")).toBeNull();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the active language is chosen again", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher label="Language" />);
    await user.click(screen.getByRole("button", { name: "Language: Русский" }));
    await user.click(screen.getByRole("menuitem", { name: "Русский" }));

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
    expect(readPreferenceCookie(LOCALE_COOKIE_NAME)).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("marks only the active locale", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher label="Language" />);
    await user.click(screen.getByRole("button", { name: "Language: Русский" }));

    expect(screen.getByRole("menuitem", { name: "Русский" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("menuitem", { name: "O‘zbekcha" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher label="Language" />);
    const trigger = screen.getByRole("button", { name: "Language: Русский" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
