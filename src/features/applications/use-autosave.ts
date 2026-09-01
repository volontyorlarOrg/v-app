"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "failed";

export type AutosaveState = {
  status: SaveStatus;

  savedAt: Date | null;
  hasUnsavedChanges: boolean;

  flush: () => Promise<void>;
};

type SaveOutcome = "idle" | "saving" | "saved" | "failed";

export function useAutosave<T>({
  value,
  onSave,
  delayMs = 1500,
  enabled = true,
}: {
  value: T;
  onSave: (value: T) => Promise<void>;

  delayMs?: number;
  enabled?: boolean;
}): AutosaveState {
  const serialized = JSON.stringify(value);

  const [outcome, setOutcome] = useState<SaveOutcome>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const [baseline, setBaseline] = useState(() => serialized);

  const dirty = baseline !== serialized;

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

      setBaseline(snapshot);
      setSavedAt(new Date());
      setOutcome("saved");
    } catch {
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
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const status: SaveStatus =
    outcome === "saving" ? "saving" : dirty ? "pending" : outcome;

  return { status, savedAt, hasUnsavedChanges: dirty, flush: save };
}
