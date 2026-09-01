import { z } from "zod";

export const telegramTicketSchema = z.object({
  ticket: z.string().min(1),

  botUsername: z.string().regex(/^[A-Za-z0-9_]{4,32}$/),
});

export type TelegramTicket = z.infer<typeof telegramTicketSchema>;

export const telegramSessionSchema = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  accessTokenExpiresAt: z.number().int().positive().optional(),
  displayName: z.string().optional(),
  roles: z.array(z.enum(["volunteer", "partner", "admin"])).optional(),
});

export type TelegramSessionResponse = z.infer<typeof telegramSessionSchema>;

export const TELEGRAM_STATUSES = ["unavailable", "expired"] as const;
export type TelegramStatus = (typeof TELEGRAM_STATUSES)[number];

export function isTelegramStatus(value: unknown): value is TelegramStatus {
  return (
    typeof value === "string" &&
    (TELEGRAM_STATUSES as readonly string[]).includes(value)
  );
}

export function botDeepLink(botUsername: string, ticket: string): string {
  return `https://t.me/${encodeURIComponent(botUsername)}?start=${encodeURIComponent(ticket)}`;
}
