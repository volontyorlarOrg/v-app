import { describe, expect, it } from "vitest";

import {
  botDeepLink,
  isTelegramStatus,
  telegramTicketSchema,
} from "@/lib/auth/telegram";

describe("botDeepLink", () => {
  it("builds the start deep link the bot answers", () => {
    expect(botDeepLink("volontyorlar_bot", "ticket-value")).toBe(
      "https://t.me/volontyorlar_bot?start=ticket-value",
    );
  });

  it("encodes a ticket rather than letting it break out of the query", () => {
    expect(botDeepLink("volontyorlar_bot", "a&b=c")).toBe(
      "https://t.me/volontyorlar_bot?start=a%26b%3Dc",
    );
  });
});

describe("telegramTicketSchema", () => {
  it("accepts what the backend returns", () => {
    expect(
      telegramTicketSchema.safeParse({
        ticket: "5s5nJ0oGjWQrn9bkQ5o1CqTQ0Xj3nGgLZ3nQ1p2r3s4",
        botUsername: "volontyorlar_bot",
        expiresAt: "2026-09-05T12:10:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("rejects a bot username Telegram could never issue", () => {
    expect(
      telegramTicketSchema.safeParse({ ticket: "abc", botUsername: "bad name!" })
        .success,
    ).toBe(false);
  });

  it("rejects a ticket longer than a Telegram start payload allows", () => {
    expect(
      telegramTicketSchema.safeParse({
        ticket: "a".repeat(65),
        botUsername: "volontyorlar_bot",
      }).success,
    ).toBe(false);
  });
});

describe("isTelegramStatus", () => {
  it("recognises only the statuses the route handlers set", () => {
    expect(isTelegramStatus("expired")).toBe(true);
    expect(isTelegramStatus("unavailable")).toBe(true);
    expect(isTelegramStatus("signed-in")).toBe(false);
    expect(isTelegramStatus(undefined)).toBe(false);
  });
});
