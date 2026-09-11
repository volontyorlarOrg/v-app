"use client";

import { useEffect, useState } from "react";

export function SlowLoadNotice({
  delayMs,
  children,
}: {
  delayMs: number;
  children: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <p
      role="status"
      aria-live="polite"
      className="load-pulse mx-auto mt-6 max-w-prose text-center text-sm text-ink-muted"
      hidden={!shown}
    >
      {shown ? children : null}
    </p>
  );
}
