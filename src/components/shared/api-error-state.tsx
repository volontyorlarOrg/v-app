import { getTranslations } from "next-intl/server";
import { classifyApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { Link } from "@/i18n/navigation";

/**
 * Renders a failed server read as the *right* message.
 *
 * This is where "do not collapse every failure into 'Something went wrong'"
 * becomes enforceable: the error is classified into the closed code set, and
 * each code has its own translated title and body in the `errors` namespace.
 * A 403 says you lack access, a 404 says it is missing, a network failure says
 * your answers are safe.
 *
 * Server-safe, so a page's `catch` can return it directly.
 */
export async function ApiErrorState({ error }: { error: unknown }) {
  const t = await getTranslations("errors");
  const classified = classifyApiError(error);

  // `timeout` and `rateLimited` have no dedicated copy — both read to a user
  // as "the server did not answer", which is what `network` already says.
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
