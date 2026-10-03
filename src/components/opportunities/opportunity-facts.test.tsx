import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import { OpportunityFacts } from "@/components/opportunities/opportunity-facts";
import messages from "@/i18n/messages/en.json";
import type { OpportunitySummary } from "@/lib/opportunities/types";

const exhibition: OpportunitySummary = {
  id: "o1",
  slug: "exhibition",
  title: "Exhibition volunteers",
  kind: "volunteering",
  organization: {
    id: "org",
    name: "Youth Volunteer Club",
    slug: "yvc",
    verified: true,
  },
  region: "tashkent-city",
  locationName: "Uzexpocentre",
  format: "onsite",
  status: "open",
  startsAt: "2026-10-12T04:00:00.000Z",
  endsAt: "2026-10-14T08:00:00.000Z",
  applicationDeadline: "2026-10-08T13:00:00.000Z",
  acceptanceMode: "manual",
  essayRequired: true,
};

const days = [
  { date: "2026-10-12", startTime: "09:00", endTime: "13:00" },
  { date: "2026-10-13", startTime: "09:00", endTime: "13:00" },
  { date: "2026-10-14", startTime: "09:00", endTime: "13:00" },
];

function renderFacts(extra: { schedule?: typeof days; allDaysRequired?: boolean }) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="Asia/Tashkent">
      <OpportunityFacts
        opportunity={{ ...exhibition, ...extra }}
        now={new Date("2026-10-01T00:00:00Z")}
      />
    </NextIntlClientProvider>,
  );
}

describe("OpportunityFacts daily time", () => {
  it("shows the daily hours and that every day is required", () => {
    renderFacts({ schedule: days, allDaysRequired: true });
    expect(screen.getByText("Daily time")).toBeInTheDocument();
    expect(
      screen.getByText("09:00–13:00 each day", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("All 3 days required")).toBeInTheDocument();
  });

  it("says when volunteers may come on only some days", () => {
    renderFacts({ schedule: days, allDaysRequired: false });
    expect(screen.getByText("You can come on some of the days")).toBeInTheDocument();
  });

  it("leaves the row out for a vacancy without a schedule", () => {
    renderFacts({});
    expect(screen.queryByText("Daily time")).not.toBeInTheDocument();
  });
});
