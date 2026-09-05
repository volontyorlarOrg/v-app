import { describe, expect, it } from "vitest";

import {
  applicationDetailSchema,
  applicationListSchema,
  historySchema,
  meSchema,
  notificationListSchema,
  opportunityDetailSchema,
  opportunityListSchema,
  preferencesSchema,
  profileSchema,
  recordSchema,
  savedListSchema,
} from "@/lib/api/schemas";

const organization = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Volontyorlar",
  slug: "volontyorlar",
  logoUrl: null,
  verified: true,
};

const summary = {
  id: "20000000-0000-4000-8000-000000000001",
  slug: "community-library-day",
  title: "Community library day",
  summary: "Help at a library.",
  organization,
  region: "tashkent-city",
  city: undefined,
  format: "onsite",
  status: "open",
  startsAt: "2026-09-20T05:00:00.000Z",
  endsAt: undefined,
  applicationDeadline: "2026-09-15T18:00:00.000Z",
  imageUrl: undefined,
  capacity: 20,
  spotsRemaining: 19,
};

describe("opportunity schemas", () => {
  it("reads a list exactly as the backend serialises it", () => {
    const parsed = opportunityListSchema.parse({
      items: [summary],
      page: 1,
      pageSize: 12,
      total: 1,
    });
    expect(parsed.items[0]?.organization.logoUrl).toBeUndefined();
    expect(parsed.items[0]?.city).toBeUndefined();
    expect(parsed.total).toBe(1);
  });

  it("renames the backend's detail fields to the interface vocabulary", () => {
    const parsed = opportunityDetailSchema.parse({
      ...summary,
      description: "Long text.",
      requirements: ["Be 16+"],
      locationName: null,
      questions: [
        {
          id: "q1",
          prompt: "Why?",
          helpText: null,
          type: "single_select",
          required: true,
          maxLength: undefined,
          options: [{ value: "a", label: "A" }, { value: "b" }],
        },
      ],
      sourcedByYvc: true,
    });
    expect(parsed.sourcedByTeam).toBe(true);
    expect("sourcedByYvc" in parsed).toBe(false);
    expect(parsed.questions[0]?.helpText).toBeUndefined();
    expect(parsed.questions[0]?.options).toEqual([
      { value: "a", label: "A" },
      { value: "b", label: "b" },
    ]);
  });

  it("rejects a region the interface does not know", () => {
    expect(opportunityListSchema.safeParse({ items: [{ ...summary, region: "atlantis" }], total: 1 }).success).toBe(false);
  });
});

describe("application schemas", () => {
  it("keeps summary dates optional and reads answers of any shape", () => {
    const parsed = applicationDetailSchema.parse({
      id: "30000000-0000-4000-8000-000000000001",
      status: "submitted",
      opportunity: summary,
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z",
      submittedAt: "2026-09-02T10:00:00.000Z",
      answers: [
        { questionId: "q1", value: "text" },
        { questionId: "q2", value: ["a", "b"], prompt: "Pick", type: "multi_select" },
        { questionId: null, value: 5 },
      ],
      profileSnapshot: { fullName: "Dilnoza", region: "tashkent-city", school: "", phone: "", telegram: "d" },
      reviewerNote: undefined,
    });
    expect(parsed.reviewedAt).toBeUndefined();
    expect(parsed.answers.map((answer) => answer.value)).toEqual(["text", ["a", "b"], ""]);
    expect(parsed.answers[1]?.prompt).toBe("Pick");
    expect(parsed.profileSnapshot?.fullName).toBe("Dilnoza");
  });

  it("reads the list envelope", () => {
    const parsed = applicationListSchema.parse({
      items: [
        {
          id: "a",
          status: "draft",
          opportunity: summary,
          createdAt: "2026-09-01T10:00:00.000Z",
          updatedAt: "2026-09-01T10:00:00.000Z",
        },
      ],
      total: 1,
    });
    expect(parsed.items[0]?.status).toBe("draft");
  });
});

describe("account schemas", () => {
  it("reads the profile with a null region", () => {
    const parsed = profileSchema.parse({
      fullName: "Dilnoza Karimova",
      bio: "",
      school: "Lyceum",
      gradeYear: "2",
      region: null,
      city: "",
      languages: ["uz"],
      skills: [],
      phone: "",
      phoneVerified: false,
      telegram: "dilnoza",
      links: [],
      updatedAt: "2026-09-01T10:00:00.000Z",
    });
    expect(parsed.region).toBeNull();
  });

  it("reads /me and ignores the fields it does not use", () => {
    const parsed = meSchema.parse({
      id: "u1",
      displayName: null,
      roles: ["volunteer"],
      createdAt: "2026-09-01T10:00:00.000Z",
      telegramIdentity: { username: null, linkedAt: "2026-09-01T10:00:00.000Z" },
      preferences: { userId: "u1", notifyTelegram: true, createdAt: "x" },
    });
    expect(parsed.displayName).toBeUndefined();
    expect(parsed.telegramIdentity?.username).toBeUndefined();
  });

  it("requires every preference switch", () => {
    expect(preferencesSchema.safeParse({ notifyTelegram: true }).success).toBe(false);
  });
});

describe("record and notification schemas", () => {
  it("reads the record, the history and the saved list", () => {
    expect(
      recordSchema.parse({
        counts: { attended: 5, acceptedResolved: 6, acceptedUnconfirmed: 1, standoutReviews: false },
        hours: undefined,
        hoursVerified: true,
      }).hours,
    ).toBeUndefined();
    expect(
      historySchema.parse({
        items: [
          {
            id: "h1",
            opportunityTitle: "Read-aloud day",
            organization: "Reading Corners",
            eventDate: "2026-06-16T04:00:00.000Z",
            outcome: "attended",
            hours: 3,
          },
        ],
        total: 1,
      }).items[0]?.outcome,
    ).toBe("attended");
    expect(savedListSchema.parse({ items: [summary], total: 1 }).items).toHaveLength(1);
  });

  it("turns the backend's readAt into an unread flag", () => {
    const parsed = notificationListSchema.parse({
      items: [
        {
          id: "n1",
          kind: "application.submitted",
          title: "Application received",
          body: "",
          data: null,
          readAt: null,
          createdAt: "2026-09-01T10:00:00.000Z",
          userId: "u1",
        },
        {
          id: "n2",
          kind: "application.accepted",
          title: "Accepted",
          body: "See you there.",
          readAt: "2026-09-02T10:00:00.000Z",
          createdAt: "2026-09-01T11:00:00.000Z",
        },
      ],
      unread: 1,
    });
    expect(parsed.items.map((item) => item.unread)).toEqual([true, false]);
    expect(parsed.items[0]?.at).toBe("2026-09-01T10:00:00.000Z");
  });
});
