import type { Locale } from "@/i18n/routing";
import {
  isOnboardingStep,
  stepIndex,
  type OnboardingStep,
} from "@/lib/onboarding/steps";
import { localePath } from "@/lib/routing/routes";

export const ONBOARDING_COOKIE_NAME = "volontyorlar_onboarding";
export const ONBOARDING_STORAGE_KEY = "volontyorlar_onboarding";
export const ONBOARDING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export type OnboardingState =
  | { status: "pending"; step: OnboardingStep }
  | { status: "skipped"; step: OnboardingStep }
  | { status: "done" };

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  status: "pending",
  step: "welcome",
};

export function parseOnboardingState(
  value: string | null | undefined,
): OnboardingState | null {
  if (!value) return null;
  if (value === "done") return { status: "done" };

  const [status, step] = value.split(":");
  if ((status === "pending" || status === "skipped") && isOnboardingStep(step)) {
    return { status, step };
  }
  return null;
}

export function serializeOnboardingState(state: OnboardingState): string {
  return state.status === "done" ? "done" : `${state.status}:${state.step}`;
}

export function resumeStep(state: OnboardingState | null): OnboardingStep {
  if (!state || state.status === "done" || state.step === "done") return "welcome";
  return state.step;
}

export function isOnboardingOpen(state: OnboardingState | null): boolean {
  return state !== null && state.status !== "done";
}

export function onboardingPath(locale: Locale, next: string | null = null): string {
  const path = localePath(locale, "welcome");
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

export function onboardingCookieAttributes(secure: boolean) {
  return {
    path: "/",
    sameSite: "lax" as const,
    maxAge: ONBOARDING_COOKIE_MAX_AGE_SECONDS,
    httpOnly: false,
    secure,
  };
}

export function readOnboardingStateFromDocument(): OnboardingState | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${ONBOARDING_COOKIE_NAME}=([^;]*)`),
    );
    return parseOnboardingState(match?.[1]);
  } catch {
    return null;
  }
}

export function writeOnboardingStateToDocument(state: OnboardingState) {
  try {
    const parts = [
      `${ONBOARDING_COOKIE_NAME}=${serializeOnboardingState(state)}`,
      "path=/",
      `max-age=${ONBOARDING_COOKIE_MAX_AGE_SECONDS}`,
      "samesite=lax",
    ];
    if (window.location.protocol === "https:") parts.push("secure");
    document.cookie = parts.join("; ");
  } catch {}
}

export function readOnboardingStateFromStorage(): OnboardingState | null {
  try {
    return parseOnboardingState(window.localStorage.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeOnboardingStateToStorage(state: OnboardingState) {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, serializeOnboardingState(state));
  } catch {}
}

export function furthestOnboardingState(
  a: OnboardingState | null,
  b: OnboardingState | null,
): OnboardingState | null {
  if (a === null) return b;
  if (b === null) return a;
  if (a.status === "done" || b.status === "done") return { status: "done" };
  return stepIndex(a.step) >= stepIndex(b.step) ? a : b;
}

export function readOnboardingStateFromClient(): OnboardingState | null {
  const cookie = readOnboardingStateFromDocument();
  const stored = readOnboardingStateFromStorage();
  const state = furthestOnboardingState(cookie, stored);
  if (state === null) return null;

  // Whichever store lagged behind gets the settled answer, so the next render
  // on the server starts from the same place the browser is already at.
  const settled = serializeOnboardingState(state);
  const behind = [cookie, stored].some(
    (side) => side === null || serializeOnboardingState(side) !== settled,
  );
  if (behind) writeOnboardingStateToClient(state);
  return state;
}

export function writeOnboardingStateToClient(state: OnboardingState) {
  writeOnboardingStateToDocument(state);
  writeOnboardingStateToStorage(state);
}
