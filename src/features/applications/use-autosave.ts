"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Idle-triggered autosave with a visible, honest status.
 *
 * Two decisions worth stating, because both were choices:
 *
 * 1. **The server draft is the only durable copy.** Essay text is not written
 *    to `localStorage`. It is exactly the sensitive, personal content that
 *    handoff §26 says must not sit in browser storage without a documented
 *    need, and a server-side draft already covers the case that matters —
 *    coming back on another device, or after the tab is killed.
 *
 * 2. **`beforeunload` covers the gap.** Between a keystroke and the next
 *    successful save there is a window where a refresh loses work. Rather than
 *    quietly widening that window, `hasUnsavedChanges` drives a native
 *    "leave site?" prompt, so the loss is never silent.
 */

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "failed";

export type AutosaveState = {
  status: SaveStatus;
  /** When the last successful save happened. */
  savedAt: Date | null;
  hasUnsavedChanges: boolean;
  /** Forces an immediate save, e.g. just before submitting. */
  flush: () => Promise<void>;
};

/** What the last *completed* save attempt did. "pending" is derived, not stored. */
type SaveOutcome = "idle" | "saving" | "saved" | "failed";

export function useAutosave<T>({
  value,
  onSave,
  delayMs = 1500,
  enabled = true,
}: {
  value: T;
  onSave: (value: T) => Promise<void>;
  /** Idle time before saving. Long enough not to fire mid-sentence. */
  delayMs?: number;
  enabled?: boolean;
}): AutosaveState {
  const serialized = JSON.stringify(value);

  const [outcome, setOutcome] = useState<SaveOutcome>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  /**
   * What the server last accepted. Held in state rather than a ref because
   * `hasUnsavedChanges` is derived from it and has to re-render the indicator
   * when it changes — a ref would leave the UI showing a stale "Saved".
   *
   * Seeded from the initial value, so mounting is not treated as an edit.
   */
  const [baseline, setBaseline] = useState(() => serialized);

  const dirty = baseline !== serialized;

  // Refs for things a callback needs but that must not re-create it. Written
  // only inside an effect, never during render.
  const latest = useRef(value);
  const onSaveRef = useRef(onSave);
  const inFlight = useRef(false);

  useEffect(() => {
    latest.current = value;
    onSaveRef.current = onSave;
  });

  const save = useCallback(async () => {
    if (inFlight.current) return;

    const snapshot = JSON.stringify(latest.current);
    if (snapshot === baseline) return;

    inFlight.current = true;
    setOutcome("saving");

    try {
      await onSaveRef.current(latest.current);
      // Records what was saved, not what is current — anything typed during
      // the request stays dirty and is picked up by the next cycle.
      setBaseline(snapshot);
      setSavedAt(new Date());
      setOutcome("saved");
    } catch {
      // The message is the caller's to render; this hook only reports that the
      // save did not land, so the UI never claims "Saved" when it is not.
      setOutcome("failed");
    } finally {
      inFlight.current = false;
    }
  }, [baseline]);

  useEffect(() => {
    if (!enabled || !dirty) return;

    const timer = setTimeout(() => void save(), delayMs);
    return () => clearTimeout(timer);
  }, [serialized, dirty, enabled, delayMs, save]);

  useEffect(() => {
    if (!dirty) return;

    function warn(event: BeforeUnloadEvent) {
      // The browser shows its own copy; calling `preventDefault` is what
      // triggers it at all. Never fires when everything is saved.
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /**
   * "Pending" is derived rather than stored: it is exactly the state of
   * "there are unsaved edits and no request is in flight". Storing it would
   * mean a `setState` inside the debounce effect, which cascades a render on
   * every keystroke.
   */
  const status: SaveStatus =
    outcome === "saving" ? "saving" : dirty ? "pending" : outcome;

  return { status, savedAt, hasUnsavedChanges: dirty, flush: save };
}
