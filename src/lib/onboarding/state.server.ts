import "server-only";

import { cookies } from "next/headers";

import { isSecureCookieTransport } from "@/lib/auth/config";
import {
  INITIAL_ONBOARDING_STATE,
  ONBOARDING_COOKIE_NAME,
  onboardingCookieAttributes,
  parseOnboardingState,
  serializeOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding/state";

export async function readOnboardingState(): Promise<OnboardingState | null> {
  const store = await cookies();
  return parseOnboardingState(store.get(ONBOARDING_COOKIE_NAME)?.value);
}

export function onboardingStartCookie() {
  return {
    name: ONBOARDING_COOKIE_NAME,
    value: serializeOnboardingState(INITIAL_ONBOARDING_STATE),
    ...onboardingCookieAttributes(isSecureCookieTransport()),
  };
}
