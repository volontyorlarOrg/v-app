import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import {
  ActivitySection,
  type ProfileActivityEntry,
} from "@/components/profile/activity-section";
import messages from "@/i18n/messages/en.json";
import { formats } from "@/i18n/formats";

const attended: ProfileActivityEntry = {
  id: "a1",
  source: "attendance",
  kind: "volunteering",
  title: "City cleanup",
  organization: "Green City",
  eventDate: "2026-09-10T05:00:00.000Z",
  hours: 3,
  placement: null,
  xpAwarded: 30,
  countsTowardProgress: true,
};

const competition: ProfileActivityEntry = {
  id: "a2",
  source: "attendance",
  kind: "competition",
  title: "Youth ideas contest",
  organization: "Ideas Lab",
  eventDate: "2026-08-02",
  hours: null,
  placement: "winner",
  xpAwarded: 50,
  countsTowardProgress: true,
};

const historyOnly: ProfileActivityEntry = {
  id: "m1",
  source: "manual",
  kind: "volunteering",
  title: "Book drive",
  organization: "Readers",
  eventDate: "2026-07-01",
  hours: 2,
  placement: null,
  xpAwarded: 0,
  countsTowardProgress: false,
};

function renderSection(entries: ProfileActivityEntry[], own = false) {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={messages}
      formats={formats}
      timeZone="Asia/Tashkent"
    >
      <ActivitySection entries={entries} own={own} />
    </NextIntlClientProvider>,
  );
}

describe("ActivitySection", () => {
  it("names the section as the volunteer's own and lists each event with what it earned", () => {
    renderSection([attended, competition, historyOnly], true);

    const section = screen.getByRole("region", { name: "My activity" });
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("City cleanup");
    expect(items[0]).toHaveTextContent("Green City · Sep 10, 2026");
    expect(items[1]).toHaveTextContent("Ideas Lab · Aug 2, 2026");
    expect(items[0]).toHaveTextContent("3 h · +30 XP");
    expect(items[1]).toHaveTextContent("Winner · +50 XP");
    expect(items[2]).toHaveTextContent("History only");
    expect(items[2]).not.toHaveTextContent("XP");
  });

  it("is absent on someone else's profile when there is nothing to show", () => {
    const { container } = renderSection([]);
    expect(container).toBeEmptyDOMElement();
  });

  it("tells the volunteer where their activity will appear before the first event", () => {
    renderSection([], true);
    expect(
      screen.getByText("Events you take part in will appear here."),
    ).toBeInTheDocument();
  });

  it("keeps a long history behind one control", () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      ...attended,
      id: `a${index}`,
      title: `Event ${index + 1}`,
    }));
    renderSection(many);

    expect(screen.getByRole("region", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByText("Show all 9")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem", { hidden: true })).toHaveLength(9);
  });
});
