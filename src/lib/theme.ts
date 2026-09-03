export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const THEME_BOOT_SCRIPT = `(function(){var r=document.documentElement;try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.dataset.theme=d?"dark":"light"}catch(e){}try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)r.dataset.motion=""}catch(e){}})()`;

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function preferredTheme(): Theme {
  return (
    storedTheme() ??
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function motionAllowed(): boolean {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function restorePreferences() {
  const root = document.documentElement;
  root.dataset.theme = preferredTheme();
  if (motionAllowed()) root.dataset.motion = "";
  else delete root.dataset.motion;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
