"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

const COPIED_FOR_MS = 2_000;

export function PublicPageLink({
  href,
  labels,
}: {
  href: string;
  labels: { copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);
  const { host, path } = displayUrl(href);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 font-semibold text-primary-ink underline-offset-4 hover:underline"
      >
        {host}
        {path ? (
          <>
            /<wbr />
            {path}
          </>
        ) : null}
      </a>
      <button
        type="button"
        onClick={copy}
        data-copied={copied || undefined}
        aria-label={copied ? labels.copied : labels.copy}
        className="copy-toggle relative -my-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors before:absolute before:-inset-1 hover:bg-surface-soft hover:text-primary-ink"
      >
        <Copy aria-hidden="true" className="copy-toggle-idle size-4" />
        <Check aria-hidden="true" className="copy-toggle-done size-4" />
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </span>
  );
}

function displayUrl(href: string): { host: string; path: string } {
  try {
    const url = new URL(href);
    return {
      host: url.host.replace(/^www\./, ""),
      path: url.pathname.replace(/^\/|\/$/g, ""),
    };
  } catch {
    return { host: href, path: "" };
  }
}
