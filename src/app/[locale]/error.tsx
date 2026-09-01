"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

/**
 * Route error boundary.
 *
 * Shows a translated message and the digest — never `error.message`, which on
 * the server is the raw exception text and can name internal hosts, queries,
 * or configuration. The digest is the only safe handle, and it is what a
 * server log can be searched by.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.boundary");

  useEffect(() => {
    console.error("[boundary]", error.digest ?? error.name);
  }, [error]);

  return (
    <ErrorState
      title={t("title")}
      body={t("body")}
      reference={error.digest ? t("reference", { digest: error.digest }) : undefined}
      action={<Button onClick={reset}>{t("reset")}</Button>}
      className="my-12"
    />
  );
}
