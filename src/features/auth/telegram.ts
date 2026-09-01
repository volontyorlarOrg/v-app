import { z } from "zod";

/**
 * Telegram sign-in — **UNVERIFIED ASSUMED CONTRACT**.
 *
 * Read this before touching anything here.
 *
 * The handoff names Telegram as the high-priority authentication path and, in
 * the same breath, forbids inventing its backend protocol. The marketing
 * repository's own `docs/integrations/TELEGRAM.md` records that *nothing* is
 * implemented: no bot, no token, no webhook, no verification route.
 *
 * So this module defines the **shape** the frontend needs in order to have a
 * sign-in path at all, and marks every part of it as an assumption. The shape
 * is modelled on the bot-deep-link flow because that flow has a property the
 * Login Widget does not: the credential is delivered into the user's own
 * Telegram chat, so a forwarded deep link cannot sign an attacker in as
 * someone else.
 *
 * What is assumed, and must be confirmed before this is called working:
 *   1. `POST {API}/auth/telegram/ticket` returns `{ ticket, botUsername }`.
 *   2. The bot delivers a one-time login token to the user's own chat.
 *   3. `POST {API}/auth/telegram/complete` exchanges that token for a session.
 *
 * What is *not* assumed and never will be:
 *   - The browser never verifies a Telegram identity payload. Any `hash`,
 *     `auth_date`, or user object that reaches JavaScript is untrusted input.
 *     Verification is the backend's, using the bot token, which never leaves it.
 *
 * @see docs/architecture/AUTH_AND_SECURITY.md
 */

/** Response to the ticket request. Assumed. */
export const telegramTicketSchema = z.object({
  /** Single-use value passed as the bot's `?start=` payload. */
  ticket: z.string().min(1),
  /** Bot username, without `@`. Supplied by the backend so there is one source. */
  botUsername: z.string().regex(/^[A-Za-z0-9_]{4,32}$/),
});

export type TelegramTicket = z.infer<typeof telegramTicketSchema>;

/**
 * Response to redeeming a login token. Assumed.
 *
 * Note what is absent: any user-supplied field. The backend decides who this
 * is; the frontend only stores what it is told.
 */
export const telegramSessionSchema = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  accessTokenExpiresAt: z.number().int().positive().optional(),
  displayName: z.string().optional(),
  roles: z.array(z.enum(["volunteer", "partner", "admin"])).optional(),
});

export type TelegramSessionResponse = z.infer<typeof telegramSessionSchema>;

/** Outcomes surfaced back to `/login` as `?telegram=<status>`. */
export const TELEGRAM_STATUSES = ["unavailable", "expired"] as const;
export type TelegramStatus = (typeof TELEGRAM_STATUSES)[number];

export function isTelegramStatus(value: unknown): value is TelegramStatus {
  return (
    typeof value === "string" && (TELEGRAM_STATUSES as readonly string[]).includes(value)
  );
}

/** Builds the deep link. The only Telegram URL this app ever constructs. */
export function botDeepLink(botUsername: string, ticket: string): string {
  return `https://t.me/${encodeURIComponent(botUsername)}?start=${encodeURIComponent(ticket)}`;
}
