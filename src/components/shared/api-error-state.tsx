import { getTranslations } from "next-intl/server";
import { classifyApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { Link } from "@/i18n/navigation";

export async function ApiErrorState({ error }: { error: unknown }) {
  const t = await getTranslations("errors");
  const classified = classifyApiError(error);

  const code =
    classified.code === "timeout" || classified.code === "rateLimited"
      ? "network"
      : classified.code === "invalidResponse"
        ? "server"
        : classified.code;

  const needsSignIn = code === "unauthenticated";

  return (
    <ErrorState
      title={t(`${code}.title`)}
      body={t(`${code}.body`)}
      action={
        needsSignIn ? (
          <Button asChild>
            <Link href="/login">{t("notFound.browse")}</Link>
          </Button>
        ) : undefined
      }
      className="my-8"
    />
  );
}
