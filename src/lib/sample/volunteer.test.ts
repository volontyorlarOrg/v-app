import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/routing";
import { isUpcomingCommitment } from "@/lib/applications/status";
import { deadlineState } from "@/lib/opportunities/deadline";
import { levelFor } from "@/lib/record/levels";
import { sampleOpportunities, sampleOpportunity } from "@/lib/sample/opportunities";
import { sampleApplication, sampleVolunteer } from "@/lib/sample/volunteer";

const NOW = new Date("2026-06-15T12:00:00.000Z");

describe("the sample catalogue", () => {
  const catalogue = sampleOpportunities(NOW);

  it("has unique slugs and finds an opportunity by slug", () => {
    const slugs = catalogue.map((opportunity) => opportunity.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(sampleOpportunity("winter-book-drive", NOW)?.id).toBe("smp-book-drive");
    expect(sampleOpportunity("nope", NOW)).toBeNull();
  });

  it("carries every text in all three languages", () => {
    for (const opportunity of catalogue) {
      const texts = [
        opportunity.title,
        opportunity.organization.name,
        opportunity.description,
        ...opportunity.requirements,
        ...opportunity.questions.flatMap((question) => [
          question.prompt,
          ...(question.help ? [question.help] : []),
          ...(question.options ?? []).map((option) => option.label),
        ]),
      ];
      for (const text of texts) {
        for (const locale of locales) {
          expect(text[locale].trim().length, `${text.en} in ${locale}`).toBeGreaterThan(
            0,
          );
        }
      }
    }
  });

  it("covers open, closing-soon, full and closed states so every chip is exercised", () => {
    const states = new Set(
      catalogue.map((opportunity) =>
        opportunity.status === "open"
          ? deadlineState(opportunity.applicationDeadline, NOW).kind
          : opportunity.status,
      ),
    );
    for (const state of ["later", "soon", "tomorrow", "full", "closed"]) {
      expect(states.has(state as never), state).toBe(true);
    }
  });
});

describe("the sample volunteer", () => {
  const volunteer = sampleVolunteer(NOW);

  it("is an active volunteer with a next level in reach, so every block has content", () => {
    expect(levelFor(volunteer.record.counts)).toBe("active");
    expect(volunteer.applications.length).toBeGreaterThanOrEqual(4);
    expect(
      volunteer.applications.filter((a) => isUpcomingCommitment(a, NOW)),
    ).toHaveLength(2);
    expect(volunteer.saved.length).toBeGreaterThan(0);
    expect(volunteer.closingSoon.length).toBeGreaterThan(0);
    expect(volunteer.activity.length).toBeGreaterThan(0);
    expect(volunteer.notifications.some((notification) => notification.unread)).toBe(
      true,
    );
  });

  it("keeps the record counts consistent with the participation history", () => {
    const attended = volunteer.history.filter((entry) => entry.outcome === "attended");
    const resolved = volunteer.history.filter(
      (entry) => entry.outcome !== "awaiting_confirmation",
    );
    const awaiting = volunteer.history.filter(
      (entry) => entry.outcome === "awaiting_confirmation",
    );
    expect(attended).toHaveLength(volunteer.record.counts.attended);
    expect(resolved).toHaveLength(volunteer.record.counts.acceptedResolved);
    expect(awaiting).toHaveLength(volunteer.record.counts.acceptedUnconfirmed);
    expect(attended.reduce((sum, entry) => sum + (entry.hours ?? 0), 0)).toBe(
      volunteer.record.hours,
    );
  });

  it("dates every record relative to now, so the demo never goes stale", () => {
    for (const opportunity of volunteer.closingSoon) {
      expect(deadlineState(opportunity.applicationDeadline, NOW).kind).not.toBe(
        "passed",
      );
    }
    for (const entry of [...volunteer.activity, ...volunteer.notifications]) {
      expect(new Date(entry.at).getTime()).toBeLessThan(NOW.getTime());
    }
    for (const entry of volunteer.history) {
      expect(new Date(entry.eventDate).getTime()).toBeLessThan(NOW.getTime());
    }
  });

  it("finds an application by id and only then", () => {
    expect(sampleApplication("app-book-drive", NOW)?.status).toBe("draft");
    expect(sampleApplication("nope", NOW)).toBeNull();
  });

  it("never names a real partner or source as an organiser", () => {
    const names = new Set(sampleOpportunities(NOW).map((o) => o.organization.name.en));
    for (const real of [
      "O‘ZLIDEP",
      "Youth Affairs Agency",
      "Yashil Qo‘llar",
      "Youth Run Club",
    ]) {
      expect([...names].some((name) => name.includes(real))).toBe(false);
    }
  });
});
