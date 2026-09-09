import {
  furthestOnboardingState,
  readOnboardingStateFromDocument,
  readOnboardingStateFromStorage,
  serializeOnboardingState,
  writeOnboardingStateToClient,
  type OnboardingState,
} from "@/lib/onboarding/state";

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeToOnboardingState(listener: Listener): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Serialized rather than parsed: useSyncExternalStore compares snapshots by
 * identity, and a fresh object every read would never settle.
 */
export function onboardingStateSnapshot(): string | null {
  const state = furthestOnboardingState(
    readOnboardingStateFromDocument(),
    readOnboardingStateFromStorage(),
  );
  return state === null ? null : serializeOnboardingState(state);
}

export function publishOnboardingState(state: OnboardingState) {
  writeOnboardingStateToClient(state);
  for (const listener of [...listeners]) listener();
}
