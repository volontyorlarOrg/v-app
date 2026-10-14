import { describe, expect, it, vi } from "vitest";

import { LANGUAGE_BOOT_SCRIPT, LANGUAGE_RELOAD_KEY } from "@/lib/language-guard";

type Shown = (event: { persisted: boolean }) => void;

function page({
  cookie,
  lang,
  chosen = null,
  path = "/dashboard",
  stored = new Map<string, string>(),
}: {
  cookie: string;
  lang: string;
  chosen?: string | null;
  path?: string;
  stored?: Map<string, string>;
}) {
  const reload = vi.fn();
  const shown: Shown[] = [];
  const document = { cookie, documentElement: { lang } };
  const location = { pathname: path, search: "", reload };
  const sessionStorage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
    removeItem: (key: string) => void stored.delete(key),
  };
  const localStorage = { getItem: () => chosen };
  const addEventListener = (name: string, listener: Shown) => {
    if (name === "pageshow") shown.push(listener);
  };

  const run = () =>
    new Function(
      "document",
      "location",
      "sessionStorage",
      "addEventListener",
      "localStorage",
      LANGUAGE_BOOT_SCRIPT,
    )(document, location, sessionStorage, addEventListener, localStorage);

  return {
    run,
    reload,
    stored,
    document,
    show: (persisted: boolean) => shown.forEach((listener) => listener({ persisted })),
  };
}

describe("the language boot script", () => {
  it("reloads a page the browser kept in another language", () => {
    const kept = page({ cookie: "theme=dark; volontyorlar_locale=ru", lang: "en" });
    kept.run();
    expect(kept.reload).toHaveBeenCalledTimes(1);
    expect(kept.stored.get(LANGUAGE_RELOAD_KEY)).toBe("/dashboard|ru");
  });

  it("leaves a page alone when it is already in the chosen language", () => {
    const stored = new Map([[LANGUAGE_RELOAD_KEY, "/dashboard|ru"]]);
    const current = page({ cookie: "volontyorlar_locale=ru", lang: "ru", stored });
    current.run();
    expect(current.reload).not.toHaveBeenCalled();
    expect(stored.has(LANGUAGE_RELOAD_KEY)).toBe(false);
  });

  it("does nothing before any language was chosen, or for a value it does not know", () => {
    for (const cookie of [
      "",
      "theme=dark",
      "volontyorlar_locale=fr",
      "Xvolontyorlar_locale=ru",
    ]) {
      const untouched = page({ cookie, lang: "en" });
      untouched.run();
      expect(untouched.reload, cookie).not.toHaveBeenCalled();
    }
  });

  it("treats the language saved in this browser as the choice", () => {
    const lost = page({ cookie: "theme=dark", lang: "uz", chosen: "ru" });
    lost.run();
    expect(lost.document.cookie).toMatch(
      /^volontyorlar_locale=ru; path=\/; max-age=\d+; samesite=lax/,
    );
    expect(lost.reload).toHaveBeenCalledTimes(1);

    const overwritten = page({
      cookie: "volontyorlar_locale=en",
      lang: "en",
      chosen: "ru",
    });
    overwritten.run();
    expect(overwritten.document.cookie).toContain("volontyorlar_locale=ru");
    expect(overwritten.reload).toHaveBeenCalledTimes(1);

    const agreed = page({ cookie: "volontyorlar_locale=ru", lang: "ru", chosen: "ru" });
    agreed.run();
    expect(agreed.document.cookie).toBe("volontyorlar_locale=ru");
    expect(agreed.reload).not.toHaveBeenCalled();
  });

  it("ignores a saved value it does not know", () => {
    const odd = page({ cookie: "volontyorlar_locale=en", lang: "en", chosen: "de" });
    odd.run();
    expect(odd.document.cookie).toBe("volontyorlar_locale=en");
    expect(odd.reload).not.toHaveBeenCalled();
  });

  it("reloads once for one address, so a server that disagrees cannot loop", () => {
    const stored = new Map<string, string>();
    const first = page({ cookie: "volontyorlar_locale=ru", lang: "en", stored });
    first.run();
    const second = page({ cookie: "volontyorlar_locale=ru", lang: "en", stored });
    second.run();
    expect(first.reload).toHaveBeenCalledTimes(1);
    expect(second.reload).not.toHaveBeenCalled();

    const elsewhere = page({
      cookie: "volontyorlar_locale=ru",
      lang: "en",
      path: "/settings",
      stored,
    });
    elsewhere.run();
    expect(elsewhere.reload).toHaveBeenCalledTimes(1);
  });

  it("checks again when the browser restores the page from its back-forward cache", () => {
    const restored = page({ cookie: "volontyorlar_locale=en", lang: "en" });
    restored.run();
    restored.show(false);
    expect(restored.reload).not.toHaveBeenCalled();

    restored.document.cookie = "volontyorlar_locale=uz";
    restored.show(false);
    expect(restored.reload).not.toHaveBeenCalled();
    restored.show(true);
    expect(restored.reload).toHaveBeenCalledTimes(1);
  });
});
