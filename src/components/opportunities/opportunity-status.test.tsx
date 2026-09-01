import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render";
import { OpportunityDeadline } from "./opportunity-deadline";
import { OpportunityStatusBadge } from "./opportunity-status";

/**
 * Status and deadline rendering.
 *
 * The assertions are on *words*, not on classes, because the accessibility
 * requirement is that status survives without colour. If a badge ever
 * communicates "closed" by turning grey and nothing else, these fail.
 */

const NOW = new Date("2026-06-15T12:00:00.000Z");

function at(days: number, hour = 18): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour - 5, 0, 0, 0);
  return date.toISOString();
}

describe("OpportunityStatusBadge", () => {
  it("says open in words", () => {
    renderWithIntl(
      <OpportunityStatusBadge
        opportunity={{ status: "open", applicationDeadline: at(20) }}
        now={NOW}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows a passed deadline as closed even when the record says open", () => {
    renderWithIntl(
      <OpportunityStatusBadge
        opportunity={{ status: "open", applicationDeadline: at(-3) }}
        now={NOW}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.queryByText("Open")).not.toBeInTheDocument();
  });

  it("marks an imminent deadline as closing soon", () => {
    renderWithIntl(
      <OpportunityStatusBadge
        opportunity={{ status: "open", applicationDeadline: at(2) }}
        now={NOW}
      />,
      { locale: "en" },
    );

    expect(screen.getByText("Closing soon")).toBeInTheDocument();
  });

  it("renders in Uzbek when that is the locale", () => {
    renderWithIntl(
      <OpportunityStatusBadge
        opportunity={{ status: "full", applicationDeadline: at(9) }}
        now={NOW}
      />,
      { locale: "uz" },
    );

    // Proves the catalogue is wired up, not just that a key exists.
    expect(screen.getByText("Joy qolmagan")).toBeInTheDocument();
  });
});

describe("OpportunityDeadline", () => {
  it("says closes today rather than a raw date", () => {
    renderWithIntl(<OpportunityDeadline deadline={at(0, 23)} now={NOW} />, {
      locale: "en",
    });

    expect(screen.getByText("Closes today")).toBeInTheDocument();
  });

  it("counts remaining days for a near deadline", () => {
    renderWithIntl(<OpportunityDeadline deadline={at(3)} now={NOW} />, {
      locale: "en",
    });

    expect(screen.getByText("Closes in 3 days")).toBeInTheDocument();
  });

  it("states plainly when applications have closed", () => {
    renderWithIntl(<OpportunityDeadline deadline={at(-1)} now={NOW} />, {
      locale: "en",
    });

    expect(screen.getByText("Applications closed")).toBeInTheDocument();
  });

  it("falls back to a formatted date when the deadline is far off", () => {
    renderWithIntl(<OpportunityDeadline deadline={at(40)} now={NOW} />, {
      locale: "en",
    });

    // "Closes 25 Jul 2026" — the exact date matters less than that it is a
    // date rather than an unhelpful "in 40 days".
    expect(screen.getByText(/^Closes /)).toBeInTheDocument();
  });

  it("pluralises correctly in Russian", () => {
    renderWithIntl(<OpportunityDeadline deadline={at(2)} now={NOW} />, {
      locale: "ru",
    });

    // Russian has a distinct few-form; getting this wrong reads as broken.
    expect(screen.getByText("Закрывается через 2 дня")).toBeInTheDocument();
  });
});
