import { z } from "zod";

export const telegramTicketSchema = z.object({
  ticket: z.string().min(1).max(64),
  botUsername: z.string().regex(/^[A-Za-z0-9_]{4,32}$/),
  expiresAt: z.string().optional(),
});

export type TelegramTicket = z.infer<typeof telegramTicketSchema>;

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
