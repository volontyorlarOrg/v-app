"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

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
